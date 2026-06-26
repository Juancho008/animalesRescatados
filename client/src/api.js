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

export function whatsappLink(number, message) {
  const clean = (number || "").replace(/[^0-9]/g, "");
  const text = encodeURIComponent(message || "¡Hola! Quiero más información sobre los animales.");
  return `https://wa.me/${clean}?text=${text}`;
}
