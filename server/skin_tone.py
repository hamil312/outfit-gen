import cv2
import numpy as np
from PIL import Image
import io

SKIN_TONE_CATEGORIES = {
    "very_light": {"label": "Muy clara",  "hex": "#f8e8e0"},
    "light":      {"label": "Clara",      "hex": "#e8c8b0"},
    "medium":     {"label": "Media",      "hex": "#c8a080"},
    "tan":        {"label": "Bronceada",  "hex": "#a07050"},
    "dark":       {"label": "Oscura",     "hex": "#704030"},
    "very_dark":  {"label": "Muy oscura", "hex": "#402820"},
}

HAAR_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def _brightness(bgr):
    """Relative luminance from BGR pixel."""
    return 0.299 * bgr[2] + 0.587 * bgr[1] + 0.114 * bgr[0]


def _classify(brightness):
    if brightness > 220:
        return "very_light"
    if brightness > 180:
        return "light"
    if brightness > 140:
        return "medium"
    if brightness > 100:
        return "tan"
    if brightness > 60:
        return "dark"
    return "very_dark"


def _face_skin_avg(img):
    """Detect face and return average BGR of skin regions."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(HAAR_PATH)
    faces = cascade.detectMultiScale(gray, 1.1, 4, minSize=(80, 80))
    if len(faces) == 0:
        return None

    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    regions = [
        img[y:y + int(h * 0.3), x + int(w * 0.2):x + int(w * 0.8)],     # forehead
        img[y + int(h * 0.35):y + int(h * 0.7), x:x + int(w * 0.3)],     # left cheek
        img[y + int(h * 0.35):y + int(h * 0.7), x + int(w * 0.7):x + w], # right cheek
    ]
    samples = []
    for region in regions:
        if region.size == 0:
            continue
        hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, np.array([0, 20, 70]), np.array([20, 255, 255]))
        skin = region[mask > 0]
        if len(skin) > 0:
            samples.append(skin)

    if not samples:
        return None
    all_skin = np.vstack(samples)
    return np.mean(all_skin, axis=0)


def _fallback_skin_avg(img):
    """Fallback: use center crop + HSV skin filter for full-body images."""
    h, w = img.shape[:2]
    center = img[h // 4:3 * h // 4, w // 4:3 * w // 4]
    hsv = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, np.array([0, 20, 70]), np.array([20, 255, 255]))
    skin = center[mask > 0]
    if len(skin) > 0:
        return np.mean(skin, axis=0)
    return np.mean(center, axis=(0, 1))


def detect_skin_tone(image_bytes: bytes) -> dict:
    """Detect skin tone from raw image bytes. Returns category info."""
    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

    avg_bgr = _face_skin_avg(img)
    if avg_bgr is None:
        avg_bgr = _fallback_skin_avg(img)

    avg_bgr = np.clip(avg_bgr, 0, 255).astype(int)
    b = _brightness(avg_bgr)
    cat = _classify(b)

    return {
        "category": cat,
        "label": SKIN_TONE_CATEGORIES[cat]["label"],
        "hex": SKIN_TONE_CATEGORIES[cat]["hex"],
        "rgb": [int(avg_bgr[2]), int(avg_bgr[1]), int(avg_bgr[0])],
        "brightness": round(float(b), 1),
    }
