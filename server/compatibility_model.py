import os
import torch
from torch import nn
import numpy as np
from typing import Optional

MODEL_PATH = os.path.join(os.path.dirname(__file__), "compatibility_head.pth")
EMBED_DIM = 512


class CompatibilityHead(nn.Module):
    def __init__(self, embed_dim=EMBED_DIM):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(embed_dim * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
        )

    def forward(self, emb_a, emb_b):
        x = torch.cat([emb_a, emb_b], dim=1)
        return self.net(x).squeeze(-1)


def _item_to_text(item: dict) -> str:
    """Construct a descriptive text for a clothing item."""
    parts = []
    color = item.get("color_name") or item.get("color") or ""
    if isinstance(color, list):
        color = ""
    parts.append(str(color))
    parts.append(item.get("material", ""))
    parts.append(item.get("type", ""))
    occ = item.get("occasion", "")
    if occ and occ != "neutral":
        parts.append(occ)
    style = item.get("style", "")
    if style and style != "unknown":
        parts.append(style)
    text = " ".join(p for p in parts if p)
    return text if text else "clothing item"


class OutfitScorer:
    def __init__(self, clip_model=None, clip_processor=None, device: Optional[str] = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.clip_model = clip_model
        self.clip_processor = clip_processor
        self._load()

    def _load(self):
        if not os.path.exists(MODEL_PATH):
            return
        try:
            self.model = CompatibilityHead().to(self.device)
            self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device, weights_only=True))
            self.model.eval()
        except Exception:
            self.model = None

    def set_clip(self, clip_model, clip_processor):
        self.clip_model = clip_model
        self.clip_processor = clip_processor

    @property
    def available(self) -> bool:
        return self.model is not None and self.clip_model is not None

    def _get_embedding(self, item: dict) -> Optional[np.ndarray]:
        if not self.clip_model or not self.clip_processor:
            return None
        text = _item_to_text(item)
        try:
            inputs = self.clip_processor(text=[text], return_tensors="pt", padding=True, truncation=True).to(self.device)
            with torch.no_grad():
                emb = self.clip_model.get_text_features(**inputs)
            return emb.cpu().numpy().flatten()
        except Exception:
            return None

    def score_pair(self, emb_a: np.ndarray, emb_b: np.ndarray) -> float:
        if not self.available:
            return 0.5
        with torch.no_grad():
            a = torch.from_numpy(emb_a).float().to(self.device).unsqueeze(0)
            b = torch.from_numpy(emb_b).float().to(self.device).unsqueeze(0)
            logit = self.model(a, b)
            prob = torch.sigmoid(logit).item()
        return prob

    def score_outfit(self, embeddings: list[np.ndarray]) -> float:
        if len(embeddings) < 2:
            return 0.5
        scores = []
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                scores.append(self.score_pair(embeddings[i], embeddings[j]))
        return float(np.mean(scores)) if scores else 0.5

    def score_outfit_from_items(self, items: list[dict]) -> float:
        embs = [self._get_embedding(it) for it in items]
        embs = [e for e in embs if e is not None]
        return self.score_outfit(embs)

    def rank_outfits(self, outfits: list[dict]) -> list[tuple[float, dict]]:
        if not self.available or not outfits:
            return [(0.5, o) for o in outfits]
        scored = []
        for outfit in outfits:
            items = []
            for slot in ["superior", "inferior", "calzado", "completo"]:
                item = outfit.get(slot)
                if item:
                    items.append(item)
            score = self.score_outfit_from_items(items)
            scored.append((score, outfit))
        scored.sort(key=lambda x: -x[0])
        return scored


scorer = OutfitScorer()
