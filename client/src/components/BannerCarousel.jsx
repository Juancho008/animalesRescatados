import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { resolveImage } from "../api.js";

export default function BannerCarousel({ banners = [], onCta }) {
  const slides = banners.filter((b) => b && b.image);
  const [index, setIndex] = useState(0);

  const count = slides.length;
  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + count) % count),
    [count]
  );
  const goTo = (i) => setIndex(i);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const slide = slides[index];

  return (
    <section className="banner" id="top">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id || index}
          className="banner-slide"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: 7, ease: "linear" } }}
          style={{ backgroundImage: `url(${resolveImage(slide.image)})` }}
        />
      </AnimatePresence>

      <div className="banner-overlay" />

      <div className="banner-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={`txt-${slide.id || index}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {slide.title && <h1 className="banner-title">{slide.title}</h1>}
            {slide.subtitle && <p className="banner-subtitle">{slide.subtitle}</p>}
            {slide.ctaLabel && (
              <button
                className="btn btn--primary banner-cta"
                onClick={() => onCta?.(slide.ctaTarget)}
              >
                {slide.ctaLabel}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            className="banner-arrow banner-arrow--prev"
            onClick={() => go(-1)}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className="banner-arrow banner-arrow--next"
            onClick={() => go(1)}
            aria-label="Siguiente"
          >
            ›
          </button>
          <div className="banner-dots">
            {slides.map((s, i) => (
              <button
                key={s.id || i}
                className={`banner-dot${i === index ? " banner-dot--active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ir al banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
