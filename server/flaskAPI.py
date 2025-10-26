from flask import Flask, request, jsonify
from PIL import Image
import io
import clip
from flask_cors import CORS
import torch
import numpy as np

app = Flask(__name__)
CORS(app)

# Cargar modelo CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Clases posibles para tu caso
CLOTHING_TYPES = ["shirt", "t-shirt", "pants", "shorts", "dress", "shoes", "jacket", "skirt"]
OCCASIONS = ["formal", "informal", "sport", "casual"]

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # --- 1️⃣ Procesamiento de imagen ---
    image_tensor = preprocess(image).unsqueeze(0).to(device)

    # --- 2️⃣ Clasificación del tipo de prenda ---
    text_tokens = clip.tokenize(CLOTHING_TYPES).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image_tensor)
        text_features = model.encode_text(text_tokens)
        similarities = (image_features @ text_features.T).softmax(dim=-1)
        type_index = similarities.argmax().item()
        clothing_type = CLOTHING_TYPES[type_index]
        confidence = similarities[0][type_index].item()

    # --- 3️⃣ Clasificación del contexto (ocasión) ---
    text_tokens2 = clip.tokenize(OCCASIONS).to(device)
    with torch.no_grad():
        text_features2 = model.encode_text(text_tokens2)
        sim2 = (image_features @ text_features2.T).softmax(dim=-1)
        occ_index = sim2.argmax().item()
        occasion = OCCASIONS[occ_index]
        occ_conf = sim2[0][occ_index].item()

    # --- 4️⃣ Color promedio (simple) ---
    avg_color = np.array(image).mean(axis=(0, 1)).astype(int).tolist()

    # --- 5️⃣ Retornar resultados ---
    return jsonify({
        "type": clothing_type,
        "type_confidence": confidence,
        "occasion": occasion,
        "occasion_confidence": occ_conf,
        "color": avg_color
    })

if __name__ == "__main__":
    app.run(port=5000)