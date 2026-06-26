import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { resolveImage, whatsappLink } from "../api.js";

export default function AnimalModal({ animal, site, sections, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = animal ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [animal, onClose]);

  return (
    <AnimatePresence>
      {animal && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>

            <div className="modal-media">
              {animal.status === "antes-despues" ? (
                <div className="modal-ba">
                  <figure>
                    <img src={resolveImage(animal.beforeImage)} alt="Antes" />
                    <figcaption>Antes</figcaption>
                  </figure>
                  <figure>
                    <img src={resolveImage(animal.afterImage || animal.image)} alt="Después" />
                    <figcaption>Después</figcaption>
                  </figure>
                </div>
              ) : (
                <img
                  src={resolveImage(animal.image || animal.afterImage)}
                  alt={animal.name}
                />
              )}
            </div>

            <div className="modal-body">
              <span className="modal-chip">
                {sections?.[animal.status]?.emoji} {sections?.[animal.status]?.label}
              </span>
              <h2>{animal.name}</h2>
              <div className="modal-meta">
                {animal.species && <span>{animal.species}</span>}
                {animal.age && <span>{animal.age}</span>}
              </div>
              {animal.description && <p className="modal-desc">{animal.description}</p>}
              {animal.story && <p className="modal-story">{animal.story}</p>}

              {site?.whatsapp && (
                <a
                  className="btn btn--primary modal-cta"
                  href={whatsappLink(
                    site.whatsapp,
                    `¡Hola! Me interesa ${animal.name} (${sections?.[animal.status]?.label || ""}).`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  {animal.status === "adopcion"
                    ? `Quiero adoptar a ${animal.name}`
                    : `Consultar por ${animal.name}`}
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
