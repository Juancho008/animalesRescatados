const { normalizeWorkerBase } = require("./_worker-proxy.cjs");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const id = (req.query?.id || "").toString();
  if (!id) return res.status(400).json({ error: "Falta id" });

  const workerBase = normalizeWorkerBase(process.env.CATALOG_WORKER_URL);
  if (!workerBase) {
    return res.status(500).json({ error: "Falta CATALOG_WORKER_URL en Vercel" });
  }

  try {
    const response = await fetch(
      `${workerBase}/api/animal-image?id=${encodeURIComponent(id)}`
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: "Imagen no encontrada" });
    }
    const contentType = response.headers.get("Content-Type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("[api/animal-image]", err);
    return res.status(502).json({ error: "No se pudo obtener la imagen" });
  }
};
