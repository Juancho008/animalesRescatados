export const SECTION_ORDER = [
  "antes-despues",
  "rescatado",
  "recuperacion",
  "adopcion",
  "post-adopcion",
];

export const DEFAULT_SECTIONS = {
  "antes-despues": {
    label: "Antes y Después",
    emoji: "✨",
    description: "Transformaciones que demuestran el poder del amor y el cuidado.",
  },
  rescatado: {
    label: "Rescatados",
    emoji: "🆘",
    description: "Llegaron de la calle y hoy están a salvo con nosotros.",
  },
  recuperacion: {
    label: "En Recuperación",
    emoji: "💊",
    description: "Reciben tratamiento veterinario y mucho cariño para sanar.",
  },
  adopcion: {
    label: "En Adopción",
    emoji: "🏡",
    description: "Están listos para encontrar una familia para siempre.",
  },
  "post-adopcion": {
    label: "Post Adopción",
    emoji: "❤️",
    description: "Felices en sus nuevos hogares. ¡Final feliz logrado!",
  },
};

/** Resuelve la URL de una imagen (acepta URLs externas o ids internos). */
export function resolveImage(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  if (src.startsWith("/api/")) return src;
  return `/api/animal-image?id=${encodeURIComponent(src)}`;
}

export async function fetchData() {
  const res = await fetch("/api/data", { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "No se pudieron cargar los datos");
  }
  return res.json();
}

/** Junta todas las URLs de imágenes del sitio (banners + animales). */
export function collectImageUrls(data) {
  const urls = new Set();
  for (const b of data?.banners || []) {
    if (b?.image) urls.add(resolveImage(b.image));
  }
  for (const a of data?.animals || []) {
    for (const src of [a.image, a.beforeImage, a.afterImage]) {
      if (src) urls.add(resolveImage(src));
    }
  }
  if (data?.site?.logo) urls.add(resolveImage(data.site.logo));
  return [...urls];
}

function preloadOne(url) {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

/** Precarga imágenes con un tope de tiempo para no bloquear si alguna falla. */
export function preloadImages(urls, timeoutMs = 9000) {
  const all = Promise.all(urls.map(preloadOne));
  const timeout = new Promise((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([all, timeout]);
}

/** Oculta y elimina la pantalla de carga del index.html. */
export function hideSplash() {
  const el = document.getElementById("splash");
  if (!el) return;
  el.classList.add("splash--hidden");
  setTimeout(() => el.remove(), 600);
}

export function whatsappLink(number, message) {
  const clean = (number || "").replace(/[^0-9]/g, "");
  const text = encodeURIComponent(message || "¡Hola! Quiero más información sobre los animales.");
  return `https://wa.me/${clean}?text=${text}`;
}
