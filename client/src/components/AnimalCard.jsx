import { motion } from "framer-motion";
import { resolveImage } from "../api.js";

const TAG_LABELS = {
  nuevo: "Nuevo",
  destacado: "Destacado",
  urgente: "Urgente",
};

export default function AnimalCard({ animal, onOpen }) {
  const img = resolveImage(animal.image || animal.afterImage || animal.beforeImage);

  return (
    <motion.article
      className="card"
      onClick={() => onOpen?.(animal)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      <div className="card-media">
        {img ? (
          <img src={img} alt={animal.name} loading="lazy" />
        ) : (
          <div className="card-media--empty">🐾</div>
        )}
        {animal.species && <span className="card-species">{animal.species}</span>}
        {Array.isArray(animal.tags) && animal.tags.length > 0 && (
          <div className="card-tags">
            {animal.tags.map((t) => (
              <span key={t} className={`tag tag--${t}`}>
                {TAG_LABELS[t] || t}
              </span>
            ))}
          </div>
        )}
        <div className="card-overlay">
          <span className="card-overlay-btn">Ver historia</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-head">
          <h3>{animal.name || "Sin nombre"}</h3>
          {animal.age && <span className="card-age">{animal.age}</span>}
        </div>
        {animal.description && <p className="card-desc">{animal.description}</p>}
      </div>
    </motion.article>
  );
}
