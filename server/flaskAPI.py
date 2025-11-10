from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import torch
import numpy as np
from transformers import CLIPProcessor, CLIPModel
import cv2
from sklearn.cluster import KMeans
from rembg import remove
import random

app = Flask(__name__)
CORS(app)

device = "cuda" if torch.cuda.is_available() else "cpu"

model_id = "patrickjohncyh/fashion-clip"
model = CLIPModel.from_pretrained(model_id).to(device)
processor = CLIPProcessor.from_pretrained(model_id)

CLOTHING_TYPES = ["shirt", "t-shirt", "pants", "shorts", "dress", "shoes", "jacket", "skirt"]
OCCASIONS = ["formal", "informal", "sport", "casual"]

# ------------------ UTILIDADES ------------------

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
    return dominant_color.astype(int).tolist()

# ------------------ GENERADOR DE OUTFITS ------------------

COLOR_RULES = {
    "neutral": ["black", "white", "gray", "beige", "denim"],
    "black": ["white", "gray", "red", "beige", "blue"],
    "white": ["black", "blue", "red", "green", "gray"],
    "blue": ["white", "beige", "gray"],
    "red": ["black", "white", "gray"],
    "green": ["white", "black", "brown"],
    "gray": ["white", "black", "blue"],
    "beige": ["white", "brown", "blue"],
}

CATEGORY_MAP = {
    "shirt": "superior",
    "t-shirt": "superior",
    "jacket": "superior",
    "dress": "completo",
    "pants": "inferior",
    "shorts": "inferior",
    "skirt": "inferior",
    "shoes": "calzado"
}

def rgb_to_name(rgb):
    r, g, b = rgb
    if r > 200 and g > 200 and b > 200:
        return "white"
    if r < 50 and g < 50 and b < 50:
        return "black"
    if r > g and r > b:
        return "red"
    if g > r and g > b:
        return "green"
    if b > r and b > g:
        return "blue"
    if abs(r - g) < 20 and abs(g - b) < 20:
        return "gray"
    if r > 180 and g > 160 and b < 100:
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
    return False

def generate_outfits(prendas):
    superiores, inferiores, calzados, completos = [], [], [], []
    print(prendas)
    for p in prendas:
        cat = CATEGORY_MAP.get(p["type"], None)
        if not cat:
            continue
        color_name = rgb_to_name(p["color"])
        item = {
            **p,
            "color_name": color_name,
            "categoria": cat,
            "image": p.get("image")
        }
        if cat == "superior":
            superiores.append(item)
        elif cat == "inferior":
            inferiores.append(item)
        elif cat == "calzado":
            calzados.append(item)
        elif cat == "completo":
            completos.append(item)

    outfits = []

    # ---- Generar combinaciones normales ----
    for comp in completos:
        for c in calzados:
            if color_compatible(comp["color_name"], c["color_name"]) and compatible_ocasion(comp["occasion"], c["occasion"]):
                outfits.append({"completo": comp, "calzado": c})

    for s in superiores:
        for i in inferiores:
            if not color_compatible(s["color_name"], i["color_name"]):
                continue
            if not compatible_ocasion(s["occasion"], i["occasion"]):
                continue
            for c in calzados:
                if not color_compatible(i["color_name"], c["color_name"]):
                    continue
                if not compatible_ocasion(i["occasion"], c["occasion"]):
                    continue
                outfits.append({
                    "superior": s,
                    "inferior": i,
                    "calzado": c
                })

    # ---- Si no se generó nada, elegir aleatoriamente ----
    if not outfits:
        print("⚠️ No se encontraron combinaciones compatibles. Generando aleatorias.")
        if completos and calzados:
            outfits.append({
                "completo": random.choice(completos),
                "calzado": random.choice(calzados)
            })
        elif superiores and inferiores and calzados:
            outfits.append({
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
            if partial:  # solo agregar si contiene algo
                outfits.append(partial)

    # 🔹 Filtrar cualquier outfit vacío antes de retornar
    outfits = [o for o in outfits if any(o.values())]

    return outfits

# ------------------ ENDPOINTS ------------------

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    inputs = processor(
        text=CLOTHING_TYPES,
        images=image,
        return_tensors="pt",
        padding=True
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
        type_index = probs.argmax().item()
        clothing_type = CLOTHING_TYPES[type_index]
        confidence = probs[0][type_index].item()

    inputs2 = processor(
        text=OCCASIONS,
        images=image,
        return_tensors="pt",
        padding=True
    ).to(device)
    with torch.no_grad():
        outputs2 = model(**inputs2)
        logits2 = outputs2.logits_per_image
        probs2 = logits2.softmax(dim=1)
        occ_index = probs2.argmax().item()
        occasion = OCCASIONS[occ_index]
        occ_conf = probs2[0][occ_index].item()

    image_no_bg = remove_background(image)
    avg_color = get_dominant_color(image_no_bg)

    return jsonify({
        "type": clothing_type,
        "type_confidence": confidence,
        "occasion": occasion,
        "occasion_confidence": occ_conf,
        "color": avg_color
    })

@app.route("/generate-outfits", methods=["POST"])
def generate_outfits_endpoint():
    prendas = request.get_json()
    if not isinstance(prendas, list):
        return jsonify({"error": "Debe enviar una lista de prendas"}), 400

    outfits = generate_outfits(prendas)
    return jsonify({"outfits": outfits})

# ------------------ MAIN ------------------
if __name__ == "__main__":
    app.run(port=5000)