import os
import requests
from datetime import datetime

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")

TEMP_RULES = {
    "freezing": {
        "max": 0,
        "exclude_materials": ["silk", "lace", "chiffon", "linen"],
        "exclude_types": ["shorts", "skirt", "t-shirt"],
    },
    "cold": {
        "min": 0, "max": 10,
        "exclude_materials": ["silk", "lace", "chiffon", "linen"],
        "exclude_types": ["shorts", "skirt"],
    },
    "cool": {
        "min": 10, "max": 18,
        "exclude_materials": ["silk", "lace", "chiffon"],
        "exclude_types": ["shorts"],
    },
    "mild": {
        "min": 18, "max": 25,
        "exclude_materials": ["wool", "fleece"],
        "exclude_types": [],
    },
    "warm": {
        "min": 25, "max": 32,
        "exclude_materials": ["wool", "fleece", "leather", "velvet"],
        "exclude_types": ["jacket"],
    },
    "hot": {
        "min": 32,
        "exclude_materials": ["wool", "fleece", "leather", "velvet", "polyester", "nylon"],
        "exclude_types": ["jacket"],
    },
}

WEATHER_CONDITIONS = {
    "rain":         {"exclude_materials": ["suede"]},
    "drizzle":      {"exclude_materials": ["suede"]},
    "thunderstorm": {"exclude_materials": ["suede"]},
    "snow":         {"exclude_materials": ["suede", "lace"], "exclude_types": ["shorts", "skirt"]},
}

SEASON_COLORS = {
    "spring": {"prefer": ["pink", "white", "beige", "green", "blue"]},
    "summer": {"prefer": ["red", "yellow", "orange", "white", "blue"]},
    "fall":   {"prefer": ["brown", "orange", "beige", "yellow", "green"]},
    "winter": {"prefer": ["black", "navy", "gray", "white", "purple"]},
}

PROFILE_STYLE_KEYWORD_MAP = {
    "minimal": "minimalist",
    "urban": "streetwear",
    "classic": "classic",
    "experimental": "avant-garde",
}

PROFILE_OCCASION_MAP = {
    "work": "formal",
    "social": "informal",
    "sport": "sport",
    "home": "casual",
}


def get_season(lat=None):
    now = datetime.now()
    month = now.month
    if lat is not None and lat < 0:
        if month in (3, 4, 5):
            return "fall"
        if month in (6, 7, 8):
            return "winter"
        if month in (9, 10, 11):
            return "spring"
        return "summer"
    else:
        if month in (3, 4, 5):
            return "spring"
        if month in (6, 7, 8):
            return "summer"
        if month in (9, 10, 11):
            return "fall"
        return "winter"


def get_weather_from_api(lat, lon):
    if not OPENWEATHERMAP_API_KEY:
        return None
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"lat": lat, "lon": lon, "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            return None
        data = resp.json()
        return {
            "temp": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "condition": data["weather"][0]["main"].lower(),
            "description": data["weather"][0]["description"],
        }
    except Exception:
        return None


def build_context(lat=None, lon=None, temp=None, condition=None):
    season = get_season(lat)
    weather_info = None
    if lat is not None and lon is not None:
        weather_info = get_weather_from_api(lat, lon)

    if weather_info:
        temp = weather_info["temp"]
        condition = weather_info["condition"]
    elif temp is None:
        temp = 20
    if condition is None:
        condition = "clear"

    if temp < 0:
        zone = "freezing"
    elif temp < 10:
        zone = "cold"
    elif temp < 18:
        zone = "cool"
    elif temp < 25:
        zone = "mild"
    elif temp < 32:
        zone = "warm"
    else:
        zone = "hot"

    temp_rules = TEMP_RULES.get(zone, {})
    cond_rules = WEATHER_CONDITIONS.get(condition, {})

    exclude_materials = list(set(
        temp_rules.get("exclude_materials", []) +
        cond_rules.get("exclude_materials", [])
    ))
    exclude_types = list(set(
        temp_rules.get("exclude_types", []) +
        cond_rules.get("exclude_types", [])
    ))

    return {
        "season": season,
        "temp": round(temp, 1),
        "condition": condition,
        "temp_zone": zone,
        "exclude_materials": exclude_materials,
        "exclude_types": exclude_types,
        "prefer_colors": SEASON_COLORS.get(season, {}).get("prefer", []),
    }


def filter_items_by_context(items, context):
    if not context:
        return items
    excluded_types = set(context.get("exclude_types", []))
    excluded_materials = set(context.get("exclude_materials", []))
    filtered = []
    for item in items:
        item_type = (item.get("type") or "").lower().strip()
        item_material = (item.get("material") or "").lower().strip()
        if item_type in excluded_types:
            continue
        if item_material in excluded_materials:
            continue
        filtered.append(item)
    return filtered


def apply_profile_defaults(profile, style):
    if profile and (not style or style == "any"):
        kw = profile.get("styleKeyword", "").lower().strip()
        if kw:
            return PROFILE_STYLE_KEYWORD_MAP.get(kw, kw)
    return style


def filter_items_by_profile(items, profile):
    if not profile:
        return items
    formality = profile.get("coord_formality", 0.5)
    color_intensity = profile.get("coord_colorIntensity", 0.5)
    risk = profile.get("coord_risk", 0.5)
    filtered = list(items)

    def _score(item):
        score = 0
        occ = (item.get("occasion") or "").lower().strip()
        color = (item.get("color_name") or "").lower().strip()
        style = (item.get("style") or "").lower().strip()
        if formality < 0.25 and occ == "formal":
            score -= 2
        elif formality > 0.75 and occ in ("sport", "informal"):
            score -= 2
        if color_intensity < 0.25 and color in ("red", "orange", "yellow", "pink", "purple"):
            score -= 1
        elif color_intensity > 0.75 and color in ("black", "white", "gray", "beige", "neutral"):
            score -= 1
        if risk < 0.25 and style in ("experimental", "avant-garde", "edgy", "punk"):
            score -= 2
        elif risk > 0.75 and style in ("classic", "minimalist", "preppy"):
            score -= 1
        return score

    filtered.sort(key=_score)
    return filtered
