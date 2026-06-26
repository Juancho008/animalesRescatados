/**
 * Sube config/data.json a Cloudflare KV a través del Worker (PUT /api/data).
 *
 * Requiere variables de entorno (en .env o en el shell):
 *   CATALOG_WORKER_URL  -> dominio del Worker (sin /data.json)
 *   ADMIN_TOKEN         -> mismo valor que el secret ADMIN_TOKEN del Worker
 *
 * Uso:  npm run kv:sync
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Cargar .env de forma simple (sin dependencias).
function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function normalizeBase(url) {
  return url?.trim().replace(/\/$/, "").replace(/\/data\.json$/i, "");
}

async function main() {
  loadEnv();
  const base = normalizeBase(process.env.CATALOG_WORKER_URL);
  const token = process.env.ADMIN_TOKEN?.trim();

  if (!base || !token) {
    console.error("❌ Faltan CATALOG_WORKER_URL o ADMIN_TOKEN (configurá tu .env).");
    process.exit(1);
  }

  const dataPath = path.join(ROOT, "config", "data.json");
  const data = fs.readFileSync(dataPath, "utf8");

  console.log(`→ Subiendo datos a ${base}/api/data …`);
  const res = await fetch(`${base}/api/data`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: data,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ Error ${res.status}: ${text}`);
    process.exit(1);
  }
  console.log("✅ Datos sincronizados en Cloudflare KV.");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
