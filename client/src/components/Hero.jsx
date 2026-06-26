import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero({ site, onPrimary, onSecondary }) {
  const stats = site?.stats || {};
  return (
    <section className="hero" id="top">
      <div className="hero-blobs" aria-hidden>
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>

      <motion.div
        className="hero-content"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.span className="hero-badge" variants={item}>
          🐾 {site?.tagline || "Cada rescate es una segunda oportunidad"}
        </motion.span>

        <motion.h1 className="hero-title" variants={item}>
          {site?.heroTitle || "Damos una segunda oportunidad a quienes más lo necesitan"}
        </motion.h1>

        <motion.p className="hero-subtitle" variants={item}>
          {site?.heroSubtitle ||
            "Rescatamos, curamos y buscamos un hogar para animales en situación de calle."}
        </motion.p>

        <motion.div className="hero-actions" variants={item}>
          <button className="btn btn--primary" onClick={onPrimary}>
            Conocé a los animales en adopción
          </button>
          <button className="btn btn--ghost" onClick={onSecondary}>
            Ver transformaciones
          </button>
        </motion.div>

        {(stats.rescatados || stats.adoptados || stats.voluntarios) && (
          <motion.div className="hero-stats" variants={item}>
            {stats.rescatados && (
              <div className="stat">
                <strong>{stats.rescatados}</strong>
                <span>Rescatados</span>
              </div>
            )}
            {stats.adoptados && (
              <div className="stat">
                <strong>{stats.adoptados}</strong>
                <span>Adoptados</span>
              </div>
            )}
            {stats.voluntarios && (
              <div className="stat">
                <strong>{stats.voluntarios}</strong>
                <span>Voluntarios</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
