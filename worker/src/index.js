/**
 * API de animales rescatados en Cloudflare Workers + KV.
 *
 * Rutas:
 *   GET  /data.json            -> datos públicos (requiere HMAC si hay secret)
 *   GET  /api/data             -> alias de /data.json
 *   PUT  /api/data             -> guarda datos (requiere ADMIN_TOKEN)
 *   GET  /api/animal-image?id= -> imagen pública del animal
 *   POST /api/admin/images     -> sube imagen (requiere ADMIN_TOKEN)
 *   GET  /api/health           -> estado
 */

import { verifyHmac } from "./hmac.js";
import {
  handleAnimalImageDownload,
  handleAnimalImageUpload,
} from "./images.js";

const DATA_KEY = "data";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Timestamp, X-Signature",
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...extra,
    },
  });
}

function isDataPath(pathname) {
  return pathname === "/data.json" || pathname === "/api/data";
}

async function handleDataGet(request, env) {
  const authorized = await verifyHmac(request, env.DATA_HMAC_SECRET);
  if (!authorized) return json({ error: "No autorizado" }, 401);

  const raw = await env.KV_BINDING.get(DATA_KEY);
  if (!raw) {
    return json(
      { error: "Datos no encontrados en KV. Ejecutá: npm run kv:sync" },
      404
    );
  }

  return new Response(raw, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      ...corsHeaders,
    },
  });
}

async function handleDataPut(request, env) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: "No autorizado" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  await env.KV_BINDING.put(DATA_KEY, JSON.stringify(body));
  return json({ ok: true, key: DATA_KEY });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/health") {
      const hasData = Boolean(await env.KV_BINDING.get(DATA_KEY));
      const hmacEnabled = Boolean(env.DATA_HMAC_SECRET);
      return json({ ok: true, kv: true, hasData, hmacEnabled });
    }

    if (request.method === "GET" && url.pathname === "/api/animal-image") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Falta id" }, 400);
      return handleAnimalImageDownload(env, id, corsHeaders);
    }

    if (request.method === "POST" && url.pathname === "/api/admin/images") {
      return handleAnimalImageUpload(request, env, json);
    }

    if (isDataPath(url.pathname)) {
      if (request.method === "GET") return handleDataGet(request, env);
      if (request.method === "PUT") return handleDataPut(request, env);
      return json({ error: "Método no permitido" }, 405);
    }

    return json({ error: "Ruta no encontrada" }, 404);
  },
};
