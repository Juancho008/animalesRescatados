/**
 * Servidor local de desarrollo.
 *
 * Replica los endpoints que en producción resuelven Vercel + Cloudflare Worker,
 * pero usando un archivo JSON local y una carpeta de imágenes en disco.
 * Así podés desarrollar sin configurar Cloudflare.
 *
 * Endpoints:
 *   GET  /api/data                -> datos públicos
 *   GET  /api/admin/data          -> datos (requiere ADMIN_PASSWORD)
 *   PUT  /api/admin/data          -> guarda datos (requiere ADMIN_PASSWORD)
 *   POST /api/admin/upload-image  -> sube imagen (requiere ADMIN_PASSWORD)
 *   GET  /api/animal-image?id=    -> imagen pública
 */

import express from "express";
import cors from "cors";
import compression from "compression";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, "config", "data.json");
const DATA_FILE = path.join(__dirname, "data.local.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "admin").trim();

const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function ensureSetup() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = fs.existsSync(SEED_FILE)
      ? fs.readFileSync(SEED_FILE, "utf8")
      : JSON.stringify({ site: {}, sections: {}, animals: [] }, null, 2);
    fs.writeFileSync(DATA_FILE, seed);
  }
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { site: {}, sections: {}, animals: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function checkPassword(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  return token === ADMIN_PASSWORD;
}

ensureSetup();

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: "local-dev" });
});

app.get("/api/data", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readData());
});

app.get("/api/admin/data", (req, res) => {
  if (!checkPassword(req)) return res.status(401).json({ error: "Contraseña incorrecta" });
  res.set("Cache-Control", "no-store");
  res.json(readData());
});

app.put("/api/admin/data", (req, res) => {
  if (!checkPassword(req)) return res.status(401).json({ error: "Contraseña incorrecta" });
  writeData(req.body || {});
  res.json({ ok: true });
});

app.post("/api/admin/upload-image", (req, res) => {
  if (!checkPassword(req)) return res.status(401).json({ error: "Contraseña incorrecta" });

  const { data, mime } = req.body || {};
  const ext = MIME_EXT[(mime || "").toLowerCase()];
  if (!data || !ext) {
    return res.status(400).json({ error: "Solo JPG, PNG, WebP o GIF en base64" });
  }

  let buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch {
    return res.status(400).json({ error: "Base64 inválido" });
  }
  if (buffer.byteLength > 3 * 1024 * 1024) {
    return res.status(400).json({ error: "La imagen no puede superar 3 MB" });
  }

  const id = crypto.randomUUID();
  fs.writeFileSync(path.join(UPLOADS_DIR, `${id}.${ext}`), buffer);
  res.json({ ok: true, id, url: `/api/animal-image?id=${id}` });
});

app.get("/api/animal-image", (req, res) => {
  const id = (req.query.id || "").toString();
  if (!id) return res.status(400).json({ error: "Falta id" });

  const match = fs
    .readdirSync(UPLOADS_DIR)
    .find((f) => f.startsWith(`${id}.`));
  if (!match) return res.status(404).json({ error: "Imagen no encontrada" });

  res.set("Cache-Control", "public, max-age=86400");
  res.sendFile(path.join(UPLOADS_DIR, match));
});

// Servir el build del cliente si existe (modo "producción local").
const DIST = path.join(ROOT, "client", "dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get("*", (_req, res) => res.sendFile(path.join(DIST, "index.html")));
}

app.listen(PORT, () => {
  console.log(`\n  Servidor local de animales rescatados`);
  console.log(`  → API:   http://localhost:${PORT}/api/data`);
  console.log(`  → Admin: contraseña actual = "${ADMIN_PASSWORD}" (cambiala con ADMIN_PASSWORD en .env)\n`);
});
