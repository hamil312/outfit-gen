"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clothing } from "@/app/models/Clothing";
import { FLASK_API_URL } from "@/lib/config";
import { IoShirtOutline } from "react-icons/io5";
import { BsStars, BsCamera } from "react-icons/bs";

const TYPE_OPTIONS = [
  { label: "Camisa", value: "shirt" },
  { label: "Camiseta", value: "t-shirt" },
  { label: "Chamarra", value: "jacket" },
  { label: "Vestido", value: "dress" },
  { label: "Pantalón", value: "pants" },
  { label: "Short", value: "shorts" },
  { label: "Falda", value: "skirt" },
  { label: "Zapatos", value: "shoes" },
];

const COLOR_OPTIONS = [
  "black", "white", "gray", "beige", "red", "blue", "green", "yellow",
  "orange", "pink", "purple", "brown", "navy", "neutral"
];

const MATERIAL_OPTIONS = [
  "cotton", "denim", "leather", "wool", "polyester", "silk", "linen",
  "nylon", "velvet", "lace", "chiffon", "knit", "fleece", "suede", "canvas"
];

const PRINT_OPTIONS = [
  "solid", "striped", "floral", "plaid", "polka dot", "graphic",
  "animal print", "geometric", "tie-dye", "checkered", "camouflage", "paisley"
];

const STYLE_OPTIONS = [
  "vintage", "bohemian", "minimalist", "streetwear", "preppy", "classic",
  "edgy", "romantic", "retro", "avant-garde", "punk", "nautical"
];

const OCCASION_OPTIONS = ["formal", "casual", "sport", "informal"];

interface ClothingFormProps {
  initialValues?: Partial<Clothing>;
  mode?: "create" | "edit";
  onSubmit: (values: any, file?: File | null) => Promise<any>;
}

export default function ClothingForm({
  initialValues = {},
  mode = "create",
  onSubmit,
}: ClothingFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: initialValues.name || "",
    color: initialValues.color || "",
    type: initialValues.type || "shirt",
    material: initialValues.material || "",
    print: initialValues.print || "",
    style: initialValues.style || "",
    size: initialValues.size || "",
    occasion: initialValues.occasion || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${FLASK_API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al analizar la imagen");

      const analysis = await response.json();

      setForm((current) => ({
        ...current,
        type: analysis.type || current.type,
        color: analysis.color_name || current.color,
        material: analysis.material || current.material,
        print: analysis.print || current.print,
        style: analysis.style || current.style,
        occasion: analysis.occasion || current.occasion,
      }));
    } catch (error) {
      console.error("Error al analizar la imagen:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
      await analyzeImage(selectedFile);
    } else {
      setPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 }
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setCameraError("Permiso de cámara denegado. Verifica los permisos del navegador o usa la opción de subir imagen.");
      } else if (err?.name === "NotFoundError") {
        setCameraError("No se encontró ninguna cámara en este dispositivo. Usa la opción de subir imagen.");
      } else {
        setCameraError("No se pudo acceder a la cámara. Usa la opción de subir imagen.");
      }
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stopCamera();
      const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
      handleFileChange(file);
    }, "image/jpeg", 0.9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !file) {
      return alert("Por favor selecciona una imagen");
    }

    setLoading(true);

    try {
      await onSubmit(form, file);

      if (mode === "create") {
        setForm({
          name: "",
          color: "",
          type: "shirt",
          material: "",
          print: "",
          style: "",
          size: "",
          occasion: "",
        });
        setFile(null);
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar la prenda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cf-form">
      <h2 className="cf-title">
        {mode === "create" ? "Añadir prenda" : "Editar prenda"}
      </h2>

      {/* Upload */}
      {mode === "create" && (
        <div className="cf-upload-area">
          {cameraError && (
            <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{cameraError}</span>
              <button type="button" onClick={() => setCameraError(null)} className="profile-btn profile-btn-secondary" style={{ fontSize: 12, padding: "2px 10px", marginLeft: 8 }}>
                OK
              </button>
            </div>
          )}
          {showCamera ? (
            <div className="cf-camera-container">
              <video ref={videoRef} autoPlay playsInline className="cf-camera-video" />
              <div className="cf-camera-actions">
                <button type="button" onClick={capturePhoto} className="cf-camera-btn cf-camera-capture">
                  <BsCamera size={16} /> Tomar foto
                </button>
                <button type="button" onClick={stopCamera} className="cf-camera-btn cf-camera-cancel">
                  Cancelar
                </button>
              </div>
            </div>
          ) : preview ? (
            <div className="cf-preview-container">
              <img src={preview} alt="Vista previa" className="cf-upload-preview" />
              <div className="cf-change-row">
                <button type="button" onClick={startCamera} className="cf-change-btn">
                  <BsCamera size={14} /> Tomar otra
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="cf-change-btn">
                  <IoShirtOutline size={14} /> Subir otra
                </button>
              </div>
            </div>
          ) : (
            <div className="cf-upload-options">
              <button type="button" onClick={startCamera} className="cf-upload-option">
                <BsCamera size={28} />
                <span className="cf-upload-text">Tomar foto</span>
                <span className="cf-upload-hint">Usa la cámara</span>
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="cf-upload-option">
                <IoShirtOutline size={28} />
                <span className="cf-upload-text">Subir imagen</span>
                <span className="cf-upload-hint">JPG, PNG, WEBP</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="cf-file-input"
            type="file"
            accept="image/*"
            className="cf-file-input"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] ?? null)
            }
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {isAnalyzing && (
            <div className="cf-analyzing">
              <BsStars size={14} />
              <span>Analizando imagen...</span>
            </div>
          )}
        </div>
      )}

      {/* Fields */}
      <div className="cf-fields">
        <div className="cf-field">
          <label htmlFor="cf-name" className="cf-label">Nombre</label>
          <input
            id="cf-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="cf-input"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-type" className="cf-label">Tipo</label>
          <select
            id="cf-type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="cf-input"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-color" className="cf-label">Color</label>
          <select
            id="cf-color"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-material" className="cf-label">Material</label>
          <select
            id="cf-material"
            name="material"
            value={form.material}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {MATERIAL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-print" className="cf-label">Estampado</label>
          <select
            id="cf-print"
            name="print"
            value={form.print}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {PRINT_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-style" className="cf-label">Estilo</label>
          <select
            id="cf-style"
            name="style"
            value={form.style}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {STYLE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-size" className="cf-label">Talla</label>
          <input
            id="cf-size"
            type="text"
            name="size"
            value={form.size}
            onChange={handleChange}
            className="cf-input"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-occasion" className="cf-label">Ocasión</label>
          <select
            id="cf-occasion"
            name="occasion"
            value={form.occasion}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {OCCASION_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isAnalyzing}
        className="cf-submit-btn"
      >
        {loading      ? "Guardando…"   :
         isAnalyzing  ? "Analizando…"  :
         mode === "create" ? "Añadir prenda" : "Guardar cambios"}
      </button>
    </form>
  );
}
