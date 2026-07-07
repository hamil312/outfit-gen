"use client";

import React, { useRef, useState, useCallback } from "react";

const CLASS_NAMES: Record<string, { label: string; desc: string }> = {
  ectomorfo:  { label: "Ectomorfo",  desc: "Cuerpo delgado, hombros estrechos, poca grasa corporal, metabolismo rápido" },
  endomorfo:  { label: "Endomorfo",  desc: "Cuerpo con tendencia a acumular grasa, complexión blanda y redondeada" },
  mesomorfo:  { label: "Mesomorfo",  desc: "Cuerpo atlético, musculoso, hombros anchos, cintura estrecha" },
};

interface BodyTypeCaptureProps {
  flaskUrl?: string;
  onComplete: (bodyType: string) => void;
  onSkip?: () => void;
  showSkip?: boolean;
  compact?: boolean;
}

export default function BodyTypeCapture({
  flaskUrl,
  onComplete,
  onSkip,
  showSkip = false,
  compact = false,
}: BodyTypeCaptureProps) {
  const API = flaskUrl || process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000";

  const [mode, setMode] = useState<"select" | "camera" | "upload">("select");
  const [modelVariant, setModelVariant] = useState<"default" | "20_perc">("default");
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    category: string; confidence: number; probabilities: Record<string, number>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    setResult(null);
    setPreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setError("Permiso de cámara denegado. Verifica los permisos del navegador o usa la opción de subir foto.");
      } else if (err?.name === "NotFoundError") {
        setError("No se encontró ninguna cámara en este dispositivo. Usa la opción de subir foto.");
      } else {
        setError("No se pudo acceder a la cámara. Usa la opción de subir foto.");
      }
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setPreview(URL.createObjectURL(blob));
      analyzeImage(blob);
    }, "image/jpeg", 0.9);
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(f));
    analyzeImage(f);
  };

  const analyzeImage = async (blob: Blob) => {
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", blob, "body.jpg");
      formData.append("model", modelVariant);
      const res = await fetch(`${API}/classify-body-type`, { method: "POST", body: formData });
      if (!res.ok) { setError("Error del servidor"); return; }
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    stopCamera();
    setMode("select");
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const compactMode = mode === "select" && compact;

  return (
    <div style={{ width: "100%" }}>
      {/* Model selector (always visible) */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
          Modelo de clasificación
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setModelVariant("default")}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, border: modelVariant === "default" ? "2px solid #6366f1" : "1px solid #d1d5db",
              background: modelVariant === "default" ? "#eef2ff" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: modelVariant === "default" ? 600 : 400,
            }}
          >
            Modelo estándar
          </button>
          <button
            type="button"
            onClick={() => setModelVariant("20_perc")}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, border: modelVariant === "20_perc" ? "2px solid #6366f1" : "1px solid #d1d5db",
              background: modelVariant === "20_perc" ? "#eef2ff" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: modelVariant === "20_perc" ? 600 : 400,
            }}
          >
            Modelo alternativo
          </button>
        </div>
      </div>

      {/* Mode selector */}
      {mode === "select" && (
        compactMode ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={startCamera} className="profile-btn profile-btn-primary" style={{ flex: 1 }}>
              Usar cámara
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="profile-btn profile-btn-secondary" style={{ flex: 1 }}>
              Subir foto
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button type="button" onClick={startCamera} className="profile-btn profile-btn-primary">
              📷 Tomar foto con la cámara
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="profile-btn profile-btn-secondary">
              📁 Subir imagen
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        )
      )}

      {/* Camera view */}
      {mode === "camera" && (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, display: "flex", gap: 8 }}>
            <button type="button" onClick={captureFrame} className="profile-btn profile-btn-primary" style={{ flex: 1 }}>
              Tomar foto
            </button>
            <button type="button" onClick={() => { stopCamera(); setMode("select"); }} className="profile-btn profile-btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Preview + analyzing */}
      {preview && analyzing && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <div className="gen-spinner" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#6b7280" }}>Analizando tipo de cuerpo…</p>
        </div>
      )}

      {preview && !analyzing && !result && !error && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: 12 }}>
          <img src={preview} alt="Preview" style={{ width: 100, height: 140, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Imagen capturada</p>
            <button type="button" onClick={reset} className="profile-btn profile-btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>
              Volver a tomar
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#166534" }}>
              {CLASS_NAMES[result.category]?.label || result.category}
            </h3>
            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
              {(result.confidence * 100).toFixed(1)}% confianza
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#374151", margin: "0 0 12px" }}>
            {CLASS_NAMES[result.category]?.desc}
          </p>
          <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 12 }}>
            {Object.entries(result.probabilities).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 80 }}>{CLASS_NAMES[key]?.label || key}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#e5e7eb" }}>
                  <div style={{ width: `${(val * 100).toFixed(0)}%`, height: 6, borderRadius: 3, background: "#6366f1" }} />
                </div>
                <span style={{ width: 36, textAlign: "right" }}>{(val * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => onComplete(result.category)}
              className="profile-btn profile-btn-primary"
              style={{ fontSize: 13, padding: "6px 14px" }}
            >
              Guardar en mi perfil
            </button>
            <button type="button" onClick={reset} className="profile-btn profile-btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Volver a escanear
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
          {error}
          <button type="button" onClick={reset} className="profile-btn profile-btn-secondary" style={{ fontSize: 12, padding: "2px 10px", marginLeft: 12 }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Skip */}
      {showSkip && onSkip && !result && (
        <button type="button" onClick={onSkip} style={{ marginTop: 12, fontSize: 13, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
          Saltar este paso
        </button>
      )}
    </div>
  );
}
