import { useState } from "react";
import { motion } from "framer-motion";
import { resolveImage } from "../api.js";

export default function BeforeAfterCard({ animal, onOpen }) {
  const [pos, setPos] = useState(50);
  const before = resolveImage(animal.beforeImage);
  const after = resolveImage(animal.afterImage || animal.image);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  };

  return (
    <motion.article
      className="ba-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      whileHover={{ y: -6 }}
    >
      <div
        className="ba-slider"
        onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
        onTouchMove={handleMove}
        onClick={handleMove}
      >
        {after ? (
          <img className="ba-img ba-after" src={after} alt={`${animal.name} después`} />
        ) : (
          <div className="card-media--empty">🐾</div>
        )}
        <div className="ba-before-wrap" style={{ width: `${pos}%` }}>
          {before ? (
            <img className="ba-img ba-before" src={before} alt={`${animal.name} antes`} />
          ) : (
            <div className="card-media--empty">🐾</div>
          )}
        </div>
        <span className="ba-label ba-label--before">Antes</span>
        <span className="ba-label ba-label--after">Después</span>
        <div className="ba-handle" style={{ left: `${pos}%` }}>
          <span>⟷</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-head">
          <h3>{animal.name}</h3>
          {animal.age && <span className="card-age">{animal.age}</span>}
        </div>
        {animal.description && <p className="card-desc">{animal.description}</p>}
        {animal.story && (
          <button className="link-btn" onClick={() => onOpen?.(animal)}>
            Leer historia completa →
          </button>
        )}
      </div>
    </motion.article>
  );
}
