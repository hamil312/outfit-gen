import os
import requests
from collections import Counter
from datetime import datetime, date, timedelta

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")

# Temperatura típica diurna por estación (°C), usada cuando no hay pronóstico
# disponible (viajes de más de 5 días o sin API key).
SEASON_TEMP = {
    "spring": 16,
    "summer": 27,
    "fall":   14,
    "winter": 5,
}

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


def get_season(lat=None, on_date=None):
    month = (on_date or datetime.now()).month
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


def _temp_zone(temp):
    if temp < 0:
        return "freezing"
    if temp < 10:
        return "cold"
    if temp < 18:
        return "cool"
    if temp < 25:
        return "mild"
    if temp < 32:
        return "warm"
    return "hot"


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


def geocode_city(city):
    """Convierte el nombre de una ciudad en coordenadas. Devuelve None si falla."""
    if not OPENWEATHERMAP_API_KEY or not city:
        return None
    try:
        url = "http://api.openweathermap.org/geo/1.0/direct"
        params = {"q": city, "limit": 1, "appid": OPENWEATHERMAP_API_KEY}
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if not data:
            return None
        top = data[0]
        return {
            "name": top.get("name"),
            "country": top.get("country"),
            "lat": top.get("lat"),
            "lon": top.get("lon"),
        }
    except Exception:
        return None


_PRECIP_CONDITIONS = ("rain", "drizzle", "thunderstorm", "snow")


def _aggregate_daily_forecast(lat, lon):
    """Agrupa el pronóstico de 3h en resúmenes diarios para los próximos ~5 días.
    Devuelve {fecha_iso: {temp_min, temp_max, temp_avg, condition}}."""
    if not OPENWEATHERMAP_API_KEY:
        return {}
    try:
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {"lat": lat, "lon": lon, "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
        resp = requests.get(url, params=params, timeout=6)
        if resp.status_code != 200:
            return {}
        entries = resp.json().get("list", [])
    except Exception:
        return {}

    by_day = {}
    for e in entries:
        day = (e.get("dt_txt") or "").split(" ")[0]
        if not day:
            continue
        temp = e.get("main", {}).get("temp")
        cond = (e.get("weather") or [{}])[0].get("main", "").lower()
        agg = by_day.setdefault(day, {"temps": [], "conds": []})
        if temp is not None:
            agg["temps"].append(temp)
        if cond:
            agg["conds"].append(cond)

    summary = {}
    for day, agg in by_day.items():
        temps = agg["temps"]
        if not temps:
            continue
        conds = agg["conds"]
        # La condición prioriza precipitación si aparece en algún tramo del día.
        precip = [c for c in conds if c in _PRECIP_CONDITIONS]
        if precip:
            condition = Counter(precip).most_common(1)[0][0]
        elif conds:
            condition = Counter(conds).most_common(1)[0][0]
        else:
            condition = "clear"
        summary[day] = {
            "temp_min": round(min(temps), 1),
            "temp_max": round(max(temps), 1),
            "temp_avg": round(sum(temps) / len(temps), 1),
            "condition": condition,
        }
    return summary


def get_trip_contexts(lat, lon, start_date, days):
    """Devuelve una lista de contextos (uno por día del viaje).
    Los días dentro del horizonte del pronóstico usan datos reales; el resto
    cae a promedios estacionales (estimated=True)."""
    forecast = {}
    if lat is not None and lon is not None:
        forecast = _aggregate_daily_forecast(lat, lon)

    contexts = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        d_iso = d.isoformat()
        season = get_season(lat, on_date=d)
        if d_iso in forecast:
            f = forecast[d_iso]
            ctx = build_context_from_weather(f["temp_avg"], f["condition"], season, estimated=False)
            ctx["temp_min"] = f["temp_min"]
            ctx["temp_max"] = f["temp_max"]
        else:
            est_temp = SEASON_TEMP.get(season, 18)
            ctx = build_context_from_weather(est_temp, "clear", season, estimated=True)
        ctx["date"] = d_iso
        contexts.append(ctx)
    return contexts


def build_context_from_weather(temp, condition, season, estimated=False):
    """Construye el contexto a partir de un clima ya conocido (sin llamadas HTTP)."""
    if temp is None:
        temp = 20
    if condition is None:
        condition = "clear"

    zone = _temp_zone(temp)
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
        "estimated": estimated,
    }


def build_context(lat=None, lon=None, temp=None, condition=None):
    season = get_season(lat)
    weather_info = None
    if lat is not None and lon is not None:
        weather_info = get_weather_from_api(lat, lon)

    if weather_info:
        temp = weather_info["temp"]
        condition = weather_info["condition"]

    return build_context_from_weather(temp, condition, season)


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
