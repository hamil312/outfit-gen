from flask import request, jsonify
from collections import defaultdict
from datetime import datetime


def compute_weight(action: str) -> float:
    return {
        "saved":       +1.0,
        "published":   +0.8,
        "liked":       +0.7,
        "regenerated": -0.6,
        "discarded":   -1.0,
    }.get(action, 0.0)


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def bayesian_update(prior: float, signal: float, alpha: float) -> float:
    return clamp(prior * (1 - alpha) + signal * alpha)


def resolve_signal(
    values: list[tuple[float, float]],
    prior: float,
    alpha: float,
) -> float:
    """
    Calcula el nuevo valor de una coordenada a partir de una lista
    de (valor, peso) que puede mezclar señales positivas y negativas.

    - Solo positivas: bayesian update hacia el promedio ponderado positivo.
    - Solo negativas: aleja el perfil del promedio ponderado negativo.
    - Mixtas: pondera ambas direcciones según sus pesos relativos
      y aplica bayesian update al resultado neto.
    """
    positive = [(v, w) for v, w in values if w > 0]
    negative = [(v, w) for v, w in values if w < 0]

    if not positive and not negative:
        return prior

    if positive and not negative:
        pos_w      = sum(w for _, w in positive)
        pos_signal = sum(v * w for v, w in positive) / pos_w
        return bayesian_update(prior, pos_signal, alpha)

    if negative and not positive:
        neg_w      = sum(abs(w) for _, w in negative)
        neg_signal = sum(v * abs(w) for v, w in negative) / neg_w
        # Aleja el perfil del valor rechazado
        return clamp(prior + alpha * (prior - neg_signal) * 0.5)

    # Caso mixto: neto ponderado
    pos_w      = sum(w for _, w in positive)
    neg_w      = sum(abs(w) for _, w in negative)
    pos_signal = sum(v * w for v, w in positive) / pos_w
    neg_signal = sum(v * abs(w) for v, w in negative) / neg_w
    total_w    = pos_w + neg_w

    # La señal neta pondera la atracción positiva contra el rechazo negativo
    net_signal = (pos_signal * pos_w - neg_signal * neg_w) / total_w
    net_signal = clamp(net_signal)

    return bayesian_update(prior, net_signal, alpha)


def refine_profile(current_profile: dict, interactions: list) -> dict:
    """
    Refinamiento progresivo del perfil de usuario.

    Coordenadas refinadas:
      - coord_colorIntensity   → feature directa: colorIntensity
      - coord_formality        → feature directa: formalityLevel
      - coord_risk             → feature directa: styleExperimental
      - coord_identity         → derivada: promedio(colorIntensity, styleExperimental)
      - coord_occasionDiversity → derivada: diversidad de occasionType en interacciones positivas

    coord_trendOrientation: NO se modifica (sin feature confiable disponible aún).

    interactionsCount: NO se modifica aquí — lo gestiona ProfileController en Appwrite.
    """
    if not interactions:
        return current_profile

    updated = dict(current_profile)

    n = int(current_profile.get("interactionsCount", 0))

    # Learning rate decreciente: estabiliza el perfil con el tiempo
    # n=0  → alpha=1.0  (perfil muy moldeable, el quiz aún no tiene peso)
    # n=10 → alpha=0.5
    # n=50 → alpha=0.17
    # n=100→ alpha=0.09
    alpha = max(0.05, 1.0 / (1.0 + 0.1 * n))

    signals: dict[str, list[tuple[float, float]]] = defaultdict(list)
    positive_occasions: list[str] = []

    for interaction in interactions:
        weight   = compute_weight(interaction.get("action", ""))
        if weight == 0:
            continue

        color_intensity = interaction.get("colorIntensity")
        formality       = interaction.get("formalityLevel")
        experimental    = interaction.get("styleExperimental")
        occasion        = interaction.get("occasionType")

        # ── Coordenadas directas ──────────────────────────────────────────
        if color_intensity is not None:
            signals["coord_colorIntensity"].append((float(color_intensity), weight))

        if formality is not None:
            signals["coord_formality"].append((float(formality), weight))

        if experimental is not None:
            signals["coord_risk"].append((float(experimental), weight))

        # ── coord_identity (derivada) ─────────────────────────────────────
        # Un usuario que acepta outfits coloridos y experimentales
        # está mostrando comportamiento expresivo (alto coord_identity).
        if color_intensity is not None and experimental is not None:
            identity_signal = (float(color_intensity) + float(experimental)) / 2.0
            signals["coord_identity"].append((identity_signal, weight))

        # ── coord_occasionDiversity (acumular ocasiones positivas) ────────
        if weight > 0 and occasion:
            positive_occasions.append(occasion.lower().strip())

    # ── Refinar coordenadas numéricas ─────────────────────────────────────
    for coord, values in signals.items():
        prior = float(current_profile.get(coord, 0.5))
        updated[coord] = round(resolve_signal(values, prior, alpha), 4)

    # ── coord_occasionDiversity ───────────────────────────────────────────
    # Mide cuántas ocasiones distintas acepta el usuario en positivo.
    # Se calcula sobre las 20 interacciones recientes que envía el controller,
    # así refleja el comportamiento actual, no el histórico acumulado.
    if positive_occasions:
        unique_count    = len(set(positive_occasions))
        total_possible  = 8  # work, casual, formal, sport, party, date, beach, travel
        diversity_score = clamp(unique_count / total_possible)
        prior           = float(current_profile.get("coord_occasionDiversity", 0.5))
        updated["coord_occasionDiversity"] = round(
            bayesian_update(prior, diversity_score, alpha), 4
        )

    # ── Metadata ──────────────────────────────────────────────────────────
    updated["profileVersion"] = int(current_profile.get("profileVersion", 1)) + 1
    updated["lastRefined"]    = datetime.utcnow().isoformat()

    # Garantía: coord_trendOrientation no se toca
    updated["coord_trendOrientation"] = current_profile.get("coord_trendOrientation", 0.5)

    return updated


# ─── Flask endpoint ────────────────────────────────────────────────────────────
def register_profile_routes(app):

    @app.route("/refine-profile", methods=["POST"])
    def refine_profile_endpoint():
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        current_profile = data.get("currentProfile", {})
        interactions    = data.get("interactions", [])

        if not current_profile:
            return jsonify({"error": "currentProfile is required"}), 400

        updated = refine_profile(current_profile, interactions)
        return jsonify(updated), 200