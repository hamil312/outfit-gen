import io
import cv2
import numpy as np
from PIL import Image

try:
    import mediapipe as mp
    mp_pose = mp.solutions.pose
    _pose = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
    )
    _HAVE_MP = True
except Exception:
    _HAVE_MP = False

from context_engine import filter_items_by_profile


BODY_TYPES = {
    "rectangle": {
        "label": "Rectángulo (Atlético)",
        "description": "Hombros y caderas equilibrados, cintura poco definida",
        "recommendations": ["blazers", "cinturones", "escotes en V"],
    },
    "pear": {
        "label": "Pera (Triángulo)",
        "description": "Caderas más anchas que hombros",
        "recommendations": ["hombros estructurados", "escotes bardot", "colores claros arriba"],
    },
    "apple": {
        "label": "Manzana (Redondo)",
        "description": "Volumen en la zona media, hombros y caderas equilibrados",
        "recommendations": ["escotes en V", "telas ligeras", "líneas verticales"],
    },
    "hourglass": {
        "label": "Reloj de arena",
        "description": "Hombros y caderas equilibrados, cintura definida",
        "recommendations": ["ropa ceñida", "cinturones", "escotes pronunciados"],
    },
    "inverted_triangle": {
        "label": "Triángulo invertido",
        "description": "Hombros más anchos que caderas",
        "recommendations": ["volumen en caderas", "colores oscuros arriba", "escotes en U"],
    },
}


def _distance(a, b):
    return np.linalg.norm(np.array([a.x, a.y]) - np.array([b.x, b.y]))


def classify_from_landmarks(landmarks) -> dict:
    h, w = 1, 1  # normalized coords
    lm = landmarks.landmark

    left_shoulder = lm[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    left_hip = lm[mp_pose.PoseLandmark.LEFT_HIP]
    right_hip = lm[mp_pose.PoseLandmark.RIGHT_HIP]

    shoulder_width = _distance(left_shoulder, right_shoulder)
    hip_width = _distance(left_hip, right_hip)

    if hip_width < 0.01:
        return _no_pose()

    ratio = shoulder_width / hip_width

    left_waist = lm[mp_pose.PoseLandmark.LEFT_WAIST] if hasattr(mp_pose.PoseLandmark, "LEFT_WAIST") else None
    right_waist = lm[mp_pose.PoseLandmark.RIGHT_WAIST] if hasattr(mp_pose.PoseLandmark, "RIGHT_WAIST") else None

    hourglass_score = 0
    if left_waist and right_waist and left_waist.visibility > 0.5 and right_waist.visibility > 0.5:
        waist_width = _distance(left_waist, right_waist)
        waist_hip_ratio = waist_width / hip_width
        if waist_hip_ratio < 0.85:
            hourglass_score = 1

    if ratio > 1.15:
        cat = "inverted_triangle"
    elif ratio < 0.85:
        cat = "pear"
    elif hourglass_score > 0.5:
        cat = "hourglass"
    else:
        cat = "rectangle"

    return {
        "category": cat,
        "label": BODY_TYPES[cat]["label"],
        "description": BODY_TYPES[cat]["description"],
        "recommendations": BODY_TYPES[cat]["recommendations"],
        "measurements": {
            "shoulder_hip_ratio": round(float(ratio), 2),
        },
    }


def _no_pose():
    return {
        "category": "unknown",
        "label": "No detectable",
        "description": "No se pudo detectar la silueta. Prueba con una foto de cuerpo completo de frente.",
        "recommendations": [],
        "measurements": {},
    }


def detect_body_type(image_bytes: bytes) -> dict:
    if not _HAVE_MP:
        return _no_pose()

    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = _pose.process(img_rgb)

    if results.pose_landmarks:
        return classify_from_landmarks(results.pose_landmarks)
    return _no_pose()
