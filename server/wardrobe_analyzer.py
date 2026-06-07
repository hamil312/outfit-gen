from flask import Blueprint, request, jsonify
from collections import Counter
from urllib.parse import quote_plus
import requests

wardrobe_bp = Blueprint("wardrobe", __name__)

OCCASIONS = ["formal", "informal", "casual", "sport"]

CATEGORY_MAP = {
    "shirt": "superior", "t-shirt": "superior", "jacket": "superior", "top": "superior",
    "dress": "completo",
    "pants": "inferior", "shorts": "inferior", "skirt": "inferior",
    "shoes": "calzado",
}

def _cat(type_str):
    return CATEGORY_MAP.get((type_str or "").strip().lower())

def _occasion_ok(item_occ, target):
    """True if an item is usable for a target occasion."""
    if not item_occ or item_occ in ("neutral", "unknown"):
        return True
    if item_occ == target:
        return True
    if {item_occ, target} == {"casual", "informal"}:
        return True
    return False


# ── Layer 1: análisis completo del guardarropa ────────────────────────────────

@wardrobe_bp.route("/analyze-wardrobe", methods=["POST"])
def analyze_wardrobe():
    data   = request.get_json() or {}
    clothes = data.get("clothes", [])

    by_slot = {"superior": [], "inferior": [], "calzado": [], "completo": []}
    for c in clothes:
        cat = _cat(c.get("type", ""))
        if cat:
            by_slot[cat].append(c)

    # Cobertura de slots por ocasión
    occasion_slot_coverage = {}
    for occ in OCCASIONS:
        sup  = [c for c in by_slot["superior"] if _occasion_ok(c.get("occasion"), occ)]
        inf  = [c for c in by_slot["inferior"] if _occasion_ok(c.get("occasion"), occ)]
        cal  = [c for c in by_slot["calzado"]  if _occasion_ok(c.get("occasion"), occ)]
        comp = [c for c in by_slot["completo"] if _occasion_ok(c.get("occasion"), occ)]

        can_standard = len(sup) > 0 and len(inf) > 0 and len(cal) > 0
        can_completo = len(comp) > 0 and len(cal) > 0

        missing = []
        if not can_standard and not can_completo:
            if not sup and not comp:
                missing.append("superior")
            if not inf and not comp:
                missing.append("inferior")
            if not cal:
                missing.append("calzado")

        occasion_slot_coverage[occ] = {
            "can_make_outfit": can_standard or can_completo,
            "missing_slots":   missing,
            "counts": {
                "superior": len(sup),
                "inferior": len(inf),
                "calzado":  len(cal),
                "completo": len(comp),
            },
        }

    # Distribuciones completas
    color_dist  = dict(Counter(c.get("color", "unknown").lower() for c in clothes).most_common(10))
    occ_dist    = dict(Counter(c.get("occasion", "unknown").lower() for c in clothes).most_common())
    mat_dist    = dict(Counter(
        c.get("material", "unknown").lower() for c in clothes
        if c.get("material", "unknown") not in ("unknown", "")
    ).most_common(8))
    style_dist  = dict(Counter(
        c.get("style", "unknown").lower() for c in clothes
        if c.get("style", "unknown") not in ("unknown", "")
    ).most_common(8))

    # Carencias globales de slot
    gaps = []
    for slot, items in by_slot.items():
        if len(items) == 0:
            gaps.append({"slot": slot, "severity": "critical"})
        elif len(items) < 2:
            gaps.append({"slot": slot, "severity": "warning"})

    return jsonify({
        "total": len(clothes),
        "category_counts": {s: len(it) for s, it in by_slot.items()},
        "occasion_slot_coverage": occasion_slot_coverage,
        "color_distribution":    color_dist,
        "occasion_distribution": occ_dist,
        "material_distribution": mat_dist,
        "style_distribution":    style_dist,
        "gaps": gaps,
    })


# ── Layer 2: recomendación basada en coordenadas de perfil ───────────────────

HM_TERMS = {
    "superior": {"formal": "camisa formal", "informal": "camiseta",   "casual": "camiseta casual",    "sport": "camiseta deportiva"},
    "inferior": {"formal": "pantalón",       "informal": "pantalón",   "casual": "jeans",              "sport": "mallas deportivas"},
    "calzado":  {"formal": "zapatos",          "informal": "zapatos",    "casual": "zapatos casual",     "sport": "zapatos deporte"},
    "completo": {"formal": "vestido formal",  "informal": "vestido",    "casual": "vestido",            "sport": "mono deportivo"},
}

SLOT_LABELS = {"superior": "superior", "inferior": "inferior", "calzado": "calzado", "completo": "prenda completa"}
OCC_LABELS  = {"formal": "formal", "casual": "casual", "informal": "informal", "sport": "deportivo"}

@wardrobe_bp.route("/recommend-items", methods=["POST"])
def recommend_items():
    data    = request.get_json() or {}
    clothes = data.get("clothes", [])
    profile = data.get("profile", {})
    gender  = (data.get("gender") or "male").lower()

    formality         = float(profile.get("coord_formality",        0.5))
    risk              = float(profile.get("coord_risk",             0.5))
    color_intensity   = float(profile.get("coord_colorIntensity",   0.5))
    trend_orientation = float(profile.get("coord_trendOrientation", 0.5))

    # Ocasión objetivo según formalidad
    if formality > 0.65:
        target_occ = "formal"
    elif formality < 0.35:
        target_occ = "casual"
    else:
        target_occ = "informal"

    # Categorizar prendas por slot
    by_slot: dict[str, list] = {"superior": [], "inferior": [], "calzado": [], "completo": []}
    for c in clothes:
        cat = _cat(c.get("type", ""))
        if cat:
            by_slot[cat].append(c)

    # Contar prendas útiles para la ocasión objetivo por slot
    slot_counts = {
        slot: sum(1 for c in items if _occasion_ok(c.get("occasion"), target_occ))
        for slot, items in by_slot.items()
    }

    # ── Slots débiles: todos los que tienen < 2 prendas para la ocasión ──────
    # Para hombres se omite "completo" (vestidos) ya que no aplica.
    PRIORITY = ("calzado", "inferior", "superior", "completo")
    considered = [s for s in PRIORITY if not (gender == "male" and s == "completo")]
    weak_slots = [s for s in considered if slot_counts.get(s, 0) < 2]
    # Si ninguno es débil, recomendar el de menor count entre los considerados
    if not weak_slots:
        weak_slots = [min(considered, key=lambda s: slot_counts.get(s, 0))]

    # Color recomendado (global, basado en perfil + lo que ya tiene)
    existing_colors = Counter(c.get("color", "neutral").lower() for c in clothes)
    if color_intensity > 0.65:
        candidates = ["red", "blue", "green", "orange", "purple", "yellow"]
    elif color_intensity < 0.35:
        candidates = ["black", "white", "beige", "gray"]
    else:
        candidates = ["navy", "beige", "gray", "white", "blue"]
    recommended_color = min(candidates, key=lambda c: existing_colors.get(c, 0))

    # Estilo según coordenadas
    if trend_orientation > 0.65 and risk > 0.5:
        style = "streetwear"
    elif formality > 0.6:
        style = "classic"
    elif risk > 0.65:
        style = "edgy"
    else:
        style = "casual"

    # Generar una recomendación por cada slot débil
    recommendations = []
    for target_slot in weak_slots:
        count       = slot_counts.get(target_slot, 0)
        search_term = HM_TERMS.get(target_slot, {}).get(target_occ, target_slot)
        s_label     = SLOT_LABELS.get(target_slot, target_slot)
        o_label     = OCC_LABELS.get(target_occ, target_occ)

        if count == 0:
            reason = (f"No tienes {s_label} para looks {o_label}. "
                      f"Agregar esta pieza desbloqueará outfits completos en esa ocasión.")
        elif count == 1:
            reason = (f"Solo tienes 1 {s_label} {o_label}. "
                      f"Una segunda pieza duplicaría tus combinaciones para esa ocasión.")
        else:
            reason = (f"Añadir {s_label} de color {recommended_color} complementaría tu "
                      f"armario {o_label} y ampliaría tus combinaciones.")

        recommendations.append({
            "category":    target_slot,
            "search_term": search_term,
            "color":       recommended_color,
            "occasion":    target_occ,
            "style":       style,
            "reason":      reason,
            "slot_count":  count,
        })

    return jsonify({"recommendations": recommendations})


# ── Layer 3: DummyJSON fake store API ────────────────────────────────────────
# https://dummyjson.com/docs/products
# DummyJSON tiene exactamente 5 productos por categoría de ropa:
#   mens-shirts (83-87), tops (162-166, son frocks), mens-shoes (88-92),
#   womens-shoes (185-189), womens-dresses (177-181)
# No tiene pantalones/jeans → para inferior solo mostramos links a tiendas reales.

_DUMMYJSON = "https://dummyjson.com/products"

_COLOR_ES: dict[str, str] = {
    "black": "negro", "white": "blanco", "gray": "gris", "grey": "gris",
    "navy": "azul marino", "blue": "azul", "red": "rojo", "green": "verde",
    "yellow": "amarillo", "orange": "naranja", "pink": "rosa", "purple": "morado",
    "beige": "beige", "brown": "marrón", "neutral": "",
}


def _parse_products(raw: list) -> list:
    products = []
    for p in raw:
        name = p.get("title", "")
        if not name:
            continue
        products.append({
            "name":   name,
            "price":  f"${p.get('price', '')}",
            "brand":  p.get("brand", ""),
            "rating": round(float(p.get("rating", 0) or 0), 1),
            "image":  p.get("thumbnail", ""),
            "url":    "",
        })
    return products


def _fetch_category(category: str) -> list:
    try:
        r = requests.get(f"{_DUMMYJSON}/category/{category}", timeout=10)
        print(f"[DummyJSON] category={category} status={r.status_code}")
        return _parse_products(r.json().get("products", [])) if r.status_code == 200 else []
    except Exception as e:
        print(f"[DummyJSON] error fetching {category}: {e}")
        return []


def _color_sort(products: list, color: str) -> list:
    """Sube al principio los productos cuyo nombre mencione el color recomendado."""
    color_lower = color.lower()
    def rank(p: dict) -> int:
        return 0 if color_lower in p.get("name", "").lower() else 1
    return sorted(products, key=rank)


# Categoría de DummyJSON por (slot, género). None = sin catálogo apropiado → solo links.
#   male:   calzado→mens-shoes, superior→mens-shirts, completo→None (no aplica vestidos)
#   female: calzado→womens-shoes, superior→tops, completo→womens-dresses
_GENDER_CATEGORY: dict[str, dict[str, "str | None"]] = {
    "male": {
        "calzado":  "mens-shoes",
        "superior": "mens-shirts",
        "inferior": None,            # DummyJSON no tiene pantalones
        "completo": None,            # los hombres no usan vestidos
    },
    "female": {
        "calzado":  "womens-shoes",
        "superior": "tops",
        "inferior": None,            # DummyJSON no tiene pantalones
        "completo": "womens-dresses",
    },
}


def _fetch_dummyjson(slot: str, occasion: str, color: str = "", gender: str = "male") -> list:
    """
    Devuelve productos de muestra de DummyJSON según slot, ocasión y género.
    El género determina la categoría: zapatos de hombre vs mujer, camisas vs tops, etc.
    Para slots sin catálogo (inferior, o completo en hombres) devuelve [] → solo links.
    """
    gender   = gender if gender in _GENDER_CATEGORY else "male"
    category = _GENDER_CATEGORY[gender].get(slot)
    if not category:
        return []

    products = _fetch_category(category)
    return _color_sort(products, color) if color else products


def _build_store_links(search_term: str, color: str = "",
                       gender: str = "male", slot: str = "") -> list:
    gender_es    = "hombre" if gender == "male" else "mujer"
    gender_path  = gender_es                        # Zalando: /hombre/ o /mujer/
    zara_section = "MAN" if gender == "male" else "WOMAN"
    color_es     = _COLOR_ES.get(color.lower(), color) if color else ""

    # quote_plus → espacios como '+', que es lo que piden H&M y ASOS
    q = quote_plus(f"{search_term} {gender_es} {color_es}".strip())

    return [
        {
            "store": "Zara",
            "url": f"https://www.zara.com/es/es/search?searchTerm={q}&section={zara_section}",
        },
        {
            "store": "H&M",
            "url": f"https://co.hm.com/s?q={q}&fuzzy=0&operator=and&facets=fuzzy%2Coperator&sort=score_desc&page=0",
        },
        {
            "store": "Zalando",
            "url": f"https://www.zalando.es/{gender_path}/?q={q}",
        },
    ]


@wardrobe_bp.route("/search-store", methods=["POST"])
def search_store():
    data        = request.get_json() or {}
    search_term = data.get("search_term", "shirt")
    slot        = data.get("slot", "superior")
    occasion    = data.get("occasion", "casual")
    color       = data.get("color", "")
    gender      = (data.get("gender") or "male").lower()

    products    = _fetch_dummyjson(slot, occasion, color, gender)
    store_links = _build_store_links(search_term, color, gender, slot)

    print(f"[search_store] gender={gender} slot={slot} occasion={occasion} "
          f"color={color} → {len(products)} products, {len(store_links)} links")
    return jsonify({"products": products, "store_links": store_links})
