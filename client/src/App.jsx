import { useEffect, useMemo, useRef, useState } from "react";
import { fetchData, SECTION_ORDER, DEFAULT_SECTIONS } from "./api.js";
import Loader from "./components/Loader.jsx";
import Header from "./components/Header.jsx";
import BannerCarousel from "./components/BannerCarousel.jsx";
import StatsStrip from "./components/StatsStrip.jsx";
import Section from "./components/Section.jsx";
import AnimalModal from "./components/AnimalModal.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    let active = true;
    fetchData()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const site = data?.site || {};
  const sections = useMemo(
    () => ({ ...DEFAULT_SECTIONS, ...(data?.sections || {}) }),
    [data]
  );

  const grouped = useMemo(() => {
    const map = {};
    for (const id of SECTION_ORDER) map[id] = [];
    for (const animal of data?.animals || []) {
      if (map[animal.status]) map[animal.status].push(animal);
    }
    return map;
  }, [data]);

  const registerRef = (id, el) => {
    if (el) sectionRefs.current[id] = el;
  };

  const scrollTo = (target) => {
    if (!target || target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener");
      return;
    }
    const el = sectionRefs.current[target] || document.getElementById(target);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="screen-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-center">
        <div className="error-box">
          <span>😿</span>
          <h2>No pudimos cargar la información</h2>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasAnimals = (data?.animals || []).length > 0;
  const banners = data?.banners || [];

  return (
    <div className="app">
      <Header site={site} sections={sections} onNavigate={scrollTo} />
      <BannerCarousel banners={banners} onCta={scrollTo} />
      <StatsStrip site={site} />

      <main className="sections">
        {!hasAnimals && (
          <div className="empty-state">
            <span>🐾</span>
            <h2>Todavía no hay animales cargados</h2>
            <p>
              Ingresá al <a href="/admin">panel de administración</a> para agregar las primeras
              historias.
            </p>
          </div>
        )}
        {SECTION_ORDER.map((id) => (
          <Section
            key={id}
            id={id}
            meta={sections[id]}
            animals={grouped[id]}
            onOpen={setSelected}
            registerRef={registerRef}
          />
        ))}
      </main>

      <Footer site={site} />
      <AnimalModal
        animal={selected}
        site={site}
        sections={sections}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
