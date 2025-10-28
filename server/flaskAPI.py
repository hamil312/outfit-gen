from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import torch
import numpy as np
from transformers import CLIPProcessor, CLIPModel
import cv2
from sklearn.cluster import KMeans
from rembg import remove

app = Flask(__name__)
CORS(app)

device = "cuda" if torch.cuda.is_available() else "cpu"

# ✅ Cargar modelo Fashion-CLIP desde HuggingFace
model_id = "patrickjohncyh/fashion-clip"
model = CLIPModel.from_pretrained(model_id).to(device)
processor = CLIPProcessor.from_pretrained(model_id)

# Clases personalizadas para tu app
CLOTHING_TYPES = ["shirt", "t-shirt", "pants", "shorts", "dress", "shoes", "jacket", "skirt"]
OCCASIONS = ["formal", "informal", "sport", "casual"]

def remove_background(image):
    """Elimina el fondo manteniendo transparencia."""
    image = image.copy()
    image.thumbnail((512, 512))
    output = remove(image)

    if not isinstance(output, Image.Image):
        output = Image.open(io.BytesIO(output))
    return output.convert("RGBA")

def get_dominant_color(image, k=3):
    """Detecta el color dominante ignorando fondos transparentes."""
    img = np.array(image)

    if img.shape[-1] == 4:
        mask = img[:, :, 3] > 0
        img = img[mask]
        img = img[:, :3]
    if len(img) == 0:
        return [0, 0, 0]

    img = cv2.resize(img.reshape(-1, 1, 3), (1, 150)).reshape(-1, 3)
    img = np.float32(img)

    kmeans = KMeans(n_clusters=k, n_init=10)
    kmeans.fit(img)

    colors = kmeans.cluster_centers_
    counts = np.bincount(kmeans.labels_)

    dominant_color = colors[np.argmax(counts)]
    return dominant_color.astype(int).tolist()

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    inputs = processor(
        text=CLOTHING_TYPES,
        images=image,
        return_tensors="pt",
        padding=True
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
        type_index = probs.argmax().item()
        clothing_type = CLOTHING_TYPES[type_index]
        confidence = probs[0][type_index].item()

    inputs2 = processor(
        text=OCCASIONS,
        images=image,
        return_tensors="pt",
        padding=True
    ).to(device)
    with torch.no_grad():
        outputs2 = model(**inputs2)
        logits2 = outputs2.logits_per_image
        probs2 = logits2.softmax(dim=1)
        occ_index = probs2.argmax().item()
        occasion = OCCASIONS[occ_index]
        occ_conf = probs2[0][occ_index].item()

    image_no_bg = remove_background(image)
    avg_color = get_dominant_color(image_no_bg)

    return jsonify({
        "type": clothing_type,
        "type_confidence": confidence,
        "occasion": occasion,
        "occasion_confidence": occ_conf,
        "color": avg_color
    })

if __name__ == "__main__":
    app.run(port=5000)