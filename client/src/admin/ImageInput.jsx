import { useRef, useState } from "react";
import { resolveImage } from "../api.js";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageInput({ label, value, token, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, mime: file.type, filename: file.name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudo subir la imagen");
      onChange(json.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="img-input">
      <span className="field-label">{label}</span>
      <div className="img-input-row">
        <div className="img-preview">
          {value ? (
            <img src={resolveImage(value)} alt="preview" />
          ) : (
            <span>🐾</span>
          )}
        </div>
        <div className="img-input-actions">
          <button
            type="button"
            className="btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Subiendo…" : value ? "Cambiar" : "Subir imagen"}
          </button>
          {value && (
            <button type="button" className="btn-sm btn-sm--danger" onClick={() => onChange("")}>
              Quitar
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={handleFile}
          />
        </div>
      </div>
      <input
        type="text"
        className="img-url"
        placeholder="…o pegá una URL de imagen"
        value={value && /^https?:/i.test(value) ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
