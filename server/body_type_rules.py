BODY_TYPE_RULES = {
    # ── New taxonomy (ONNX) ──
    "ectomorfo": {
        "prefer_superior": ["jacket", "blazer", "coat", "bomber", "shirt"],
        "avoid_superior": [],
        "prefer_inferior": ["pants", "jeans"],
        "avoid_inferior": ["shorts"],
        "prefer_calzado": ["boots", "sneakers"],
        "avoid_calzado": [],
        "prefer_colors": ["white", "beige", "yellow", "orange", "pink", "red", "light gray"],
        "avoid_colors": ["black", "navy"],
        "prefer_materials": ["denim", "leather", "wool", "fleece", "canvas", "suede", "knit"],
        "prefer_prints": ["striped", "plaid", "checkered", "graphic"],
        "label": "Ectomorfo",
        "desc": "Cuerpo delgado. Añade volumen visual con capas, tejidos pesados y colores claros en la parte superior."
    },
    "endomorfo": {
        "prefer_superior": ["shirt", "blazer", "jacket", "polo"],
        "avoid_superior": ["crop top", "tank top"],
        "prefer_inferior": ["pants", "jeans", "skirt"],
        "avoid_inferior": ["shorts"],
        "prefer_calzado": ["sneakers", "loafers", "boots"],
        "avoid_calzado": [],
        "prefer_colors": ["black", "navy", "purple", "dark green", "brown", "gray"],
        "avoid_colors": ["white", "yellow", "orange", "beige", "pink"],
        "prefer_materials": ["cotton", "knit", "denim", "wool", "polyester"],
        "prefer_prints": ["solid"],
        "label": "Endomorfo",
        "desc": "Cuerpo con tendencia a acumular grasa. Crea líneas verticales con colores oscuros y tejidos estructurados que definan la cintura."
    },
    "mesomorfo": {
        "prefer_superior": ["shirt", "t-shirt", "jacket", "blazer", "polo", "tank top"],
        "avoid_superior": [],
        "prefer_inferior": ["pants", "jeans", "shorts", "skirt"],
        "avoid_inferior": [],
        "prefer_calzado": ["sneakers", "boots", "loafers", "shoes"],
        "avoid_calzado": [],
        "prefer_colors": [],
        "avoid_colors": [],
        "prefer_materials": ["cotton", "denim", "wool", "knit", "leather"],
        "prefer_prints": [],
        "label": "Mesomorfo",
        "desc": "Cuerpo atlético y musculoso. Las prendas ajustadas y estructuradas favorecen las proporciones naturales."
    },
    # ── Legacy taxonomy (MediaPipe) mapped ──
    "rectangle": {
        "prefer_superior": ["jacket", "blazer", "bomber"],
        "avoid_superior": [],
        "prefer_inferior": ["pants", "jeans"],
        "avoid_inferior": [],
        "prefer_calzado": [],
        "avoid_calzado": [],
        "prefer_colors": ["white", "beige"],
        "avoid_colors": ["black"],
        "prefer_materials": ["denim", "leather", "wool", "canvas"],
        "prefer_prints": ["striped", "plaid"],
        "label": "Rectángulo",
        "desc": "Hombros y cadera alineados. Añade volumen con chaquetas estructuradas."
    },
    "pear": {
        "prefer_superior": ["jacket", "blazer", "shirt", "polo"],
        "avoid_superior": [],
        "prefer_inferior": ["pants", "jeans"],
        "avoid_inferior": ["shorts", "mini skirt"],
        "prefer_calzado": ["boots", "loafers"],
        "avoid_calzado": [],
        "prefer_colors": ["black", "navy"],
        "avoid_colors": ["yellow", "orange", "pink"],
        "prefer_materials": ["cotton", "denim", "wool", "knit"],
        "prefer_prints": ["solid"],
        "label": "Pera",
        "desc": "Cadera más ancha que hombros. Equilibra con volumen en la parte superior."
    },
    "apple": {
        "prefer_superior": ["shirt", "blazer", "jacket"],
        "avoid_superior": ["crop top", "tank top"],
        "prefer_inferior": ["pants", "jeans", "skirt"],
        "avoid_inferior": [],
        "prefer_calzado": ["boots", "sneakers", "loafers"],
        "avoid_calzado": [],
        "prefer_colors": ["black", "navy", "dark green", "purple"],
        "avoid_colors": ["white", "beige", "yellow", "orange"],
        "prefer_materials": ["cotton", "denim", "knit"],
        "prefer_prints": ["solid"],
        "label": "Manzana",
        "desc": "Mayor volumen en el torso. Usa escotes en V y colores oscuros para alargar."
    },
    "hourglass": {
        "prefer_superior": ["shirt", "blazer", "jacket", "t-shirt"],
        "avoid_superior": [],
        "prefer_inferior": ["pants", "jeans", "skirt"],
        "avoid_inferior": [],
        "prefer_calzado": [],
        "avoid_calzado": [],
        "prefer_colors": [],
        "avoid_colors": [],
        "prefer_materials": ["cotton", "denim", "knit"],
        "prefer_prints": [],
        "label": "Reloj de arena",
        "desc": "Hombros y cadera equilibrados, cintura definida. Las prendas ajustadas marcan la silueta natural."
    },
    "inverted_triangle": {
        "prefer_superior": ["shirt"],
        "avoid_superior": ["jacket", "bomber", "blazer"],
        "prefer_inferior": ["pants", "jeans", "skirt"],
        "avoid_inferior": [],
        "prefer_calzado": [],
        "avoid_calzado": [],
        "prefer_colors": ["black", "navy", "gray"],
        "avoid_colors": ["white", "beige", "yellow"],
        "prefer_materials": ["cotton", "knit"],
        "prefer_prints": ["solid"],
        "label": "Triángulo invertido",
        "desc": "Hombros más anchos que cadera. Evita volumen extra en la parte superior."
    },
}

LEGACY_MAP = {
    "rectangle": "mesomorfo",
    "pear": "endomorfo",
    "apple": "endomorfo",
    "hourglass": "mesomorfo",
    "inverted_triangle": "mesomorfo",
}


def _resolve_body_type(body_type: str) -> str | None:
    bt = (body_type or "").strip().lower()
    if bt in BODY_TYPE_RULES:
        return bt
    mapped = LEGACY_MAP.get(bt)
    if mapped:
        return mapped
    return None


def _item_score(item: dict, body_type: str, slot: str | None = None) -> float:
    rules = BODY_TYPE_RULES.get(body_type)
    if not rules:
        return 0.0

    score = 0.0
    count = 0

    item_type = (item.get("type") or "").strip().lower()
    color = (item.get("color_name") or "").strip().lower()
    material = (item.get("material") or "unknown").strip().lower()
    print_label = (item.get("print") or "solid").strip().lower()

    # Type check (slot-specific + general)
    all_prefer = list(rules.get("prefer_types", []))
    all_avoid = list(rules.get("avoid_types", []))
    if slot:
        all_prefer.extend(rules.get(f"prefer_{slot}", []))
        all_avoid.extend(rules.get(f"avoid_{slot}", []))

    if all_prefer or all_avoid:
        if item_type in all_prefer:
            score += 1.0
        elif item_type in all_avoid:
            score -= 0.8
        else:
            score += 0.0
        count += 1

    # Color check
    prefer_colors = rules.get("prefer_colors", [])
    avoid_colors = rules.get("avoid_colors", [])
    if prefer_colors or avoid_colors:
        if color in prefer_colors:
            score += 0.6
        elif color in avoid_colors:
            score -= 0.6
        count += 1

    # Material check
    prefer_materials = rules.get("prefer_materials", [])
    if prefer_materials:
        if material in prefer_materials:
            score += 0.4
        count += 1

    # Print/pattern check
    prefer_prints = rules.get("prefer_prints", [])
    if prefer_prints:
        if print_label in prefer_prints:
            score += 0.3
        count += 1

    if count == 0:
        return 0.0
    return score / count


def _body_type_outfit_score(outfit: dict, body_type: str) -> float:
    rules = BODY_TYPE_RULES.get(body_type)
    if not rules:
        return 0.5

    total_score = 0.0
    weights = 0

    items = []
    for slot in ("superior", "inferior", "calzado", "completo"):
        item = outfit.get(slot)
        if item:
            items.append((slot, item))

    if not items:
        return 0.5

    # 1. Individual item scores
    item_scores = []
    for slot, item in items:
        s = _item_score(item, body_type, slot)
        item_scores.append(s)
        total_score += s
        weights += 1

    # 2. Outfit-level bonus: layering for ectomorfo
    if body_type in ("ectomorfo", "rectangle"):
        has_jacket = any(
            (item.get("type") or "").lower()
            in ("jacket", "blazer", "coat", "bomber", "leather jacket")
            for _, item in items
        )
        if has_jacket:
            total_score += 0.3
            weights += 1

    # 3. Outfit-level bonus: dark vertical for endomorfo
    if body_type in ("endomorfo", "pear", "apple"):
        superior_colors = [
            item.get("color_name", "").lower()
            for slot, item in items
            if slot in ("superior", "completo") and item.get("color_name")
        ]
        inferior_colors = [
            item.get("color_name", "").lower()
            for slot, item in items
            if slot == "inferior" and item.get("color_name")
        ]
        all_dark_colors = {"black", "navy", "dark green", "purple", "brown", "gray"}
        if superior_colors and inferior_colors:
            if superior_colors[0] in all_dark_colors and inferior_colors[0] in all_dark_colors:
                total_score += 0.3
                weights += 1

    return total_score / weights if weights > 0 else 0.5


def rerank_by_body_type(outfits: list[dict], profile: dict | None) -> list[dict]:
    if not profile or not outfits:
        return outfits

    body_type = _resolve_body_type(profile.get("bodyType") or "")
    if not body_type:
        return outfits

    scored = [(_body_type_outfit_score(o, body_type), o) for o in outfits]
    scored.sort(key=lambda x: -x[0])
    for i, (s, o) in enumerate(scored[:5]):
        items_str = ', '.join(o.get(s, {}).get('type','?') for s in ('superior','inferior','calzado','completo') if s in o)
        print(f"[BodyType] Outfit {i+1} | score={s:.4f} | body={body_type} | items: {items_str}")
    return [o for _, o in scored]
