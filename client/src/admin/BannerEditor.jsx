import { SECTION_ORDER } from "../api.js";
import ImageInput from "./ImageInput.jsx";

function emptyBanner() {
  return {
    id: crypto.randomUUID(),
    image: "",
    title: "",
    subtitle: "",
    ctaLabel: "",
    ctaTarget: "adopcion",
  };
}

export default function BannerEditor({ banners = [], sections, token, onChange }) {
  const update = (id, key, val) =>
    onChange(banners.map((b) => (b.id === id ? { ...b, [key]: val } : b)));

  const add = () => onChange([...banners, emptyBanner()]);
  const remove = (id) => {
    if (!confirm("¿Eliminar este banner?")) return;
    onChange(banners.filter((b) => b.id !== id));
  };
  const move = (index, dir) => {
    const next = [...banners];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-card">
      <div className="editor-toolbar">
        <div>
          <h2>Banner principal</h2>
          <p className="muted">Imágenes grandes del inicio (se rotan solas en carrusel).</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={add}>
          + Agregar banner
        </button>
      </div>

      {banners.length === 0 && <p className="muted">No hay banners. Agregá el primero.</p>}

      <div className="banner-editor-list">
        {banners.map((b, i) => (
          <div className="banner-editor-item" key={b.id}>
            <div className="banner-editor-order">
              <button className="btn-sm" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <span>#{i + 1}</span>
              <button
                className="btn-sm"
                onClick={() => move(i, 1)}
                disabled={i === banners.length - 1}
              >
                ↓
              </button>
            </div>

            <div className="banner-editor-fields">
              <ImageInput
                label="Imagen del banner (apaisada, 1800px aprox.)"
                value={b.image}
                token={token}
                onChange={(v) => update(b.id, "image", v)}
              />
              <div className="admin-form-grid">
                <label className="field field--full">
                  <span className="field-label">Título</span>
                  <input value={b.title} onChange={(e) => update(b.id, "title", e.target.value)} />
                </label>
                <label className="field field--full">
                  <span className="field-label">Subtítulo</span>
                  <textarea
                    rows={2}
                    value={b.subtitle}
                    onChange={(e) => update(b.id, "subtitle", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Texto del botón</span>
                  <input
                    value={b.ctaLabel}
                    onChange={(e) => update(b.id, "ctaLabel", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">El botón lleva a…</span>
                  <select
                    value={b.ctaTarget}
                    onChange={(e) => update(b.id, "ctaTarget", e.target.value)}
                  >
                    {SECTION_ORDER.map((id) => (
                      <option key={id} value={id}>
                        {sections[id]?.label || id}
                      </option>
                    ))}
                    <option value="contacto">Contacto (pie de página)</option>
                    <option value="top">Inicio</option>
                  </select>
                </label>
              </div>
              <button className="btn-sm btn-sm--danger" onClick={() => remove(b.id)}>
                Eliminar banner
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
