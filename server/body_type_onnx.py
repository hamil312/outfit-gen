import onnxruntime as ort
import numpy as np
from PIL import Image
import io
import os
import warnings

CLASS_NAMES = ["ectomorfo", "endomorfo", "mesomorfo"]

_models = {}


def _check_external_data(model_path):
    """Check if the ONNX model uses external data format."""
    try:
        import onnx
        onnx_model = onnx.load(model_path, load_external_data=False)
        for init in onnx_model.graph.initializer:
            if init.HasField("data_location") and init.data_location != onnx.TensorProto.DEFAULT:
                return True
        return False
    except ImportError:
        return None


class BodyTypeONNX:
    def __init__(self, model_path):
        # Try to load - if external data missing, try to fix
        try:
            self.session = ort.InferenceSession(model_path)
        except Exception as e:
            if "file_size" in str(e) or "external_data" in str(e):
                has_ext = _check_external_data(model_path)
                if has_ext:
                    data_path = model_path + ".data"
                    if not os.path.exists(data_path):
                        raise RuntimeError(
                            f"Model '{os.path.basename(model_path)}' uses external data "
                            f"but '{os.path.basename(model_path)}.data' is missing. "
                            f"Re-export the model from the notebook (the export cell now "
                            f"produces self-contained ONNX files)."
                        )
            raise

        self.input_name = self.session.get_inputs()[0].name

    def predict(self, image_bytes):
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_array = (img_array - mean) / std
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0).astype(np.float32)

        outputs = self.session.run(None, {self.input_name: img_array})[0]
        exp = np.exp(outputs[0] - np.max(outputs[0]))
        probs = exp / np.sum(exp)
        idx = int(np.argmax(probs))

        return {
            "category": CLASS_NAMES[idx],
            "confidence": float(probs[idx]),
            "probabilities": {
                CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))
            },
        }


def get_model(variant="default"):
    global _models
    if variant not in _models:
        filename = (
            "body_type_model_20_perc.onnx" if variant == "20_perc" else "body_type_model.onnx"
        )
        path = os.path.join(os.path.dirname(__file__), filename)
        _models[variant] = BodyTypeONNX(path)
    return _models[variant]
