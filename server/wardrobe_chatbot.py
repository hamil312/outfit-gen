from flask import Blueprint, request, jsonify
from collections import Counter
import os
import requests as http_requests

chatbot_bp = Blueprint("chatbot", __name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_URL     = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def _interpret_coord(value, low_label, high_label):
    if value < 0.35:
        return f"muy {low_label}"
    elif value < 0.65:
        return f"equilibrio entre {low_label} y {high_label}"
    else:
        return f"muy {high_label}"


def _build_system_prompt(context):
    profile  = context.get("profile",  {})
    wardrobe = context.get("wardrobe", [])
    outfits  = context.get("outfits",  [])

    identity  = _interpret_coord(profile.get("coord_identity",          0.5), "funcional",                    "expresivo")
    risk      = _interpret_coord(profile.get("coord_risk",              0.5), "conservador",                  "experimental")
    formality = _interpret_coord(profile.get("coord_formality",         0.5), "casual",                       "formal")
    color_int = _interpret_coord(profile.get("coord_colorIntensity",    0.5), "neutros/minimalista",          "colores vibrantes")
    trend     = _interpret_coord(profile.get("coord_trendOrientation",  0.5), "estilo propio/atemporal",      "orientado a tendencias")
    diversity = _interpret_coord(profile.get("coord_occasionDiversity", 0.5), "especializado en un contexto", "versátil en múltiples contextos")

    total   = len(wardrobe)
    by_type = Counter(i.get("type", "desconocido") for i in wardrobe)
    colors  = [i["color"]    for i in wardrobe if i.get("color")]
    styles  = [i["style"]    for i in wardrobe if i.get("style")    and i["style"]    != "Desconocido"]
    occ     = [i["occasion"] for i in wardrobe if i.get("occasion") and i["occasion"] != "Desconocido"]

    top_colors = ", ".join(c for c, _ in Counter(colors).most_common(5)) or "sin datos"
    top_styles = ", ".join(s for s, _ in Counter(styles).most_common(3)) or "sin datos"
    top_occ    = ", ".join(o for o, _ in Counter(occ).most_common(3))    or "sin datos"
    type_lines = "\n".join(f"  - {t}: {n} prenda(s)" for t, n in by_type.most_common()) or "  (vacío)"

    return f"""Eres Piksy, un asistente personal de moda dentro de la app PickurFit.
Tu misión es ayudar al usuario a entender su estilo, su armario y recibir recomendaciones personalizadas.

Responde SIEMPRE en español. Sé amigable, concreto y breve (2-4 oraciones salvo que pidan más detalle).
Si la pregunta no tiene que ver con moda o el armario, redirige la conversación a ese tema.

## Perfil de estilo del usuario
- Identidad: {identity}
- Riesgo en moda: {risk}
- Formalidad: {formality}
- Intensidad de color: {color_int}
- Tendencias: {trend}
- Diversidad de ocasiones: {diversity}
- Interacciones registradas: {profile.get("interactionsCount", 0)}

## Armario actual ({total} prendas)
{type_lines}
Colores frecuentes: {top_colors}
Estilos frecuentes: {top_styles}
Ocasiones frecuentes: {top_occ}
Atuendos guardados: {len(outfits)}

## Reglas
- Cuando expliques el estilo, interpreta las coordenadas de perfil en lenguaje natural.
- Cuando analices qué falta comprar, detecta gaps: categorías vacías o con pocas prendas.
- No inventes prendas específicas que no figuren en el armario.
- Menciona datos reales del armario cuando sean relevantes."""


@chatbot_bp.route("/chat", methods=["POST"])
def wardrobe_chat():
    try:
        body = request.get_json(silent=True) or {}
        message = body.get("message", "").strip()
        if not message:
            return jsonify({"error": "Mensaje vacío"}), 400
        if not GEMINI_API_KEY:
            return jsonify({"error": "GEMINI_API_KEY no configurada en el servidor."}), 503

        context = body.get("context", {})
        history = body.get("history", [])

        # Construir el historial en formato Gemini (role: "user" | "model")
        contents = []
        for m in history[-10:]:
            role    = m.get("role", "")
            content = m.get("content", "")
            if role == "user":
                contents.append({"role": "user",  "parts": [{"text": content}]})
            elif role == "assistant":
                contents.append({"role": "model", "parts": [{"text": content}]})
        contents.append({"role": "user", "parts": [{"text": message}]})

        payload = {
            "system_instruction": {"parts": [{"text": _build_system_prompt(context)}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 512},
        }

        url  = GEMINI_URL.format(model=GEMINI_MODEL)
        resp = http_requests.post(
            url,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=30,
        )

        if resp.status_code == 401:
            return jsonify({"error": "API key de Gemini inválida o expirada."}), 401
        if resp.status_code == 429:
            detail = resp.json().get("error", {}).get("message", resp.text[:200])
            return jsonify({"error": f"Cuota de Gemini agotada: {detail}"}), 429
        if not resp.ok:
            detail = resp.json().get("error", {}).get("message", resp.text[:200])
            return jsonify({"error": f"Error de Gemini ({resp.status_code}): {detail}"}), 502

        reply = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return jsonify({"response": reply})

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500
