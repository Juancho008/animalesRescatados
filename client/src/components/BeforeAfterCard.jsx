import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { resolveImage } from "../api.js";

export default function BeforeAfterCard({ animal, onOpen }) {
  const [pos, setPos] = useState(50);
  const [width, setWidth] = useState(0);
  const sliderRef = useRef(null);
  const before = resolveImage(animal.beforeImage);
  const after = resolveImage(animal.afterImage || animal.image);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMove = (clientX) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
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
        ref={sliderRef}
        className="ba-slider"
        onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
        onMouseDown={(e) => handleMove(e.clientX)}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {after ? (
          <img className="ba-img ba-after" src={after} alt={`${animal.name} después`} draggable={false} />
        ) : (
          <div className="card-media--empty">🐾</div>
        )}

        <div className="ba-before-wrap" style={{ width: `${pos}%` }}>
          {before ? (
            <img
              className="ba-img ba-before"
              src={before}
              alt={`${animal.name} antes`}
              draggable={false}
              style={width ? { width: `${width}px` } : undefined}
            />
          ) : (
            <div className="card-media--empty" style={width ? { width: `${width}px` } : undefined}>
              🐾
            </div>
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
