# 🐾 Huellas con Historia — Animales Rescatados

Sitio web para un refugio de **animales rescatados**, hecho en **React 19 + Node** con un **panel de administración**. Sin base de datos tradicional: los datos viven en **Cloudflare KV** y se sirven a través de un **Cloudflare Worker**, listo para desplegar **gratis en Vercel**.

Incluye 5 secciones:

| Sección | Qué muestra |
|---------|-------------|
| ✨ **Antes y Después** | Tarjetas con comparador deslizable (slider antes/después) |
| 🆘 **Rescatados** | Animales recién rescatados de la calle |
| 💊 **En Recuperación** | Animales en tratamiento veterinario |
| 🏡 **En Adopción** | Listos para encontrar familia (con botón de WhatsApp) |
| ❤️ **Post Adopción** | Finales felices en sus nuevos hogares |

Diseño moderno, **100% responsive (mobile-first)**, con animaciones de entrada, hover y un loader animado (Framer Motion).

---

## 🚀 Arranque rápido (local)

Requiere [Node.js](https://nodejs.org) **20 o superior** (probado en Node 25).

```bash
npm run install:all   # instala dependencias de raíz y de client/ (una sola vez)
npm run dev            # arranca servidor local + frontend
```

- **Sitio:** http://localhost:5173 ← abrí esta
- **Panel admin:** http://localhost:5173/admin (contraseña por defecto: `admin`)
- **API local:** http://localhost:4000/api/data

> En local **no necesitás Cloudflare**: los datos se guardan en `server/data.local.json` (se crea solo a partir de `config/data.json`) y las imágenes subidas en `server/uploads/`.

Para cambiar la contraseña local, copiá `.env.example` a `.env` y editá `ADMIN_PASSWORD`.

### Probar el build de producción en local

```bash
npm run build
npm start          # sirve client/dist + la API en http://localhost:4000
```

---

## 🔐 Panel de administración (`/admin`)

Desde el navegador podés:

- **Animales:** agregar, editar y eliminar animales; cambiar su sección, subir fotos (o pegar una URL), etiquetas (`nuevo`, `destacado`, `urgente`), edad, especie, descripción e historia. Para "Antes y Después" subís 2 fotos.
- **Sitio:** nombre, frases del hero, WhatsApp, Instagram, email, link de donaciones y estadísticas.
- **Secciones:** título, emoji y descripción de cada categoría.

Los cambios se guardan con el botón **Guardar cambios** (en local → archivo JSON; en producción → Cloudflare KV).

---

## ☁️ Despliegue (Vercel + Cloudflare Workers/KV)

La arquitectura es idéntica al sistema de "Mascotas en Camino":

```
Navegador ─GET /api/data─► Vercel (serverless) ─firma HMAC─► Worker ─► KV
Navegador ─/admin (PUT)──► Vercel (valida contraseña) ──────► Worker ─► KV
```

El **secreto HMAC y la contraseña nunca llegan al navegador**: viven como variables de servidor en Vercel.

### 1) Crear el namespace KV en Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → KV → Create namespace** (ej. `animales-rescatados`).
2. Copiá el **Namespace ID** y pegalo en `wrangler.toml` (campo `id`).

### 2) Desplegar el Worker y cargar secretos

```bash
npm install
npx wrangler login

# token para escribir (PUT/imagenes) y secreto HMAC compartido con Vercel
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put DATA_HMAC_SECRET

npm run worker:deploy
```

Anotá la URL del Worker: `https://animales-rescatados-api.TU_SUBDOMINIO.workers.dev`

### 3) Subir los datos iniciales a KV

Creá un `.env` en la raíz con `CATALOG_WORKER_URL` y `ADMIN_TOKEN`, y ejecutá:

```bash
npm run kv:sync   # sube config/data.json a Cloudflare KV
```

### 4) Configurar Vercel

Importá el repo en [vercel.com](https://vercel.com) → **Add New → Project**. El `vercel.json` ya deja todo configurado (build estático + funciones serverless). En **Settings → Environment Variables** agregá (⚠️ **sin** prefijo `VITE_`):

| Key | Valor |
|-----|-------|
| `CATALOG_WORKER_URL` | URL del Worker (solo el dominio, sin `/data.json`) |
| `DATA_HMAC_SECRET` | el **mismo** valor que en Cloudflare |
| `ADMIN_TOKEN` | el **mismo** valor que en Cloudflare |
| `ADMIN_PASSWORD` | la contraseña que vas a escribir en `/admin` |

Tocá **Deploy**. 🎉

### Actualizar contenido en producción

Hay dos formas, y ninguna requiere redesplegar:

1. **Desde `/admin`** en tu sitio (recomendado): editás y guardás → va directo a KV.
2. **Desde la terminal:** editá `config/data.json` y corré `npm run kv:sync`.

---

## 📁 Estructura del proyecto

```
.
├── config/
│   └── data.json            ← datos iniciales (sitio, secciones y animales)
├── lib/
│   └── hmac.mjs             ← firma HMAC compartida
├── api/                     ← funciones serverless de Vercel (proxy al Worker)
│   ├── _worker-proxy.cjs
│   ├── data.cjs             ← GET público (firma HMAC)
│   ├── admin-data.cjs       ← GET/PUT admin (valida contraseña)
│   ├── admin-upload-image.cjs
│   └── animal-image.cjs     ← imágenes públicas
├── worker/
│   └── src/
│       ├── index.js         ← API en Cloudflare Worker
│       ├── hmac.js
│       └── images.js        ← imágenes en KV
├── server/
│   └── index.js             ← servidor local de desarrollo (sin Cloudflare)
├── scripts/
│   └── sync-kv.mjs          ← sube config/data.json a KV
├── client/                  ← frontend React 19 + Vite + Framer Motion
│   └── src/
│       ├── App.jsx          ← sitio público
│       ├── api.js
│       ├── components/      ← Hero, tarjetas, antes/después, modal, etc.
│       ├── admin/           ← panel de administración
│       └── styles/index.css
├── wrangler.toml            ← config del Worker + binding KV
├── vercel.json              ← config de despliegue en Vercel
└── package.json
```

---

## 🛠️ Endpoints

**Worker (Cloudflare):**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/data.json` · `/api/data` | Datos (requiere HMAC si hay secret) |
| `PUT` | `/api/data` | Guarda datos (requiere `ADMIN_TOKEN`) |
| `GET` | `/api/animal-image?id=` | Imagen pública |
| `POST` | `/api/admin/images` | Sube imagen (requiere `ADMIN_TOKEN`) |
| `GET` | `/api/health` | Estado |

**Vercel / local:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/data` | Datos públicos del sitio |
| `GET`/`PUT` | `/api/admin/data` | Leer/guardar (requiere contraseña) |
| `POST` | `/api/admin/upload-image` | Subir imagen (requiere contraseña) |
| `GET` | `/api/animal-image?id=` | Imagen pública |
```
