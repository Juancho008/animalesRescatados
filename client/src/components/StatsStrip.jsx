import { motion } from "framer-motion";

const ITEMS = [
  { key: "rescatados", label: "Rescatados", emoji: "🐾" },
  { key: "adoptados", label: "Adoptados", emoji: "🏡" },
  { key: "voluntarios", label: "Voluntarios", emoji: "🤝" },
];

export default function StatsStrip({ site }) {
  const stats = site?.stats || {};
  const visible = ITEMS.filter((i) => stats[i.key]);
  if (visible.length === 0) return null;

  return (
    <section className="stats-strip">
      <div className="stats-strip-inner">
        {visible.map((item, i) => (
          <motion.div
            className="stat"
            key={item.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
          >
            <span className="stat-emoji">{item.emoji}</span>
            <strong>{stats[item.key]}</strong>
            <span className="stat-label">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
