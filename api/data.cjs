const { createHmacHeaders, normalizeWorkerBase } = require("./_worker-proxy.cjs");

const WORKER_PATH = "/data.json";

function parseWorkerError(body, status) {
  let detail = body;
  try {
    detail = JSON.parse(body).error || body;
  } catch {
    /* respuesta no JSON */
  }
  if (status === 401) {
    return "Firma HMAC rechazada por Cloudflare. Verificá que DATA_HMAC_SECRET sea idéntico en Vercel y Cloudflare, y que CATALOG_WORKER_URL sea solo el dominio del Worker (sin /data.json).";
  }
  return detail || "El Worker rechazó la solicitud";
}

function isValidJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const workerBase = normalizeWorkerBase(process.env.CATALOG_WORKER_URL);
  const secret = process.env.DATA_HMAC_SECRET?.trim();

  if (!workerBase || !secret) {
    return res.status(500).json({
      error: "Faltan CATALOG_WORKER_URL o DATA_HMAC_SECRET en Vercel",
    });
  }

  try {
    const headers = createHmacHeaders(secret, "GET", WORKER_PATH);
    const response = await fetch(`${workerBase}${WORKER_PATH}`, { headers });
    const body = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: parseWorkerError(body, response.status),
      });
    }

    if (!isValidJson(body)) {
      console.error("[api/data] Respuesta no JSON del Worker:", body.slice(0, 120));
      return res.status(502).json({ error: "El Worker devolvió una respuesta inválida" });
    }

    res.setHeader("Cache-Control", "no-store, must-revalidate");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(body);
  } catch (err) {
    console.error("[api/data]", err);
    return res.status(502).json({ error: "No se pudieron obtener los datos" });
  }
};
