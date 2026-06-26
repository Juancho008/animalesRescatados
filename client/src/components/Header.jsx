import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SECTION_ORDER } from "../api.js";

export default function Header({ site, sections, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    onNavigate?.(id);
  };

  return (
    <motion.header
      className={`header${scrolled ? " header--scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="header-inner">
        <button className="brand" onClick={() => go("top")}>
          <img
            className="brand-logo"
            src={site?.logo || "/logo.png"}
            alt={site?.name || "Ambulancia de Mascotas"}
          />
        </button>

        <nav className={`nav${open ? " nav--open" : ""}`}>
          {SECTION_ORDER.map((id) => (
            <button key={id} className="nav-link" onClick={() => go(id)}>
              <span className="nav-emoji">{sections?.[id]?.emoji}</span>
              {sections?.[id]?.label || id}
            </button>
          ))}
          <a
            className="nav-cta"
            href={site?.donationLink || "#"}
            onClick={(e) => {
              if (!site?.donationLink) {
                e.preventDefault();
                go("adopcion");
              }
            }}
          >
            Quiero ayudar
          </a>
        </nav>

        <button
          className={`burger${open ? " burger--open" : ""}`}
          aria-label="Menú"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </motion.header>
  );
}
