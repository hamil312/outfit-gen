SKIN_TONE_RULES = {
    "very_light": {
        "avoid_colors": ["white", "beige", "light gray"],
        "prefer_colors": ["black", "navy", "red", "blue", "green", "purple", "brown"],
    },
    "light": {
        "avoid_colors": ["white", "beige"],
        "prefer_colors": ["black", "navy", "red", "blue", "green", "pink", "purple"],
    },
    "medium": {
        "avoid_colors": [],
        "prefer_colors": ["red", "blue", "green", "purple", "black", "white", "pink", "yellow", "orange"],
    },
    "tan": {
        "avoid_colors": ["pastels", "light yellow"],
        "prefer_colors": ["olive", "cream", "white", "brown", "orange", "red", "green", "navy"],
    },
    "dark": {
        "avoid_colors": ["brown", "navy", "black"],
        "prefer_colors": ["white", "red", "yellow", "orange", "blue", "green", "pink", "purple"],
    },
    "very_dark": {
        "avoid_colors": ["black", "dark navy", "dark brown"],
        "prefer_colors": ["white", "red", "yellow", "orange", "blue", "green", "pink", "purple"],
    },
}

BODY_TYPE_RULES = {
    # ── New taxonomy (ONNX) ──
    "ectomorfo": {
        "prefer_types": ["jacket", "blazer", "coat", "bomber", "shirt"],
        "avoid_types": [],
        "prefer_fit": "structured",
    },
    "endomorfo": {
        "prefer_types": ["shirt", "blazer", "jacket", "polo"],
        "avoid_types": ["crop top", "tank top"],
        "prefer_fit": "fitted",
    },
    "mesomorfo": {
        "prefer_types": ["shirt", "t-shirt", "jacket", "blazer", "polo", "tank top"],
        "avoid_types": [],
        "prefer_fit": "fitted",
    },
    # ── Legacy taxonomy (MediaPipe) ──
    "rectangle": {
        "prefer_types": ["jacket", "blazer"],
        "avoid_types": [],
        "prefer_fit": "fitted",
    },
    "pear": {
        "prefer_types": ["jacket"],
        "avoid_types": ["skinny"],
        "prefer_fit": "structured",
    },
    "apple": {
        "prefer_types": [],
        "avoid_types": ["crop top"],
        "prefer_fit": "flowy",
    },
    "hourglass": {
        "prefer_types": [],
        "avoid_types": [],
        "prefer_fit": "fitted",
    },
    "inverted_triangle": {
        "prefer_types": ["wide leg", "bootcut"],
        "avoid_types": ["shoulder pads"],
        "prefer_fit": "relaxed",
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
    return LEGACY_MAP.get(bt)

SKIN_TONE_BRIGHTNESS_MAP = {
    "very_light": 0.9,
    "light": 0.75,
    "medium": 0.55,
    "tan": 0.4,
    "dark": 0.25,
    "very_dark": 0.1,
}

PREFERRED_COLORS_BY_BRIGHTNESS = {
    "high":   ["black", "navy", "red", "blue", "purple"],
    "medium": ["red", "blue", "green", "purple", "black", "white"],
    "low":    ["white", "red", "yellow", "orange", "blue", "green", "pink"],
}


def filter_items_by_physical_profile(items: list, profile: dict) -> list:
    if not profile:
        return items

    skin_tone = (profile.get("skinTone") or "").strip().lower()
    body_type = (profile.get("bodyType") or "").strip().lower()

    if not skin_tone and not body_type:
        return items

    resolved_body_type = _resolve_body_type(body_type) or body_type
    skin_rules = SKIN_TONE_RULES.get(skin_tone, {})
    body_rules = BODY_TYPE_RULES.get(resolved_body_type, {})

    avoid_colors = set(skin_rules.get("avoid_colors", []))
    avoid_types = set(body_rules.get("avoid_types", []))
    prefer_colors = set(skin_rules.get("prefer_colors", []))
    prefer_types = set(body_rules.get("prefer_types", []))

    filtered = []
    for item in items:
        color = (item.get("color_name") or "").strip().lower()
        item_type = (item.get("type") or "").strip().lower()
        if color in avoid_colors:
            continue
        if item_type in avoid_types:
            continue
        filtered.append(item)

    def sort_key(item):
        score = 0
        c = (item.get("color_name") or "").strip().lower()
        t = (item.get("type") or "").strip().lower()
        if c in prefer_colors:
            score += 2
        if t in prefer_types:
            score += 1
        return -score

    filtered.sort(key=sort_key)
    return filtered
