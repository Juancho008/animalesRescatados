import { useState } from "react";
import { SECTION_ORDER } from "../api.js";
import ImageInput from "./ImageInput.jsx";

const TAG_OPTIONS = ["nuevo", "destacado", "urgente"];

function emptyAnimal() {
  return {
    id: crypto.randomUUID(),
    name: "",
    status: "rescatado",
    species: "",
    age: "",
    description: "",
    story: "",
    image: "",
    beforeImage: "",
    afterImage: "",
    tags: [],
    createdAt: new Date().toISOString(),
  };
}

export default function AnimalEditor({ animals, sections, token, onChange }) {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("todos");

  const startNew = () => setEditing(emptyAnimal());

  const save = (animal) => {
    const exists = animals.some((a) => a.id === animal.id);
    const next = exists
      ? animals.map((a) => (a.id === animal.id ? animal : a))
      : [animal, ...animals];
    onChange(next);
    setEditing(null);
  };

  const remove = (id) => {
    if (!confirm("¿Eliminar este animal?")) return;
    onChange(animals.filter((a) => a.id !== id));
  };

  const visible =
    filter === "todos" ? animals : animals.filter((a) => a.status === filter);

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <div className="editor-filters">
          <button
            className={filter === "todos" ? "chip chip--active" : "chip"}
            onClick={() => setFilter("todos")}
          >
            Todos ({animals.length})
          </button>
          {SECTION_ORDER.map((id) => {
            const count = animals.filter((a) => a.status === id).length;
            return (
              <button
                key={id}
                className={filter === id ? "chip chip--active" : "chip"}
                onClick={() => setFilter(id)}
              >
                {sections[id]?.emoji} {sections[id]?.label} ({count})
              </button>
            );
          })}
        </div>
        <button className="btn btn--primary btn--sm" onClick={startNew}>
          + Agregar animal
        </button>
      </div>

      <div className="editor-list">
        {visible.length === 0 && <p className="muted">No hay animales en esta categoría.</p>}
        {visible.map((a) => (
          <div className="editor-item" key={a.id}>
            <div className="editor-item-thumb">
              {a.image || a.afterImage || a.beforeImage ? (
                <img
                  src={
                    /^https?:/i.test(a.image || a.afterImage || a.beforeImage)
                      ? a.image || a.afterImage || a.beforeImage
                      : `/api/animal-image?id=${(a.image || a.afterImage || a.beforeImage).replace(
                          "/api/animal-image?id=",
                          ""
                        )}`
                  }
                  alt={a.name}
                />
              ) : (
                <span>🐾</span>
              )}
            </div>
            <div className="editor-item-info">
              <strong>{a.name || "Sin nombre"}</strong>
              <span className="muted">
                {sections[a.status]?.label || a.status} · {a.species || "—"}
              </span>
            </div>
            <div className="editor-item-actions">
              <button className="btn-sm" onClick={() => setEditing(a)}>
                Editar
              </button>
              <button className="btn-sm btn-sm--danger" onClick={() => remove(a.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <AnimalForm
          animal={editing}
          sections={sections}
          token={token}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function AnimalForm({ animal, sections, token, onCancel, onSave }) {
  const [form, setForm] = useState(animal);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isBA = form.status === "antes-despues";

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags?.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...(f.tags || []), tag],
    }));

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <header className="admin-form-head">
          <h3>{animal.name ? `Editar ${animal.name}` : "Nuevo animal"}</h3>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </header>

        <div className="admin-form-grid">
          <label className="field">
            <span className="field-label">Nombre</span>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Estado / Sección</span>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {SECTION_ORDER.map((id) => (
                <option key={id} value={id}>
                  {sections[id]?.label || id}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Especie</span>
            <input
              value={form.species}
              placeholder="Perro, Gato…"
              onChange={(e) => set("species", e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Edad</span>
            <input
              value={form.age}
              placeholder="2 años, 6 meses…"
              onChange={(e) => set("age", e.target.value)}
            />
          </label>

          <label className="field field--full">
            <span className="field-label">Descripción corta</span>
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>

          <label className="field field--full">
            <span className="field-label">Historia completa</span>
            <textarea
              rows={4}
              value={form.story}
              onChange={(e) => set("story", e.target.value)}
            />
          </label>

          {isBA ? (
            <>
              <div className="field">
                <ImageInput
                  label="Imagen ANTES"
                  value={form.beforeImage}
                  token={token}
                  onChange={(v) => set("beforeImage", v)}
                />
              </div>
              <div className="field">
                <ImageInput
                  label="Imagen DESPUÉS"
                  value={form.afterImage}
                  token={token}
                  onChange={(v) => set("afterImage", v)}
                />
              </div>
            </>
          ) : (
            <div className="field field--full">
              <ImageInput
                label="Imagen"
                value={form.image}
                token={token}
                onChange={(v) => set("image", v)}
              />
            </div>
          )}

          <div className="field field--full">
            <span className="field-label">Etiquetas</span>
            <div className="tag-picker">
              {TAG_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={form.tags?.includes(t) ? "chip chip--active" : "chip"}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="admin-form-foot">
          <button className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
          >
            Guardar animal
          </button>
        </footer>
      </div>
    </div>
  );
}
