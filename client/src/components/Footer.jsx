import { whatsappLink } from "../api.js";

export default function Footer({ site }) {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-cta">
        <h2>¿Querés sumar una huella a tu familia?</h2>
        <p>Adoptá, apadriná o colaborá. Cada gesto cambia una vida.</p>
        <div className="footer-actions">
          {site?.whatsapp && (
            <a
              className="btn btn--primary"
              href={whatsappLink(site.whatsapp, "¡Hola! Quiero ayudar al refugio 🐾")}
              target="_blank"
              rel="noreferrer"
            >
              Escribinos por WhatsApp
            </a>
          )}
          {site?.instagram && (
            <a className="btn btn--ghost" href={site.instagram} target="_blank" rel="noreferrer">
              Seguinos en Instagram
            </a>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <img className="footer-logo" src={site?.logo || "/logo.png"} alt={site?.name || "Ambulancia de Mascotas"} />
        <p>
          {site?.name || "Huellas con Historia"} ·{" "}
          {site?.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
        </p>
        <p className="footer-credit">
          Hecho con ❤️ para los que no tienen voz · <a href="/admin">Panel admin</a>
        </p>
      </div>
    </footer>
  );
}
