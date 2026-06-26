import { motion } from "framer-motion";
import AnimalCard from "./AnimalCard.jsx";
import BeforeAfterCard from "./BeforeAfterCard.jsx";

export default function Section({ id, meta, animals, onOpen, registerRef }) {
  if (!animals || animals.length === 0) return null;
  const isBeforeAfter = id === "antes-despues";

  return (
    <section
      className="section"
      id={id}
      ref={(el) => registerRef?.(id, el)}
    >
      <motion.div
        className="section-head"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="section-emoji">{meta?.emoji}</span>
        <h2 className="section-title">{meta?.label || id}</h2>
        {meta?.description && <p className="section-desc">{meta.description}</p>}
      </motion.div>

      <div className={isBeforeAfter ? "grid grid--ba" : "grid"}>
        {animals.map((a) =>
          isBeforeAfter ? (
            <BeforeAfterCard key={a.id} animal={a} onOpen={onOpen} />
          ) : (
            <AnimalCard key={a.id} animal={a} onOpen={onOpen} />
          )
        )}
      </div>
    </section>
  );
}
