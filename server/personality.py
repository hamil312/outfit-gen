STYLE_INTENSITY_MAP = {
    "minimalist": 0.1, "classic": 0.2, "preppy": 0.3, "nautical": 0.35,
    "retro": 0.5, "romantic": 0.5, "bohemian": 0.6, "vintage": 0.6,
    "streetwear": 0.7, "edgy": 0.8, "punk": 0.85, "avant-garde": 0.9,
}

COLOR_VIBRANCY = {
    "black": 0.1, "white": 0.1, "gray": 0.1, "beige": 0.15, "brown": 0.2,
    "navy": 0.3, "neutral": 0.1,
    "blue": 0.5, "green": 0.5, "purple": 0.6, "pink": 0.7, "red": 0.8,
    "orange": 0.9, "yellow": 1.0,
}

OCCASION_FORMALITY = {
    "formal": 0.9, "casual": 0.3, "informal": 0.2, "sport": 0.1, "neutral": 0.5,
}


def _personality_score(outfit: dict, profile: dict) -> float:
    score = 0.0
    weights = 0

    formality = profile.get("coord_formality", 0.5)
    color_intensity = profile.get("coord_colorIntensity", 0.5)
    risk = profile.get("coord_risk", 0.5)

    colors = []
    occasions = []
    styles = []
    for slot in ["superior", "inferior", "calzado", "completo"]:
        item = outfit.get(slot)
        if not item:
            continue
        c = (item.get("color_name") or "").strip().lower()
        if c:
            colors.append(c)
        o = (item.get("occasion") or "").strip().lower()
        if o:
            occasions.append(o)
        s = (item.get("style") or "").strip().lower()
        if s:
            styles.append(s)

    if colors:
        avg_vibrancy = sum(COLOR_VIBRANCY.get(c, 0.5) for c in colors) / len(colors)
        diff = abs(avg_vibrancy - color_intensity)
        score += (1 - diff) * 0.4
        weights += 0.4

    if occasions:
        avg_formality = sum(OCCASION_FORMALITY.get(o, 0.5) for o in occasions) / len(occasions)
        diff = abs(avg_formality - formality)
        score += (1 - diff) * 0.35
        weights += 0.35

    if styles:
        avg_style = sum(STYLE_INTENSITY_MAP.get(s, 0.5) for s in styles) / len(styles)
        diff = abs(avg_style - risk)
        score += (1 - diff) * 0.25
        weights += 0.25

    return score / weights if weights > 0 else 0.5


def rerank_by_personality(outfits: list[dict], profile: dict) -> list[dict]:
    if not profile or not outfits:
        return outfits

    scored = [(_personality_score(o, profile), o) for o in outfits]
    scored.sort(key=lambda x: -x[0])
    return [o for _, o in scored]
