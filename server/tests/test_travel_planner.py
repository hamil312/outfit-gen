"""Pruebas para travel_planner.py (planificador de atuendos de viaje).

travel_planner importa flaskAPI de forma diferida dentro de sus funciones, así
que se inyecta un flaskAPI falso en sys.modules para evitar las dependencias
pesadas de ML. El clima (geocode/forecast) se mockea para no usar red.
"""
import sys
import types

import pytest
from flask import Flask

import travel_planner as tp


# ── flaskAPI falso (sin dependencias pesadas) ────────────────────────────────

def _categorize(t):
    m = {"shirt": "superior", "t-shirt": "superior", "jacket": "superior", "top": "superior",
         "dress": "completo", "pants": "inferior", "shorts": "inferior", "skirt": "inferior",
         "shoes": "calzado"}
    return m.get((t or "").strip().lower())


def _rgb_to_name(c):
    return c if isinstance(c, str) else "neutral"


def _compatible_ocasion(o1, o2):
    if o1 == o2:
        return True
    if "neutral" in (o1, o2):
        return True
    if {o1, o2} == {"informal", "casual"}:
        return True
    return False


def _generate_outfits(items, style=None, **kwargs):
    """Versión simplificada: arma un outfit completo si hay categorías suficientes."""
    sup = [i for i in items if _categorize(i.get("type")) == "superior"]
    inf = [i for i in items if _categorize(i.get("type")) == "inferior"]
    cal = [i for i in items if _categorize(i.get("type")) == "calzado"]
    comp = [i for i in items if _categorize(i.get("type")) == "completo"]
    outfits = []
    if comp and cal:
        outfits.append({"completo": comp[0], "calzado": cal[0]})
    if sup and inf and cal:
        outfits.append({"superior": sup[0], "inferior": inf[0], "calzado": cal[0]})
    return outfits, False


@pytest.fixture
def fake_flaskapi(monkeypatch):
    mod = types.ModuleType("flaskAPI")
    mod._categorize = _categorize
    mod.rgb_to_name = _rgb_to_name
    mod.compatible_ocasion = _compatible_ocasion
    mod.generate_outfits = _generate_outfits
    monkeypatch.setitem(sys.modules, "flaskAPI", mod)
    return mod


# ── helpers puros (sin flaskAPI) ─────────────────────────────────────────────

class TestCompleteOutfit:
    def test_standard_complete(self):
        outfit = {"superior": {"$id": "s"}, "inferior": {"$id": "i"}, "calzado": {"$id": "z"}}
        assert tp._is_complete_outfit(outfit) is True

    def test_dress_complete(self):
        assert tp._is_complete_outfit({"completo": {"$id": "d"}, "calzado": {"$id": "z"}}) is True

    def test_missing_shoes_incomplete(self):
        assert tp._is_complete_outfit({"superior": {"$id": "s"}, "inferior": {"$id": "i"}}) is False

    def test_none_or_empty(self):
        assert tp._is_complete_outfit(None) is False
        assert tp._is_complete_outfit({}) is False

    def test_first_complete_skips_partial(self):
        outfits = [
            {"calzado": {"$id": "z"}},                                   # incompleto
            {"superior": {"$id": "s"}, "inferior": {"$id": "i"}, "calzado": {"$id": "z"}},
        ]
        chosen = tp._first_complete(outfits)
        assert chosen is not None and "superior" in chosen

    def test_first_complete_none(self):
        assert tp._first_complete([{"calzado": {"$id": "z"}}]) is None


# ── _filter_by_occasion (necesita flaskAPI.compatible_ocasion) ───────────────

class TestFilterByOccasion:
    def test_empty_occasion_returns_all(self, fake_flaskapi):
        items = [{"occasion": "formal"}, {"occasion": "sport"}]
        assert tp._filter_by_occasion(items, "") == items

    def test_filters_incompatible(self, fake_flaskapi):
        items = [
            {"$id": "a", "occasion": "formal"},
            {"$id": "b", "occasion": "sport"},
            {"$id": "c", "occasion": "neutral"},
        ]
        out = tp._filter_by_occasion(items, "formal")
        ids = {i["$id"] for i in out}
        assert "a" in ids and "c" in ids   # formal + neutral pasan
        assert "b" not in ids              # sport no


# ── _assemble_complete (necesita flaskAPI._categorize/rgb_to_name) ───────────

class TestAssembleComplete:
    def test_builds_standard_outfit(self, fake_flaskapi):
        items = [
            {"$id": "s", "type": "shirt", "color": "white"},
            {"$id": "i", "type": "pants", "color": "blue"},
            {"$id": "z", "type": "shoes", "color": "black"},
        ]
        outfit = tp._assemble_complete(items, set())
        assert tp._is_complete_outfit(outfit)

    def test_missing_category_returns_none(self, fake_flaskapi):
        items = [{"$id": "s", "type": "shirt"}, {"$id": "i", "type": "pants"}]  # sin calzado
        assert tp._assemble_complete(items, set()) is None

    def test_prefers_unused_items(self, fake_flaskapi):
        items = [
            {"$id": "s1", "type": "shirt"}, {"$id": "s2", "type": "shirt"},
            {"$id": "i", "type": "pants"}, {"$id": "z", "type": "shoes"},
        ]
        outfit = tp._assemble_complete(items, used_ids={"s1"})
        assert outfit["superior"]["$id"] == "s2"


# ── endpoint /generate-trip ──────────────────────────────────────────────────

def _seasonal_ctx(date_iso):
    return {
        "date": date_iso, "temp": 22, "temp_min": 18, "temp_max": 26,
        "temp_zone": "mild", "condition": "clear", "season": "summer",
        "estimated": True, "exclude_types": [], "exclude_materials": [],
    }


@pytest.fixture
def client(fake_flaskapi, monkeypatch):
    # Evita red: geocode y contextos deterministas
    monkeypatch.setattr(tp, "geocode_city",
                        lambda city: {"name": "TestCity", "country": "TC", "lat": 1.0, "lon": 2.0})
    monkeypatch.setattr(tp, "get_trip_contexts",
                        lambda lat, lon, start, days: [
                            _seasonal_ctx(f"2026-07-0{i+1}") for i in range(days)
                        ])
    app = Flask(__name__)
    app.register_blueprint(tp.travel_bp)
    return app.test_client()


WARDROBE = [
    {"$id": "s1", "type": "shirt", "color": "white", "occasion": "casual"},
    {"$id": "s2", "type": "t-shirt", "color": "black", "occasion": "casual"},
    {"$id": "i1", "type": "pants", "color": "blue", "occasion": "casual"},
    {"$id": "i2", "type": "pants", "color": "beige", "occasion": "casual"},
    {"$id": "z1", "type": "shoes", "color": "white", "occasion": "casual"},
]


class TestGenerateTripEndpoint:
    def test_no_items_returns_400(self, client):
        resp = client.post("/generate-trip", json={"destination": "Paris", "days": 2, "items": []})
        assert resp.status_code == 400

    def test_every_day_has_complete_outfit(self, client):
        body = {"destination": "Paris", "start_date": "2026-07-01",
                "days": 3, "occasion": "casual", "items": WARDROBE}
        resp = client.post("/generate-trip", json=body)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data["days"]) == 3
        for day in data["days"]:
            assert tp._is_complete_outfit(day["outfit"]), f"día incompleto: {day}"

    def test_geocoded_destination_in_response(self, client):
        body = {"destination": "Paris", "days": 1, "items": WARDROBE}
        data = client.post("/generate-trip", json=body).get_json()
        assert data["destination"]["country"] == "TC"

    def test_packing_list_and_warnings(self, client):
        body = {"destination": "Paris", "days": 2, "occasion": "casual", "items": WARDROBE}
        data = client.post("/generate-trip", json=body).get_json()
        assert len(data["packing_list"]) > 0
        # días estimados → debe avisar sobre clima estimado
        assert any("estim" in w.lower() for w in data["warnings"])

    def test_small_wardrobe_repeats_but_stays_complete(self, client):
        tiny = [
            {"$id": "s1", "type": "shirt", "color": "white", "occasion": "casual"},
            {"$id": "i1", "type": "pants", "color": "blue", "occasion": "casual"},
            {"$id": "z1", "type": "shoes", "color": "white", "occasion": "casual"},
        ]
        body = {"destination": "Paris", "days": 3, "occasion": "casual", "items": tiny}
        data = client.post("/generate-trip", json=body).get_json()
        # con una prenda por categoría y 3 días, todos completos aunque se repitan
        for day in data["days"]:
            assert tp._is_complete_outfit(day["outfit"])
        assert any(day["reused"] for day in data["days"])
