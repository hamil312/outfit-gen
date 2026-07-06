from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import os
import torch
from dotenv import load_dotenv

# Carga el .env de la raíz del proyecto (un nivel arriba de server/)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
import numpy as np
from transformers import CLIPProcessor, CLIPModel
import cv2
from sklearn.cluster import KMeans
from rembg import remove
import random
from context_engine import build_context, filter_items_by_context, apply_profile_defaults, filter_items_by_profile
from skin_tone import detect_skin_tone
from body_type import detect_body_type
from body_type_onnx import get_model as get_onnx_model
from compatibility_model import scorer
from profile_rules import filter_items_by_physical_profile
from personality import rerank_by_personality

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"],
    }
})

device = "cuda" if torch.cuda.is_available() else "cpu"

model_id = "patrickjohncyh/fashion-clip"
model = CLIPModel.from_pretrained(model_id).to(device)
processor = CLIPProcessor.from_pretrained(model_id)

scorer.set_clip(model, processor)
print("Available:", scorer.available)       # True si cargó el .pth
print("Model:", scorer.model is not None) 

CLOTHING_TYPES = ["shirt", "t-shirt", "pants", "shorts", "dress", "shoes", "jacket", "skirt"]
PRINTS = ["solid", "striped", "floral", "plaid", "polka dot", "graphic", "animal print", "geometric", "tie-dye", "checkered", "camouflage", "paisley"]
MATERIALS = ["cotton", "denim", "leather", "wool", "polyester", "silk", "linen", "nylon", "velvet", "lace", "chiffon", "knit", "fleece", "suede", "canvas"]

# ── Ensemble prompt groups for weaker dimensions ──
OCCASION_GROUPS = {
    "formal":   ["a formal suit for a business meeting", "an elegant evening gown", "black tie attire", "a tuxedo"],
    "informal": ["a casual everyday outfit", "relaxed home wear", "comfortable lounge clothing"],
    "sport":    ["activewear for the gym", "sportswear for running", "athletic training clothes"],
    "casual":   ["a relaxed weekend outfit", "comfortable daily wear", "a laid-back casual look"],
}

STYLE_GROUPS = {
    "vintage":      ["a vintage retro style outfit", "a classic vintage look", "vintage-inspired clothing"],
    "bohemian":     ["a bohemian boho chic outfit", "flowing hippie style clothing", "boho chic fashion"],
    "minimalist":   ["a minimalist clean aesthetic outfit", "simple modern minimalist style", "minimalist sleek design"],
    "streetwear":   ["urban streetwear style", "street fashion casual cool", "hypebeast streetwear outfit"],
    "preppy":       ["a preppy ivy league style", "classic preppy college outfit", "preppy sophisticated look"],
    "classic":      ["a timeless classic elegant outfit", "classic sophisticated fashion", "traditional classic style"],
    "edgy":         ["an edgy punk rock style", "dark alternative fashion", "edgy modern avant-garde look"],
    "romantic":     ["a romantic feminine outfit", "soft delicate romantic style", "romantic lace details"],
    "retro":        ["a retro throwback style", "retro inspired vintage look", "1950s retro fashion"],
    "avant-garde":  ["avant-garde experimental fashion", "cutting edge artistic clothing", "runway avant-garde design"],
    "punk":         ["punk rock style clothing", "rebellious punk aesthetic", "punk fashion with leather"],
    "nautical":     ["a nautical seaside style", "maritime sailor inspired fashion", "nautical striped navy look"],
}


def ensemble_classify(groups, logits_slice):
    """
    Given a dict {label: [prompts, ...]} and a logits tensor of shape [1, total_prompts],
    average logits per group and return (winning_label, confidence).
    """
    offsets = []
    for prompts in groups.values():
        offsets.append(len(prompts))
    # Split logits by group
    split_logits = torch.split(logits_slice, offsets, dim=1)
    group_means = torch.stack([sl.mean(dim=1) for sl in split_logits], dim=1)  # [1, n_groups]
    probs = group_means.softmax(dim=1)
    idx = probs.argmax().item()
    label = list(groups.keys())[idx]
    return label, probs[0, idx].item()

def remove_background(image):
    """Elimina el fondo manteniendo transparencia."""
    image = image.copy()
    image.thumbnail((512, 512))
    output = remove(image)

    if not isinstance(output, Image.Image):
        output = Image.open(io.BytesIO(output))
    return output.convert("RGBA")

def get_dominant_color(image, k=3):
    """Detecta el color dominante ignorando fondos transparentes."""
    try:
        img = np.array(image)
        if img.shape[-1] == 4:
            mask = img[:, :, 3] > 0
            img = img[mask]
            img = img[:, :3]
        if len(img) == 0:
            return [0, 0, 0]

        img = cv2.resize(img.reshape(-1, 1, 3), (1, 150)).reshape(-1, 3)
        img = np.float32(img)

        kmeans = KMeans(n_clusters=k, n_init=10)
        kmeans.fit(img)

        colors = kmeans.cluster_centers_
        counts = np.bincount(kmeans.labels_)
        dominant_color = colors[np.argmax(counts)]

        return dominant_color.tolist()
    except Exception as e:
        print(f"Error in get_dominant_color: {e}")
        return [0, 0, 0]


COLOR_RULES = {
    "neutral": ["black", "white", "gray", "beige", "denim", "brown", "navy"],
    "black": ["white", "gray", "red", "beige", "blue", "black", "pink", "purple", "orange", "brown", "navy", "yellow", "green"],
    "white": ["black", "blue", "red", "green", "gray", "pink", "purple", "orange", "brown", "navy", "yellow", "beige"],
    "blue": ["white", "beige", "gray", "black", "navy", "yellow"],
    "red": ["black", "white", "gray", "beige"],
    "green": ["white", "black", "brown", "blue", "beige", "yellow"],
    "gray": ["white", "black", "blue", "red", "beige", "pink", "purple", "navy", "yellow"],
    "beige": ["white", "brown", "blue", "black", "green", "navy", "yellow", "gray"],
    "yellow": ["white", "black", "blue", "gray", "beige", "green"],
    "pink": ["white", "black", "gray", "beige", "purple", "blue"],
    "purple": ["white", "black", "gray", "beige", "pink", "blue"],
    "orange": ["white", "black", "gray", "beige", "brown", "blue"],
    "brown": ["white", "beige", "green", "blue", "orange", "black", "gray", "yellow"],
    "navy": ["white", "beige", "gray", "blue", "black", "red", "green", "yellow", "pink"],
}

CATEGORY_MAP = {
    "shirt": "superior",
    "t-shirt": "superior",
    "jacket": "superior",
    "top": "superior",
    "dress": "completo",
    "pants": "inferior",
    "shorts": "inferior",
    "skirt": "inferior",
    "shoes": "calzado"
}

def _categorize(type_str):
    """Look up category case-insensitively, fall back to None."""
    return CATEGORY_MAP.get(type_str.strip().lower()) if type_str else None

MATERIAL_RULES = {
    "cotton": ["denim", "linen", "polyester", "knit", "wool"],
    "denim": ["cotton", "knit", "leather", "wool"],
    "leather": ["denim", "cotton", "silk", "lace", "wool"],
    "wool": ["cotton", "silk", "linen", "denim"],
    "polyester": ["cotton", "nylon", "fleece", "knit"],
    "silk": ["cotton", "lace", "velvet", "chiffon", "wool"],
    "linen": ["cotton", "wool", "silk"],
    "nylon": ["polyester", "fleece", "cotton"],
    "velvet": ["silk", "lace", "cotton", "chiffon"],
    "lace": ["silk", "cotton", "velvet", "leather"],
    "chiffon": ["silk", "cotton", "lace", "velvet"],
    "knit": ["cotton", "denim", "wool", "fleece"],
    "fleece": ["cotton", "polyester", "nylon", "knit"],
    "suede": ["leather", "cotton", "wool", "silk"],
    "canvas": ["denim", "cotton", "leather", "wool"],
}

MATERIAL_WEIGHT = {
    "leather": 10, "denim": 9, "wool": 8, "fleece": 7, "velvet": 7,
    "knit": 6, "canvas": 6, "suede": 6, "nylon": 5, "polyester": 5,
    "cotton": 4, "linen": 3, "lace": 2, "chiffon": 2, "silk": 1,
}

def compatible_material(m1, m2):
    if m1 == m2:
        return True
    if m1 == "unknown" or m2 == "unknown":
        return True
    allowed = MATERIAL_RULES.get(m1, [])
    return m2 in allowed

NEUTRAL_COLORS = {"white", "black", "beige", "gray", "neutral", "navy", "brown"}

def prints_ok(a, b, rule):
    """Check print compatibility between two items.
    rule=None: no check. rule='same': must have same print. rule='solid': printed+others solid neutral.
    """
    if rule is None:
        return True
    pa = a.get("print", "solid").lower()
    pb = b.get("print", "solid").lower()
    if rule == "same":
        return pa == pb
    if rule == "solid":
        # Both printed → must match
        if pa != "solid" and pb != "solid":
            return pa == pb
        # One printed, other must be solid with neutral color
        if pa != "solid":
            return pb == "solid" and b.get("color_name") in NEUTRAL_COLORS
        if pb != "solid":
            return pa == "solid" and a.get("color_name") in NEUTRAL_COLORS
        return True  # both solid
    return True

def rgb_to_name(rgb):
    if isinstance(rgb, str):
        return rgb

    r, g, b = rgb

    if r < 40 and g < 40 and b < 40:
        return "black"
    if r > 220 and g > 220 and b > 220:
        return "white"
    if abs(r - g) < 20 and abs(g - b) < 20:
        return "gray"
    if r > 150 and g < 100 and b < 100:
        return "red"
    if r > 200 and g > 80 and g < 150 and b < 70 and r - g > 40:
        return "orange"
    if r > 150 and g > 150 and b < 80:
        return "yellow"
    if r > 200 and b > 120 and g > 80 and g < 200 and r - g > 30:
        return "pink"
    if g > 120 and r < 120 and b < 120:
        return "green"
    if b > 140 and r < 120 and g < 120:
        return "blue"
    if r < 70 and g < 70 and b > 80:
        return "navy"
    if r > 80 and b > 100 and g < 100:
        return "purple"
    if r > 70 and r < 200 and g < 90 and b < 70 and r > g:
        return "brown"
    if r > 120 and g > 100 and b < 80:
        return "beige"

    return "neutral"

def color_compatible(c1, c2):
    if c1 == c2:
        return True
    allowed = COLOR_RULES.get(c1, [])
    return c2 in allowed

def compatible_ocasion(o1, o2):
    if o1 == o2:
        return True
    if "neutral" in [o1, o2]:
        return True
    if {"informal", "casual"} == {o1, o2}:
        return True
    return False

def _match_outfits(superiores, inferiores, calzados, completos,
                   strict_material=False, balance=False, print_rule=None):
    """Build outfit combinations with optional material/print constraints."""
    outfits = []

    for comp in completos:
        for c in calzados:
            if not color_compatible(comp["color_name"], c["color_name"]):
                continue
            if not compatible_ocasion(comp.get("occasion", "neutral"), c.get("occasion", "neutral")):
                continue
            if strict_material and comp.get("material") != c.get("material"):
                continue
            if not prints_ok(comp, c, print_rule):
                continue
            outfits.append({"completo": comp, "calzado": c})

    for s in superiores:
        for i in inferiores:
            if not color_compatible(s["color_name"], i["color_name"]):
                continue
            if not compatible_ocasion(s.get("occasion", "neutral"), i.get("occasion", "neutral")):
                continue
            if strict_material and s.get("material") != i.get("material"):
                continue
            if balance:
                sw = MATERIAL_WEIGHT.get(s.get("material", "unknown"), 0)
                iw = MATERIAL_WEIGHT.get(i.get("material", "unknown"), 0)
                if sw <= iw:
                    continue
            if not prints_ok(s, i, print_rule):
                continue
            for c in calzados:
                if not color_compatible(i["color_name"], c["color_name"]):
                    continue
                if not compatible_ocasion(i.get("occasion", "neutral"), c.get("occasion", "neutral")):
                    continue
                if strict_material and s.get("material") != c.get("material"):
                    continue
                if not prints_ok(s, c, print_rule):
                    continue
                outfits.append({
                    "superior": s, "inferior": i, "calzado": c
                })

    return outfits

def generate_outfits(prendas, style=None, material_matching=False, material_balance=False,
                     target_material=None, print_matching=False, target_print=None,
                     full_ml=False):
    """Generate outfits with optional style filter, material and print constraints."""

    # ── Style filter ──
    if style and style.lower() != "any":
        prendas = [p for p in prendas if p.get("style", "").lower() == style.lower()]

    # ── Categorize ──
    superiores, inferiores, calzados, completos = [], [], [], []
    for p in prendas:
        cat = _categorize(p.get("type", ""))
        if not cat:
            continue
        color_name = rgb_to_name(p["color"])
        item = {
            "$id": p.get("$id"), **p,
            "color_name": color_name,
            "categoria": cat,
            "image": p.get("image")
        }
        if cat == "superior":     superiores.append(item)
        elif cat == "inferior":   inferiores.append(item)
        elif cat == "calzado":    calzados.append(item)
        elif cat == "completo":   completos.append(item)

    # ── Filter items by material / print target ──
    if target_material and target_material.lower() != "any":
        tm = target_material.lower()
        superiores = [s for s in superiores if s.get("material", "unknown").lower() == tm]
        completos  = [c for c in completos  if c.get("material", "unknown").lower() == tm]
    if target_print and target_print.lower() != "any":
        tp = target_print.lower()
        superiores = [s for s in superiores if s.get("print", "solid").lower() == tp]
        completos  = [c for c in completos  if c.get("print", "solid").lower() == tp]

    # ── Full ML mode: skip rule-based filtering, score all combos with ML ──
    if full_ml and scorer.available:
        all_combos = []
        for s in superiores:
            for i in inferiores:
                for c in calzados:
                    all_combos.append({"superior": s, "inferior": i, "calzado": c})
        for comp in completos:
            for c in calzados:
                all_combos.append({"completo": comp, "calzado": c})

        if not all_combos:
            return [], False

        scored = scorer.rank_outfits(all_combos)
        for i, (score, o) in enumerate(scored[:5]):
            print(f"[ML-Full] Outfit {i+1} | score={score:.4f} | items: {', '.join(o.get(s, {}).get('type','?') for s in ('superior','inferior','calzado','completo') if s in o)}")
        return [o for _, o in scored[:5]], False

    outfits = []

    # ── Try progressively relaxed combinations ──
    combo_list = []
    if material_matching and print_matching:
        combo_list = [(True, "same"), (True, "solid"), (False, "same"), (False, "solid")]
    elif material_matching:
        combo_list = [(True, None), (False, None)]
    elif print_matching:
        combo_list = [(False, "same"), (False, "solid")]
    combo_list.append((False, None))  # ultimate fallback

    for strict_mat, pr_rule in combo_list:
        outfits = _match_outfits(superiores, inferiores, calzados, completos,
                                strict_material=strict_mat, balance=material_balance if strict_mat else False,
                                print_rule=pr_rule)
        if outfits:
            break

    was_fallback = False

    # ── Fallback ──
    if not outfits:
        best = []

        # Level 1: best-effort with color compatibility
        if completos and calzados:
            for c in completos:
                for z in calzados:
                    if color_compatible(c["color_name"], z["color_name"]):
                        best.append({"completo": c, "calzado": z})
        if not best and superiores and inferiores and calzados:
            for s in superiores:
                for i in inferiores:
                    if not color_compatible(s["color_name"], i["color_name"]):
                        continue
                    for z in calzados:
                        if color_compatible(i["color_name"], z["color_name"]):
                            best.append({"superior": s, "inferior": i, "calzado": z})

        # Level 2: any available combination (no compatibility check)
        if not best:
            if completos and calzados:
                best.append({"completo": random.choice(completos), "calzado": random.choice(calzados)})
            elif superiores and inferiores and calzados:
                best.append({
                    "superior": random.choice(superiores),
                    "inferior": random.choice(inferiores),
                    "calzado": random.choice(calzados)
                })
            else:
                partial = {}
                if superiores: partial["superior"] = random.choice(superiores)
                if inferiores: partial["inferior"] = random.choice(inferiores)
                if calzados: partial["calzado"] = random.choice(calzados)
                if completos: partial["completo"] = random.choice(completos)
                if partial: best.append(partial)

        if best:
            outfits.append(random.choice(best))
            was_fallback = True

    outfits = [o for o in outfits if any(o.values())]

    # Re-rank by ML compatibility score if model available
    if scorer.available and outfits:
        scored = scorer.rank_outfits(outfits)
        outfits = [o for _, o in scored]
        for i, (score, o) in enumerate(scored[:5]):
            print(f"[ML] Outfit {i+1} | score={score:.4f} | items: {', '.join(o.get(s, {}).get('type','?') for s in ('superior','inferior','calzado','completo') if s in o)}")

    return outfits, was_fallback


def _classify_simple(labels, logits_slice):
    """Single-prompt classification: return (best_label, confidence)."""
    probs = logits_slice.softmax(dim=1)
    idx = probs.argmax().item()
    return labels[idx], probs[0, idx].item()


@app.route("/api/context", methods=["POST"])
def context_endpoint():
    data = request.get_json() or {}
    lat = data.get("lat")
    lon = data.get("lon")
    ctx = build_context(lat=lat, lon=lon)
    return jsonify(ctx)

@app.route("/analyze-skin-tone", methods=["POST"])
def analyze_skin_tone_endpoint():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    image_bytes = file.read()
    result = detect_skin_tone(image_bytes)
    return jsonify(result)

@app.route("/analyze-body-type", methods=["POST"])
def analyze_body_type_endpoint():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    image_bytes = file.read()
    result = detect_body_type(image_bytes)
    return jsonify(result)

@app.route("/classify-body-type", methods=["POST"])
def classify_body_type_onnx():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    model_variant = request.form.get("model", "default")
    if model_variant not in ("default", "20_perc"):
        return jsonify({"error": "Model must be 'default' or '20_perc'"}), 400
    image_bytes = file.read()
    model = get_onnx_model(model_variant)
    result = model.predict(image_bytes)
    return jsonify(result)

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # ── Build flat prompt list ──
    # Order: types, prints, materials, occasion_prompts*, style_prompts*
    occ_all_prompts = []
    for prompts in OCCASION_GROUPS.values():
        occ_all_prompts.extend(prompts)
    sty_all_prompts = []
    for prompts in STYLE_GROUPS.values():
        sty_all_prompts.extend(prompts)

    all_texts = CLOTHING_TYPES + PRINTS + MATERIALS + occ_all_prompts + sty_all_prompts
    n_types = len(CLOTHING_TYPES)
    n_prt   = len(PRINTS)
    n_mat   = len(MATERIALS)
    n_occ   = len(occ_all_prompts)

    inputs = processor(text=all_texts, images=image, return_tensors="pt", padding=True).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits_per_image  # [1, total]

        off = 0
        # Type (simple)
        clothing_type, type_confidence = _classify_simple(
            CLOTHING_TYPES, logits[:, off:off+n_types])
        off += n_types

        # Print (simple)
        print_label, print_confidence = _classify_simple(
            PRINTS, logits[:, off:off+n_prt])
        off += n_prt

        # Material (simple)
        material_label, material_confidence = _classify_simple(
            MATERIALS, logits[:, off:off+n_mat])
        off += n_mat

        # Occasion (ensemble)
        occasion, occ_confidence = ensemble_classify(
            OCCASION_GROUPS, logits[:, off:off+n_occ])
        off += n_occ

        # Style (ensemble)
        style_label, style_confidence = ensemble_classify(
            STYLE_GROUPS, logits[:, off:off+len(sty_all_prompts)])

    image_no_bg = remove_background(image)
    avg_color = get_dominant_color(image_no_bg)

    return jsonify({
        "type": clothing_type,
        "type_confidence": type_confidence,
        "occasion": occasion,
        "occasion_confidence": occ_confidence,
        "print": print_label,
        "print_confidence": print_confidence,
        "style": style_label,
        "style_confidence": style_confidence,
        "material": material_label,
        "material_confidence": material_confidence,
        "color": avg_color,
        "color_name": rgb_to_name(avg_color)
    })

@app.route("/generate-outfits", methods=["POST"])
def generate_outfits_endpoint():
    data = request.get_json()

    if isinstance(data, list):
        outfits, was_fallback = generate_outfits(data)
        return jsonify({"outfits": outfits, "fallback": was_fallback})

    items = list(data.get("items", []))
    style = data.get("style")
    context = data.get("context")
    profile = data.get("profile")

    style = apply_profile_defaults(profile, style)

    if context:
        lat = context.get("lat")
        lon = context.get("lon")
        weather_ctx = build_context(lat=lat, lon=lon)
        items = filter_items_by_context(items, weather_ctx)

    if profile:
        items = filter_items_by_profile(items, profile)
        items = filter_items_by_physical_profile(items, profile)

    outfits, was_fallback = generate_outfits(
        items,
        style=style,
        material_matching=data.get("material_matching", False),
        material_balance=data.get("material_balance", False),
        target_material=data.get("material"),
        print_matching=data.get("print_matching", False),
        target_print=data.get("print"),
        full_ml=data.get("full_ml", False),
    )

    outfits = rerank_by_personality(outfits, profile)

    return jsonify({"outfits": outfits, "fallback": was_fallback})

@app.route("/generate-outfit-with-base", methods=["POST"])
def generate_outfit_with_base():
    body = request.get_json()
    base_item = body.get("base_item")
    all_items = body.get("all_items")
    material_matching = body.get("material_matching", False)
    material_balance  = body.get("material_balance", False)
    print_matching    = body.get("print_matching", False)
    context = body.get("context")
    profile = body.get("profile")

    if context:
        lat = context.get("lat")
        lon = context.get("lon")
        weather_ctx = build_context(lat=lat, lon=lon)
        all_items = filter_items_by_context(all_items, weather_ctx)

    if profile:
        all_items = filter_items_by_profile(all_items, profile)
        all_items = filter_items_by_physical_profile(all_items, profile)

    if not base_item or not all_items:
        return jsonify({"error": "base_item y all_items son obligatorios"}), 400

    base_cat = _categorize(base_item.get("type", ""))
    base_color = rgb_to_name(base_item["color"])
    base_occasion = base_item.get("occasion", "neutral")
    base_material = base_item.get("material", "unknown")
    base_print    = base_item.get("print", "solid")

    superiores, inferiores, calzados = [], [], []

    for p in all_items:
        cat = _categorize(p.get("type", ""))
        if not cat:
            continue
        color = rgb_to_name(p["color"])
        item = { **p, "color_name": color }
        if cat == "superior":   superiores.append(item)
        elif cat == "inferior": inferiores.append(item)
        elif cat == "calzado":  calzados.append(item)

    def pick_basic(candidates, _=None):
        """Color compatibility."""
        ok = [x for x in candidates
              if color_compatible(base_color, x["color_name"])]
        return random.choice(ok) if ok else (random.choice(candidates) if candidates else None)

    def pick_with_constraints(candidates, target_cat):
        """Pick respecting material + print constraints, with fallbacks."""
        if not candidates:
            return None

        # Priority 1: same material AND print-ok
        p1 = [x for x in candidates
              if color_compatible(base_color, x["color_name"])
              and (not material_matching or x.get("material", "unknown") == base_material)
              and (not print_matching or prints_ok(base_item, x, "same"))]
        if target_cat == "inferior" and material_balance and p1:
            p1.sort(key=lambda x: MATERIAL_WEIGHT.get(x.get("material", "unknown"), 0))
            return p1[0]
        if p1:
            return random.choice(p1)

        # Priority 2: same material, ignore print
        p2 = [x for x in candidates
              if color_compatible(base_color, x["color_name"])
              and (not material_matching or x.get("material", "unknown") == base_material)]
        if target_cat == "inferior" and material_balance and p2:
            p2.sort(key=lambda x: MATERIAL_WEIGHT.get(x.get("material", "unknown"), 0))
            return p2[0]
        if p2:
            return random.choice(p2)

        # Priority 3: print-ok (solid+neutral for printed base), any material
        p3 = [x for x in candidates
              if color_compatible(base_color, x["color_name"])
              and (not print_matching or prints_ok(base_item, x, "solid"))]
        if p3:
            return random.choice(p3)

        # Fallback: any color
        return pick_basic(candidates)

    outfit = { base_cat: base_item }
    use_constraints = material_matching or print_matching
    pick = pick_with_constraints if use_constraints else pick_basic

    # ── Filter each slot by occasion first (respects user's context choice) ──
    def _by_occasion(items):
        matched = [x for x in items if compatible_ocasion(base_occasion, x.get("occasion", "neutral"))]
        return matched if matched else items  # fallback to all if none match

    if base_cat == "superior":
        outfit["inferior"] = pick(_by_occasion(inferiores), "inferior")
        outfit["calzado"]  = pick(_by_occasion(calzados), "calzado")
    elif base_cat == "inferior":
        outfit["superior"] = pick(_by_occasion(superiores), "superior")
        outfit["calzado"]  = pick(_by_occasion(calzados), "calzado")
    elif base_cat == "calzado":
        outfit["superior"] = pick(_by_occasion(superiores), "superior")
        outfit["inferior"] = pick(_by_occasion(inferiores), "inferior")
    else:
        return jsonify({"error": "Tipo de prenda no soportado para base"}), 400

    # Score with compatibility model
    if scorer.available:
        items = [v for k, v in outfit.items() if k in ("superior", "inferior", "calzado", "completo")]
        comp_score = scorer.score_outfit_from_items(items)
        outfit["compatibility_score"] = round(comp_score, 4)
        print(f"[ML] Base-outfit | score={comp_score:.4f} | items: {', '.join(i.get('type','?') for i in items)}")

    outf = rerank_by_personality([outfit], profile)
    return jsonify({ "outfit": outf[0] if outf else outfit })

from profile_refiner import register_profile_routes
register_profile_routes(app)

from wardrobe_analyzer import wardrobe_bp
app.register_blueprint(wardrobe_bp)

from wardrobe_chatbot import chatbot_bp
app.register_blueprint(chatbot_bp)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)