"""Tests for the pure functions in flaskAPI.py.

Heavy ML dependencies (torch, transformers, cv2, rembg) are mocked at module
level so the tests run fast without a GPU or model weights.
"""
import sys
from unittest.mock import MagicMock

# ── Mock heavy dependencies before importing flaskAPI ──────────────────────
mock_torch = MagicMock()
mock_torch.cuda.is_available.return_value = False
mock_torch.cuda = MagicMock()

mock_transformers = MagicMock()
mock_CLIPModel = MagicMock()
mock_CLIPProcessor = MagicMock()
mock_transformers.CLIPModel = mock_CLIPModel
mock_transformers.CLIPProcessor = mock_CLIPProcessor

mock_sklearn = MagicMock()
mock_kmeans = MagicMock()
mock_sklearn.cluster = MagicMock()
mock_sklearn.cluster.KMeans = mock_kmeans

modules = {
    "torch": mock_torch,
    "transformers": mock_transformers,
    "cv2": MagicMock(),
    "rembg": MagicMock(),
    "sklearn": mock_sklearn,
    "sklearn.cluster": mock_sklearn.cluster,
}
for k, v in modules.items():
    sys.modules[k] = v

# Prevent CLIP model from actually loading by stubbing the global names
# before flaskAPI's module-level code runs.
import flaskAPI as api
api.model = MagicMock()
api.processor = MagicMock()


# ── rgb_to_name ────────────────────────────────────────────────────────────

class TestRgbToName:
    def test_black(self):
        assert api.rgb_to_name([30, 30, 30]) == "black"

    def test_white(self):
        assert api.rgb_to_name([240, 240, 240]) == "white"

    def test_gray(self):
        assert api.rgb_to_name([128, 130, 132]) == "gray"

    def test_red(self):
        assert api.rgb_to_name([200, 50, 50]) == "red"

    def test_blue(self):
        assert api.rgb_to_name([50, 50, 200]) == "blue"

    def test_green(self):
        assert api.rgb_to_name([50, 180, 50]) == "green"

    def test_yellow(self):
        assert api.rgb_to_name([200, 200, 30]) == "yellow"

    def test_beige(self):
        assert api.rgb_to_name([130, 110, 50]) == "beige"

    def test_neutral_fallback(self):
        assert api.rgb_to_name([100, 150, 200]) == "neutral"

    def test_string_passthrough(self):
        assert api.rgb_to_name("blue") == "blue"

    def test_orange(self):
        assert api.rgb_to_name([255, 120, 30]) == "orange"

    def test_pink(self):
        assert api.rgb_to_name([255, 150, 200]) == "pink"

    def test_purple(self):
        assert api.rgb_to_name([150, 50, 200]) == "purple"

    def test_brown(self):
        assert api.rgb_to_name([139, 69, 19]) == "brown"

    def test_navy(self):
        assert api.rgb_to_name([30, 30, 100]) == "navy"


# ── color_compatible ───────────────────────────────────────────────────────

class TestColorCompatible:
    def test_same_color(self):
        assert api.color_compatible("blue", "blue") is True

    def test_black_with_any(self):
        assert api.color_compatible("black", "red") is True
        assert api.color_compatible("black", "white") is True

    def test_white_with_any(self):
        assert api.color_compatible("white", "blue") is True

    def test_neutral_with_any(self):
        assert api.color_compatible("neutral", "black") is True

    def test_incompatible(self):
        assert api.color_compatible("red", "green") is False

    def test_beige_with_white(self):
        assert api.color_compatible("beige", "white") is True

    def test_new_colors_compatible_with_neutrals(self):
        for c in ["orange", "pink", "purple", "brown", "navy"]:
            assert api.color_compatible(c, "white")
            assert api.color_compatible(c, "black")

    def test_yellow_with_white(self):
        assert api.color_compatible("yellow", "white") is True

    def test_navy_with_blue(self):
        assert api.color_compatible("navy", "blue") is True
        assert api.color_compatible("blue", "navy") is True


# ── _categorize ────────────────────────────────────────────────────────────

class TestCategorize:
    def test_superior(self):
        assert api._categorize("shirt") == "superior"
        assert api._categorize("t-shirt") == "superior"
        assert api._categorize("jacket") == "superior"
        assert api._categorize("Top") == "superior"  # legacy

    def test_inferior(self):
        assert api._categorize("pants") == "inferior"
        assert api._categorize("shorts") == "inferior"
        assert api._categorize("skirt") == "inferior"

    def test_completo(self):
        assert api._categorize("dress") == "completo"

    def test_calzado(self):
        assert api._categorize("shoes") == "calzado"

    def test_unknown(self):
        assert api._categorize("hat") is None
        assert api._categorize("") is None
        assert api._categorize(None) is None

    def test_case_insensitive(self):
        assert api._categorize("SHIRT") == "superior"
        assert api._categorize("Pants") == "inferior"


# ── compatible_ocasion ─────────────────────────────────────────────────────

class TestCompatibleOcasion:
    def test_same(self):
        assert api.compatible_ocasion("formal", "formal") is True
        assert api.compatible_ocasion("casual", "casual") is True

    def test_neutral_with_any(self):
        assert api.compatible_ocasion("neutral", "formal") is True
        assert api.compatible_ocasion("sport", "neutral") is True

    def test_informal_casual(self):
        assert api.compatible_ocasion("informal", "casual") is True
        assert api.compatible_ocasion("casual", "informal") is True

    def test_different_incompatible(self):
        assert api.compatible_ocasion("formal", "sport") is False
        assert api.compatible_ocasion("formal", "casual") is False


# ── compatible_material ────────────────────────────────────────────────────

class TestCompatibleMaterial:
    def test_same(self):
        assert api.compatible_material("cotton", "cotton") is True

    def test_unknown(self):
        assert api.compatible_material("unknown", "denim") is True
        assert api.compatible_material("denim", "unknown") is True

    def test_compatible_pair(self):
        assert api.compatible_material("denim", "cotton") is True

    def test_incompatible(self):
        assert api.compatible_material("cotton", "leather") is False


# ── prints_ok ──────────────────────────────────────────────────────────────

class TestPrintsOk:
    def test_rule_none(self):
        assert api.prints_ok({"print": "floral"}, {"print": "solid"}, None) is True

    def test_same_match(self):
        assert api.prints_ok({"print": "striped"}, {"print": "striped"}, "same") is True

    def test_same_no_match(self):
        assert api.prints_ok({"print": "striped"}, {"print": "solid"}, "same") is False

    def test_solid_both_solid(self):
        assert api.prints_ok({"print": "solid"}, {"print": "solid"}, "solid") is True

    def test_solid_printed_neutral(self):
        item = {"print": "floral", "color_name": "blue"}
        neutral = {"print": "solid", "color_name": "white"}
        assert api.prints_ok(item, neutral, "solid") is True

    def test_solid_printed_non_neutral(self):
        item = {"print": "floral", "color_name": "blue"}
        other = {"print": "solid", "color_name": "red"}
        assert api.prints_ok(item, other, "solid") is False

    def test_solid_both_printed_same(self):
        a = {"print": "floral", "color_name": "blue"}
        b = {"print": "floral", "color_name": "red"}
        assert api.prints_ok(a, b, "solid") is True

    def test_solid_both_printed_different(self):
        a = {"print": "floral", "color_name": "blue"}
        b = {"print": "striped", "color_name": "red"}
        assert api.prints_ok(a, b, "solid") is False

    def test_defaults_to_solid(self):
        assert api.prints_ok({}, {}, "solid") is True


# ── _match_outfits ─────────────────────────────────────────────────────────

class TestMatchOutfits:
    def _item(self, **kw):
        defaults = {
            "color_name": "blue", "occasion": "casual", "material": "cotton",
            "print": "solid", "type": "shirt", "name": "x", "image": "img",
        }
        defaults.update(kw)
        return defaults

    def test_simple_combo(self):
        sup = [self._item(type="shirt", color_name="blue")]
        inf = [self._item(type="pants", color_name="gray")]
        cal = [self._item(type="shoes", color_name="white")]
        result = api._match_outfits(sup, inf, cal, [])
        assert len(result) >= 1
        assert result[0]["superior"] == sup[0]
        assert result[0]["inferior"] == inf[0]

    def test_color_incompatible_skipped(self):
        sup = [self._item(type="shirt", color_name="red")]
        inf = [self._item(type="pants", color_name="green")]
        cal = [self._item(type="shoes", color_name="white")]
        result = api._match_outfits(sup, inf, cal, [])
        assert len(result) == 0

    def test_occasion_incompatible_skipped(self):
        sup = [self._item(type="shirt", color_name="blue", occasion="formal")]
        inf = [self._item(type="pants", color_name="black", occasion="sport")]
        cal = [self._item(type="shoes", color_name="white", occasion="casual")]
        result = api._match_outfits(sup, inf, cal, [])
        assert len(result) == 0

    def test_strict_material(self):
        sup = [self._item(type="shirt", color_name="blue", material="denim")]
        inf = [self._item(type="pants", color_name="black", material="cotton")]
        cal = [self._item(type="shoes", color_name="white", material="denim")]
        result = api._match_outfits(sup, inf, cal, [], strict_material=True)
        assert len(result) == 0

    def test_print_rule_same(self):
        sup = [self._item(type="shirt", color_name="blue", print="floral")]
        inf = [self._item(type="pants", color_name="black", print="striped")]
        cal = [self._item(type="shoes", color_name="white", print="solid")]
        result = api._match_outfits(sup, inf, cal, [], print_rule="same")
        assert len(result) == 0

    def test_material_balance(self):
        sup = [self._item(type="shirt", color_name="red", material="leather")]
        inf = [self._item(type="pants", color_name="gray", material="cotton")]
        cal = [self._item(type="shoes", color_name="black", material="cotton")]
        result = api._match_outfits(sup, inf, cal, [], balance=True)
        # leather (10) > cotton (4) so upper is heavier → valid
        assert len(result) >= 1

    def test_completo_combo(self):
        com = [self._item(type="dress", color_name="blue")]
        cal = [self._item(type="shoes", color_name="white")]
        result = api._match_outfits([], [], cal, com)
        assert len(result) >= 1
        assert result[0]["completo"] == com[0]


# ── generate_outfits ───────────────────────────────────────────────────────

class TestGenerateOutfits:
    """Integration-level tests for the full generation pipeline."""

    def _item(self, **kw):
        defaults = {
            "color_name": "blue", "occasion": "casual", "material": "cotton",
            "print": "solid", "type": "shirt", "name": "x", "image": "img",
            "style": "classic", "$id": "1",
        }
        defaults.update(kw)
        return defaults

    def _items_for_outfit(self):
        """Return a wardrobe that can produce at least one valid outfit."""
        return [
            self._item(type="shirt",    color=[100, 100, 200], color_name="blue",
                       occasion="casual", material="cotton", print="solid", style="classic"),
            self._item(type="pants",    color=[30, 30, 30], color_name="black",
                       occasion="casual", material="denim", print="solid", style="classic"),
            self._item(type="shoes",    color=[240, 240, 240], color_name="white",
                       occasion="casual", material="leather", print="solid", style="classic"),
        ]

    def test_basic_generation(self):
        items = self._items_for_outfit()
        result, _ = api.generate_outfits(items)
        assert len(result) >= 1
        o = result[0]
        assert "superior" in o or "completo" in o

    def test_style_filter(self):
        items = self._items_for_outfit()
        result, _ = api.generate_outfits(items, style="vintage")
        assert len(result) == 0

    def test_material_matching(self):
        items = self._items_for_outfit()
        result, _ = api.generate_outfits(items, material_matching=True)
        assert len(result) >= 1

    def test_print_matching(self):
        items = self._items_for_outfit()
        # All solid → same-print pass should work
        result, _ = api.generate_outfits(items, print_matching=True)
        assert len(result) >= 1

    def test_target_material(self):
        items = self._items_for_outfit()
        result, _ = api.generate_outfits(items, material_matching=True, target_material="denim")
        assert len(result) >= 1

    def test_empty_wardrobe(self):
        result, fallback = api.generate_outfits([])
        assert result == []
        assert not fallback

    def test_fallback_level1_color_compatible(self):
        """Level 1 fallback: items exist but no group matches occasion, fallback picks color-compatible."""
        items = [
            self._item(type="shirt", color=[200, 50, 50],  color_name="red",
                       occasion="party", material="cotton", print="solid", style="classic"),
            self._item(type="pants", color=[50, 50, 50],   color_name="black",
                       occasion="party", material="denim",  print="solid", style="classic"),
            self._item(type="shoes", color=[240, 240, 240],color_name="white",
                       occasion="party", material="leather",print="solid", style="classic"),
        ]
        result, fallback = api.generate_outfits(items, style="vintage")
        assert len(result) == 0
        assert not fallback

    def test_fallback_with_incompatible_items(self):
        """Verify fallback activates when no color-compatible combination exists."""
        items = [
            self._item(type="shirt",  color=[200, 50, 50],   color_name="red",
                       occasion="casual", material="cotton", print="solid", style="casual"),
            self._item(type="pants",  color=[50, 50, 200],   color_name="blue",
                       occasion="casual", material="denim",  print="solid", style="casual"),
            self._item(type="shoes",  color=[50, 50, 200],   color_name="blue",
                       occasion="casual", material="leather", print="solid", style="casual"),
        ]
        result, fallback = api.generate_outfits(items)
        assert fallback, "Debería activar fallback con colores incompatibles"
        assert len(result) == 1
        o = result[0]
        assert o.get("superior") or o.get("completo")
