"""Pruebas para wardrobe_analyzer.py (análisis de guardarropa y recomendaciones).

La llamada de red a DummyJSON en /search-store se mockea con monkeypatch.
"""
from flask import Flask
from unittest.mock import MagicMock

import wardrobe_analyzer as wa


def _client():
    app = Flask(__name__)
    app.register_blueprint(wa.wardrobe_bp)
    return app.test_client()


# ── helpers puros ─────────────────────────────────────────────────────────────

class TestHelpers:
    def test_cat_known_types(self):
        assert wa._cat("shirt") == "superior"
        assert wa._cat("Pants") == "inferior"
        assert wa._cat("SHOES") == "calzado"
        assert wa._cat("dress") == "completo"

    def test_cat_unknown(self):
        assert wa._cat("hat") is None
        assert wa._cat("") is None

    def test_occasion_ok_neutral_always_true(self):
        assert wa._occasion_ok("neutral", "formal") is True
        assert wa._occasion_ok("", "sport") is True

    def test_occasion_ok_casual_informal_equivalent(self):
        assert wa._occasion_ok("casual", "informal") is True
        assert wa._occasion_ok("informal", "casual") is True

    def test_occasion_ok_mismatch(self):
        assert wa._occasion_ok("formal", "sport") is False

    def test_parse_products_skips_unnamed(self):
        raw = [{"title": "Camisa", "price": 20, "rating": 4.2, "thumbnail": "x"},
               {"price": 5}]  # sin title → se omite
        out = wa._parse_products(raw)
        assert len(out) == 1
        assert out[0]["name"] == "Camisa"
        assert out[0]["price"] == "$20"

    def test_color_sort_prioritizes_color(self):
        products = [{"name": "Camisa azul"}, {"name": "Camisa roja"}]
        out = wa._color_sort(products, "roja")
        assert out[0]["name"] == "Camisa roja"

    def test_build_store_links_returns_three_stores(self):
        links = wa._build_store_links("camisa", "blue", "male", "superior")
        stores = {l["store"] for l in links}
        assert stores == {"Zara", "H&M", "Zalando"}
        assert all(l["url"].startswith("http") for l in links)


# ── /analyze-wardrobe ─────────────────────────────────────────────────────────

class TestAnalyzeWardrobe:
    def test_empty_wardrobe(self):
        resp = _client().post("/analyze-wardrobe", json={"clothes": []})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["total"] == 0
        # todos los slots vacíos → cuatro carencias críticas
        assert all(g["severity"] == "critical" for g in data["gaps"])
        assert len(data["gaps"]) == 4

    def test_complete_wardrobe_can_make_outfit(self):
        clothes = [
            {"type": "shirt", "color": "white", "occasion": "casual", "material": "cotton", "style": "classic"},
            {"type": "pants", "color": "blue", "occasion": "casual", "material": "denim", "style": "classic"},
            {"type": "shoes", "color": "white", "occasion": "casual", "material": "canvas", "style": "classic"},
        ]
        resp = _client().post("/analyze-wardrobe", json={"clothes": clothes})
        data = resp.get_json()
        assert data["total"] == 3
        assert data["category_counts"]["superior"] == 1
        assert data["occasion_slot_coverage"]["casual"]["can_make_outfit"] is True

    def test_missing_shoes_reported_in_coverage(self):
        clothes = [
            {"type": "shirt", "color": "white", "occasion": "casual"},
            {"type": "pants", "color": "blue", "occasion": "casual"},
        ]
        resp = _client().post("/analyze-wardrobe", json={"clothes": clothes})
        data = resp.get_json()
        cov = data["occasion_slot_coverage"]["casual"]
        assert cov["can_make_outfit"] is False
        assert "calzado" in cov["missing_slots"]

    def test_distributions(self):
        clothes = [
            {"type": "shirt", "color": "black", "occasion": "formal", "material": "cotton", "style": "classic"},
            {"type": "shirt", "color": "black", "occasion": "formal", "material": "wool", "style": "classic"},
        ]
        resp = _client().post("/analyze-wardrobe", json={"clothes": clothes})
        data = resp.get_json()
        assert data["color_distribution"]["black"] == 2
        assert data["style_distribution"]["classic"] == 2


# ── /recommend-items ──────────────────────────────────────────────────────────

class TestRecommendItems:
    def test_recommends_missing_slots(self):
        # solo superiores → calzado/inferior deberían recomendarse (slots débiles)
        clothes = [{"type": "shirt", "color": "white", "occasion": "casual"}]
        body = {"clothes": clothes, "profile": {"coord_formality": 0.5}, "gender": "male"}
        resp = _client().post("/recommend-items", json=body)
        assert resp.status_code == 200
        recs = resp.get_json()["recommendations"]
        cats = {r["category"] for r in recs}
        assert "calzado" in cats
        assert "inferior" in cats

    def test_male_omits_completo(self):
        clothes = [{"type": "shirt", "occasion": "casual"}]
        body = {"clothes": clothes, "profile": {}, "gender": "male"}
        recs = _client().post("/recommend-items", json=body).get_json()["recommendations"]
        assert all(r["category"] != "completo" for r in recs)

    def test_high_color_intensity_recommends_vivid(self):
        clothes = [{"type": "shirt", "occasion": "casual", "color": "black"}]
        body = {"clothes": clothes, "profile": {"coord_colorIntensity": 0.9}, "gender": "male"}
        recs = _client().post("/recommend-items", json=body).get_json()["recommendations"]
        vivid = {"red", "blue", "green", "orange", "purple", "yellow"}
        assert all(r["color"] in vivid for r in recs)


# ── /search-store (red mockeada) ──────────────────────────────────────────────

class TestSearchStore:
    def test_products_and_links(self, monkeypatch):
        fake_resp = MagicMock()
        fake_resp.status_code = 200
        fake_resp.json.return_value = {
            "products": [
                {"title": "Camisa azul", "price": 25, "rating": 4.5, "thumbnail": "img"},
            ]
        }
        monkeypatch.setattr(wa.requests, "get", lambda *a, **k: fake_resp)

        body = {"search_term": "camisa", "slot": "superior",
                "occasion": "casual", "color": "blue", "gender": "male"}
        resp = _client().post("/search-store", json=body)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data["products"]) == 1
        assert data["products"][0]["name"] == "Camisa azul"
        assert len(data["store_links"]) == 3

    def test_inferior_slot_has_no_catalog_only_links(self, monkeypatch):
        # 'inferior' no tiene catálogo en DummyJSON → products vacío, pero sí links
        monkeypatch.setattr(wa.requests, "get", lambda *a, **k: (_ for _ in ()).throw(AssertionError("no debe llamarse")))
        body = {"search_term": "jeans", "slot": "inferior", "color": "blue", "gender": "male"}
        resp = _client().post("/search-store", json=body)
        data = resp.get_json()
        assert data["products"] == []
        assert len(data["store_links"]) == 3
