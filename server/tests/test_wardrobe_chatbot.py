"""Pruebas para wardrobe_chatbot.py (asistente con Gemini).

La llamada HTTP a la API de Gemini se mockea; nunca se hace red real.
"""
from flask import Flask
from unittest.mock import MagicMock

import wardrobe_chatbot as wc


def _client():
    app = Flask(__name__)
    app.register_blueprint(wc.chatbot_bp)
    return app.test_client()


def _gemini_response(text="Hola, soy Piksy."):
    resp = MagicMock()
    resp.status_code = 200
    resp.ok = True
    resp.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": text}]}}]
    }
    return resp


# ── _interpret_coord ──────────────────────────────────────────────────────────

class TestInterpretCoord:
    def test_low(self):
        assert wc._interpret_coord(0.1, "bajo", "alto") == "muy bajo"

    def test_mid(self):
        assert "equilibrio" in wc._interpret_coord(0.5, "bajo", "alto")

    def test_high(self):
        assert wc._interpret_coord(0.9, "bajo", "alto") == "muy alto"


# ── _build_system_prompt ──────────────────────────────────────────────────────

class TestBuildSystemPrompt:
    def test_includes_profile_and_wardrobe(self):
        ctx = {
            "profile": {"coord_identity": 0.9, "interactionsCount": 7},
            "wardrobe": [
                {"type": "shirt", "color": "white", "style": "classic", "occasion": "casual"},
            ],
            "outfits": [],
        }
        prompt = wc._build_system_prompt(ctx)
        assert "Piksy" in prompt
        assert "shirt" in prompt
        assert "white" in prompt
        assert "7" in prompt  # interacciones registradas

    def test_handles_empty_context(self):
        prompt = wc._build_system_prompt({})
        assert "0 prendas" in prompt or "(vacío)" in prompt


# ── /chat endpoint ────────────────────────────────────────────────────────────

class TestChatEndpoint:
    def test_empty_message_returns_400(self):
        resp = _client().post("/chat", json={"message": "   "})
        assert resp.status_code == 400

    def test_missing_api_key_returns_503(self, monkeypatch):
        monkeypatch.setattr(wc, "GEMINI_API_KEY", "")
        resp = _client().post("/chat", json={"message": "hola"})
        assert resp.status_code == 503

    def test_successful_reply(self, monkeypatch):
        monkeypatch.setattr(wc, "GEMINI_API_KEY", "fake-key")
        monkeypatch.setattr(wc.http_requests, "post", lambda *a, **k: _gemini_response("¡Tu estilo es minimalista!"))
        body = {"message": "¿Cuál es mi estilo?", "context": {}, "history": []}
        resp = _client().post("/chat", json=body)
        assert resp.status_code == 200
        assert resp.get_json()["response"] == "¡Tu estilo es minimalista!"

    def test_history_is_forwarded(self, monkeypatch):
        captured = {}

        def fake_post(url, params=None, json=None, timeout=None):
            captured["payload"] = json
            return _gemini_response()

        monkeypatch.setattr(wc, "GEMINI_API_KEY", "fake-key")
        monkeypatch.setattr(wc.http_requests, "post", fake_post)

        body = {
            "message": "y de colores?",
            "context": {},
            "history": [
                {"role": "user", "content": "hola"},
                {"role": "assistant", "content": "buenas"},
            ],
        }
        _client().post("/chat", json=body)
        contents = captured["payload"]["contents"]
        # historial (user/model) + el mensaje actual
        assert contents[0]["role"] == "user"
        assert contents[1]["role"] == "model"
        assert contents[-1]["parts"][0]["text"] == "y de colores?"

    def test_quota_error_returns_429(self, monkeypatch):
        resp_obj = MagicMock()
        resp_obj.status_code = 429
        resp_obj.ok = False
        resp_obj.json.return_value = {"error": {"message": "quota exceeded"}}
        monkeypatch.setattr(wc, "GEMINI_API_KEY", "fake-key")
        monkeypatch.setattr(wc.http_requests, "post", lambda *a, **k: resp_obj)
        resp = _client().post("/chat", json={"message": "hola"})
        assert resp.status_code == 429
