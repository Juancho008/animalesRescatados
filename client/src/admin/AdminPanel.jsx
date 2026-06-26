import { useEffect, useState } from "react";
import { DEFAULT_SECTIONS, SECTION_ORDER } from "../api.js";
import AnimalEditor from "./AnimalEditor.jsx";
import BannerEditor from "./BannerEditor.jsx";

const STORAGE_KEY = "ar_admin_token";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export default function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("animals");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (token) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/data", { headers: authHeaders(password) });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "No se pudo ingresar");
      }
      sessionStorage.setItem(STORAGE_KEY, password);
      setToken(password);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken("");
    setData(null);
    setDirty(false);
  }

  async function loadData() {
    setError("");
    try {
      const r = await fetch("/api/admin/data", { headers: authHeaders(token) });
      const text = await r.text();
      if (!r.ok) throw new Error(JSON.parse(text).error || "No se pudieron cargar los datos");
      const parsed = JSON.parse(text);
      setData({
        site: parsed.site || {},
        sections: { ...DEFAULT_SECTIONS, ...(parsed.sections || {}) },
        banners: Array.isArray(parsed.banners) ? parsed.banners : [],
        animals: Array.isArray(parsed.animals) ? parsed.animals : [],
      });
      setDirty(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function save() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "No se pudo guardar");
      setMessage("¡Cambios guardados! Abrí el sitio en otra pestaña para verlos.");
      setDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const update = (next) => {
    setData(next);
    setDirty(true);
  };
  const setSite = (key, val) =>
    update({ ...data, site: { ...data.site, [key]: val } });
  const setStat = (key, val) =>
    update({ ...data, site: { ...data.site, stats: { ...(data.site.stats || {}), [key]: val } } });
  const setSection = (id, key, val) =>
    update({
      ...data,
      sections: { ...data.sections, [id]: { ...data.sections[id], [key]: val } },
    });

  if (!token) {
    return (
      <div className="admin-login">
        <form className="admin-login-card" onSubmit={login}>
          <span className="admin-login-mark">🐾</span>
          <h1>Panel de administración</h1>
          <p>Gestioná los animales rescatados y la información del sitio.</p>
          <label className="field">
            <span className="field-label">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de admin"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
          <a className="admin-back" href="/">
            ← Volver al sitio
          </a>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-login">
        <p className="muted">Cargando datos…</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-title">
          <span className="brand-mark">🐾</span>
          <div>
            <strong>Administración</strong>
            <span className="muted">{data.site.name || "Huellas con Historia"}</span>
          </div>
        </div>
        <div className="admin-bar-actions">
          {dirty && <span className="dirty-dot">● Cambios sin guardar</span>}
          <a className="btn-sm" href="/" target="_blank" rel="noreferrer">
            Ver sitio
          </a>
          <button className="btn btn--primary btn--sm" onClick={save} disabled={loading || !dirty}>
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
          <button className="btn-sm btn-sm--danger" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={tab === "animals" ? "active" : ""} onClick={() => setTab("animals")}>
          🐾 Animales
        </button>
        <button className={tab === "banner" ? "active" : ""} onClick={() => setTab("banner")}>
          🖼️ Banner
        </button>
        <button className={tab === "site" ? "active" : ""} onClick={() => setTab("site")}>
          ⚙️ Sitio
        </button>
        <button className={tab === "sections" ? "active" : ""} onClick={() => setTab("sections")}>
          🗂️ Secciones
        </button>
      </nav>

      <div className="admin-content">
        {message && <p className="admin-success">{message}</p>}
        {error && <p className="admin-error">{error}</p>}

        {tab === "animals" && (
          <AnimalEditor
            animals={data.animals}
            sections={data.sections}
            token={token}
            onChange={(animals) => update({ ...data, animals })}
          />
        )}

        {tab === "banner" && (
          <BannerEditor
            banners={data.banners}
            sections={data.sections}
            token={token}
            onChange={(banners) => update({ ...data, banners })}
          />
        )}

        {tab === "site" && (
          <div className="admin-card">
            <h2>Información del sitio</h2>
            <div className="admin-form-grid">
              <label className="field">
                <span className="field-label">Nombre del refugio</span>
                <input value={data.site.name || ""} onChange={(e) => setSite("name", e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">Frase (tagline)</span>
                <input value={data.site.tagline || ""} onChange={(e) => setSite("tagline", e.target.value)} />
              </label>
              <label className="field field--full">
                <span className="field-label">Título principal (hero)</span>
                <input value={data.site.heroTitle || ""} onChange={(e) => setSite("heroTitle", e.target.value)} />
              </label>
              <label className="field field--full">
                <span className="field-label">Subtítulo (hero)</span>
                <textarea
                  rows={2}
                  value={data.site.heroSubtitle || ""}
                  onChange={(e) => setSite("heroSubtitle", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">WhatsApp (con código país, sin +)</span>
                <input
                  value={data.site.whatsapp || ""}
                  placeholder="5491100000000"
                  onChange={(e) => setSite("whatsapp", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Instagram (URL)</span>
                <input value={data.site.instagram || ""} onChange={(e) => setSite("instagram", e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">Email</span>
                <input value={data.site.email || ""} onChange={(e) => setSite("email", e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">Link de donaciones (URL)</span>
                <input value={data.site.donationLink || ""} onChange={(e) => setSite("donationLink", e.target.value)} />
              </label>
            </div>

            <h3 className="admin-subhead">Estadísticas del hero</h3>
            <div className="admin-form-grid">
              <label className="field">
                <span className="field-label">Rescatados</span>
                <input
                  value={data.site.stats?.rescatados || ""}
                  onChange={(e) => setStat("rescatados", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Adoptados</span>
                <input
                  value={data.site.stats?.adoptados || ""}
                  onChange={(e) => setStat("adoptados", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Voluntarios</span>
                <input
                  value={data.site.stats?.voluntarios || ""}
                  onChange={(e) => setStat("voluntarios", e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {tab === "sections" && (
          <div className="admin-card">
            <h2>Textos de las secciones</h2>
            <p className="muted">Personalizá el título, emoji y descripción de cada categoría.</p>
            {SECTION_ORDER.map((id) => (
              <div className="section-row" key={id}>
                <div className="admin-form-grid">
                  <label className="field field--mini">
                    <span className="field-label">Emoji</span>
                    <input
                      value={data.sections[id]?.emoji || ""}
                      onChange={(e) => setSection(id, "emoji", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Título</span>
                    <input
                      value={data.sections[id]?.label || ""}
                      onChange={(e) => setSection(id, "label", e.target.value)}
                    />
                  </label>
                  <label className="field field--full">
                    <span className="field-label">Descripción</span>
                    <input
                      value={data.sections[id]?.description || ""}
                      onChange={(e) => setSection(id, "description", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
