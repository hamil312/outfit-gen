"""Pruebas para profile_refiner.py (refinamiento bayesiano del perfil).

Este módulo no tiene dependencias pesadas, así que se importa directamente.
"""
from flask import Flask

import profile_refiner as pr


# ── compute_weight ───────────────────────────────────────────────────────────

class TestComputeWeight:
    def test_positive_actions(self):
        assert pr.compute_weight("saved") == 1.0
        assert pr.compute_weight("published") == 0.8
        assert pr.compute_weight("liked") == 0.7

    def test_negative_actions(self):
        assert pr.compute_weight("regenerated") == -0.6
        assert pr.compute_weight("discarded") == -1.0

    def test_unknown_action_is_zero(self):
        assert pr.compute_weight("calendar") == 0.0
        assert pr.compute_weight("") == 0.0


# ── clamp ────────────────────────────────────────────────────────────────────

class TestClamp:
    def test_below_zero(self):
        assert pr.clamp(-0.5) == 0.0

    def test_above_one(self):
        assert pr.clamp(1.7) == 1.0

    def test_within_range(self):
        assert pr.clamp(0.42) == 0.42


# ── bayesian_update ──────────────────────────────────────────────────────────

class TestBayesianUpdate:
    def test_alpha_one_takes_signal(self):
        assert pr.bayesian_update(0.2, 0.9, 1.0) == 0.9

    def test_alpha_zero_keeps_prior(self):
        assert pr.bayesian_update(0.2, 0.9, 0.0) == 0.2

    def test_alpha_half_is_midpoint(self):
        assert pr.bayesian_update(0.2, 0.8, 0.5) == 0.5

    def test_result_is_clamped(self):
        assert 0.0 <= pr.bayesian_update(0.99, 2.0, 1.0) <= 1.0


# ── resolve_signal ───────────────────────────────────────────────────────────

class TestResolveSignal:
    def test_empty_returns_prior(self):
        assert pr.resolve_signal([], 0.5, 1.0) == 0.5

    def test_only_positive_moves_toward_signal(self):
        # señal positiva fuerte en 0.9 con alpha alto → acerca el prior a 0.9
        result = pr.resolve_signal([(0.9, 1.0)], 0.3, 1.0)
        assert abs(result - 0.9) < 1e-6

    def test_only_negative_moves_away(self):
        # rechazo de un valor bajo (0.1) empuja el prior hacia arriba
        result = pr.resolve_signal([(0.1, -1.0)], 0.5, 1.0)
        assert result > 0.5

    def test_mixed_signals_stay_in_range(self):
        result = pr.resolve_signal([(0.9, 1.0), (0.1, -1.0)], 0.5, 0.5)
        assert 0.0 <= result <= 1.0


# ── refine_profile ───────────────────────────────────────────────────────────

def _base_profile(**over):
    p = {
        "coord_identity": 0.5,
        "coord_risk": 0.5,
        "coord_formality": 0.5,
        "coord_colorIntensity": 0.5,
        "coord_trendOrientation": 0.5,
        "coord_occasionDiversity": 0.5,
        "profileVersion": 1,
        "interactionsCount": 0,
    }
    p.update(over)
    return p


class TestRefineProfile:
    def test_no_interactions_returns_same(self):
        profile = _base_profile()
        assert pr.refine_profile(profile, []) == profile

    def test_saved_high_color_raises_color_intensity(self):
        profile = _base_profile(coord_colorIntensity=0.3)
        interactions = [
            {"action": "saved", "colorIntensity": 0.9,
             "formalityLevel": 0.5, "styleExperimental": 0.5, "occasionType": "casual"}
        ]
        updated = pr.refine_profile(profile, interactions)
        assert updated["coord_colorIntensity"] > 0.3

    def test_trend_orientation_never_changes(self):
        profile = _base_profile(coord_trendOrientation=0.42)
        interactions = [
            {"action": "saved", "colorIntensity": 0.9,
             "formalityLevel": 0.9, "styleExperimental": 0.9, "occasionType": "formal"}
        ]
        updated = pr.refine_profile(profile, interactions)
        assert updated["coord_trendOrientation"] == 0.42

    def test_profile_version_increments(self):
        profile = _base_profile(profileVersion=3)
        interactions = [
            {"action": "saved", "colorIntensity": 0.5,
             "formalityLevel": 0.5, "styleExperimental": 0.5, "occasionType": "casual"}
        ]
        updated = pr.refine_profile(profile, interactions)
        assert updated["profileVersion"] == 4

    def test_ignores_zero_weight_actions(self):
        # una acción desconocida (peso 0) no debe alterar las coordenadas
        profile = _base_profile(coord_formality=0.5)
        interactions = [
            {"action": "unknown", "colorIntensity": 0.9,
             "formalityLevel": 0.9, "styleExperimental": 0.9, "occasionType": "formal"}
        ]
        updated = pr.refine_profile(profile, interactions)
        assert updated["coord_formality"] == 0.5

    def test_occasion_diversity_from_positive(self):
        profile = _base_profile(coord_occasionDiversity=0.1)
        interactions = [
            {"action": "saved", "colorIntensity": 0.5, "formalityLevel": 0.5,
             "styleExperimental": 0.5, "occasionType": occ}
            for occ in ("casual", "formal", "sport", "party")
        ]
        updated = pr.refine_profile(profile, interactions)
        # cuatro ocasiones distintas en positivo → diversidad sube respecto al prior
        assert updated["coord_occasionDiversity"] > 0.1


# ── endpoint /refine-profile ─────────────────────────────────────────────────

def _client():
    app = Flask(__name__)
    pr.register_profile_routes(app)
    return app.test_client()


class TestRefineEndpoint:
    def test_empty_body_returns_400(self):
        resp = _client().post("/refine-profile", json={})
        assert resp.status_code == 400

    def test_missing_profile_returns_400(self):
        resp = _client().post("/refine-profile", json={"interactions": []})
        assert resp.status_code == 400

    def test_valid_request_returns_updated_profile(self):
        body = {
            "currentProfile": _base_profile(coord_colorIntensity=0.3),
            "interactions": [
                {"action": "saved", "colorIntensity": 0.9, "formalityLevel": 0.5,
                 "styleExperimental": 0.5, "occasionType": "casual"}
            ],
        }
        resp = _client().post("/refine-profile", json=body)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["coord_colorIntensity"] > 0.3
        assert data["profileVersion"] == 2
