from flask import Blueprint, request, jsonify
from datetime import date, datetime

from context_engine import (
    geocode_city,
    get_trip_contexts,
    filter_items_by_context,
    filter_items_by_profile,
)
from profile_rules import filter_items_by_physical_profile
from personality import rerank_by_personality

travel_bp = Blueprint("travel", __name__)

# Slots cuyas prendas NO deben repetirse entre días (rotación realista de maleta).
# El calzado se permite reutilizar libremente.
NON_REPEATING_SLOTS = ("superior", "inferior", "completo")
MAX_TRIP_DAYS = 14


def _parse_date(value):
    if not value:
        return date.today()
    try:
        return datetime.fromisoformat(str(value)).date()
    except (ValueError, TypeError):
        return date.today()


def _filter_by_occasion(items, occasion):
    """Conserva prendas compatibles con la ocasión del viaje (neutral siempre pasa)."""
    if not occasion or occasion.lower() in ("any", "neutral", ""):
        return items
    from flaskAPI import compatible_ocasion
    occ = occasion.lower()
    return [
        it for it in items
        if compatible_ocasion((it.get("occasion") or "neutral").lower(), occ)
    ]


def _is_complete_outfit(outfit):
    """Un outfit es completo si es vestido+calzado o superior+inferior+calzado."""
    if not outfit:
        return False
    if outfit.get("completo") and outfit.get("calzado"):
        return True
    if outfit.get("superior") and outfit.get("inferior") and outfit.get("calzado"):
        return True
    return False


def _first_complete(outfits):
    """Primer outfit completo de la lista ya rankeada (o None)."""
    for o in outfits:
        if _is_complete_outfit(o):
            return o
    return None


def _assemble_complete(items, used_ids):
    """Garantía final: arma manualmente un outfit COMPLETO ignorando la
    compatibilidad de color/ocasión. Prefiere prendas no usadas. None solo si
    al armario le falta una categoría entera (p.ej. no hay calzado)."""
    from flaskAPI import _categorize, rgb_to_name

    cats = {"superior": [], "inferior": [], "calzado": [], "completo": []}
    for it in items:
        c = _categorize(it.get("type", ""))
        if c not in cats:
            continue
        color = it.get("color")
        enriched = {
            **it,
            "color_name": rgb_to_name(color) if color is not None else "neutral",
            "categoria": c,
        }
        cats[c].append(enriched)

    def pick(lst):
        fresh = [x for x in lst if x.get("$id") not in used_ids]
        return (fresh or lst)[0]

    if cats["completo"] and cats["calzado"]:
        return {"completo": pick(cats["completo"]), "calzado": pick(cats["calzado"])}
    if cats["superior"] and cats["inferior"] and cats["calzado"]:
        return {
            "superior": pick(cats["superior"]),
            "inferior": pick(cats["inferior"]),
            "calzado": pick(cats["calzado"]),
        }
    return None


def _pick_day_outfit(day_items, all_items, used_ids, style, occasion):
    """Devuelve un outfit COMPLETO para el día (nunca incompleto), escalando
    fallbacks: día sin repetir → día con repetición → relajar clima → relajar
    ocasión → ensamblado manual garantizado. None solo si falta una categoría."""
    from flaskAPI import generate_outfits

    day_occ = _filter_by_occasion(day_items, occasion)

    # 1. Día (clima + ocasión), sin repetir prendas.
    fresh = [it for it in day_occ if it.get("$id") not in used_ids]
    chosen = _first_complete(generate_outfits(fresh, style=style)[0])
    if chosen:
        return chosen

    # 2. Día (clima + ocasión), permitiendo repetición.
    chosen = _first_complete(generate_outfits(day_occ, style=style)[0])
    if chosen:
        return chosen

    # 3. Relajar clima: todo el armario filtrado por ocasión.
    all_occ = _filter_by_occasion(all_items, occasion)
    chosen = _first_complete(generate_outfits(all_occ, style=style)[0])
    if chosen:
        return chosen

    # 4. Relajar ocasión también: todo el armario.
    chosen = _first_complete(generate_outfits(all_items, style=style)[0])
    if chosen:
        return chosen

    # 5. Garantía: ensamblado manual ignorando compatibilidad.
    return _assemble_complete(all_items, used_ids)


@travel_bp.route("/generate-trip", methods=["POST"])
def generate_trip():
    body = request.get_json(silent=True) or {}

    destination = (body.get("destination") or "").strip()
    days = body.get("days", 1)
    try:
        days = max(1, min(int(days), MAX_TRIP_DAYS))
    except (ValueError, TypeError):
        days = 1
    start_date = _parse_date(body.get("start_date"))
    occasion = (body.get("occasion") or "").strip()
    items = list(body.get("items", []))
    profile = body.get("profile")

    if not items:
        return jsonify({"error": "No hay prendas en el armario para planificar el viaje."}), 400

    warnings = []

    # ── Geolocalización del destino ──
    geo = geocode_city(destination) if destination else None
    lat = geo["lat"] if geo else None
    lon = geo["lon"] if geo else None
    if destination and not geo:
        warnings.append(
            "No se pudo localizar el destino; el clima se estimará con promedios estacionales."
        )

    # ── Contexto climático por día (forecast + fallback estacional) ──
    contexts = get_trip_contexts(lat, lon, start_date, days)
    if any(c.get("estimated") for c in contexts):
        warnings.append(
            "Algunos días superan el horizonte del pronóstico (5 días); su clima es estimado."
        )

    # ── Filtros de perfil aplicados una vez (no dependen del día) ──
    # El estilo NO se fuerza desde el perfil: sería un filtro duro que deja sin
    # prendas para armar outfits completos a lo largo del viaje. El gusto del
    # usuario ya se respeta vía filter_items_by_profile + rerank_by_personality.
    base_items = items
    style = body.get("style") or None
    if style and style.lower() in ("any", ""):
        style = None
    if profile:
        base_items = filter_items_by_profile(base_items, profile)
        base_items = filter_items_by_physical_profile(base_items, profile)

    used_ids = set()       # prendas no repetibles ya usadas
    packing = {}           # $id -> item (lista de equipaje consolidada)
    day_results = []
    exhausted = False

    for ctx in contexts:
        day_items = filter_items_by_context(base_items, ctx)
        outfit = _pick_day_outfit(day_items, base_items, used_ids, style, occasion)

        if outfit and profile:
            outfit = rerank_by_personality([outfit], profile)[0]

        # reused = se repitió una prenda de slot no repetible (superior/inferior/completo)
        reused = False
        if outfit:
            for slot in NON_REPEATING_SLOTS:
                it = outfit.get(slot)
                if it and it.get("$id") in used_ids:
                    reused = True
                    break
            for slot in NON_REPEATING_SLOTS:
                it = outfit.get(slot)
                if it and it.get("$id"):
                    used_ids.add(it["$id"])
            for slot in ("superior", "inferior", "calzado", "completo"):
                it = outfit.get(slot)
                if it and it.get("$id"):
                    packing[it["$id"]] = it
            if reused:
                exhausted = True

        day_results.append({
            "date": ctx["date"],
            "weather": {
                "temp": ctx["temp"],
                "temp_min": ctx.get("temp_min"),
                "temp_max": ctx.get("temp_max"),
                "condition": ctx["condition"],
                "temp_zone": ctx["temp_zone"],
                "season": ctx["season"],
                "estimated": ctx.get("estimated", False),
            },
            "outfit": outfit,
            "reused": reused,
        })

    if exhausted:
        warnings.append(
            "Tu armario no alcanza para un outfit único cada día; se repitieron prendas en algunos días."
        )
    if not any(d["outfit"] for d in day_results):
        warnings.append(
            "No se pudo generar ningún outfit. Revisa que tengas superiores, inferiores y calzado (o vestidos y calzado)."
        )

    return jsonify({
        "destination": geo or {"name": destination, "country": None, "lat": None, "lon": None},
        "start_date": start_date.isoformat(),
        "days": day_results,
        "packing_list": list(packing.values()),
        "warnings": warnings,
    })
