import { motion } from "framer-motion";

export default function Loader({ label = "Cargando historias…" }) {
  const paws = [0, 1, 2, 3];
  return (
    <div className="loader">
      <div className="loader-paws">
        {paws.map((i) => (
          <motion.span
            key={i}
            className="loader-paw"
            initial={{ opacity: 0.15, scale: 0.8, y: 6 }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.15, 0.8], y: [6, -4, 6] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          >
            🐾
          </motion.span>
        ))}
      </div>
      <p className="loader-text">{label}</p>
    </div>
  );
}
