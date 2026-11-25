/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

/**
 * Datos del modelo en el navegador, SIN duplicarlos en git.
 *
 * Los archivos viven en `modelo_transformado/` (fuera de `src/` y de `public/`).
 * Este plugin:
 *  - en desarrollo los sirve en `/modelo_transformado/<archivo>` (middleware);
 *  - en `vite build` los emite a `dist/modelo_transformado/<archivo>` (copia solo en dist, que no se versiona).
 * Solo se publican los archivos que la app usa en producción. Los archivos de prueba
 * (referencia_golden, prueba_evaluador, prueba_equity) los leen únicamente los tests de Node.
 */
const CARPETA_DATOS = 'modelo_transformado'
const ARCHIVOS_PUBLICOS = [
  'modelo1.onnx', 'modelo2.onnx', 'modelo3.onnx', 'modelo4.onnx',
  'modelo1_preparacion.json', 'modelo2_preparacion.json', 'modelo3_preparacion.json', 'modelo4_preparacion.json',
  'equity_preflop_169.json', 'banco_manos_reales.json',
]

function datosDelModelo(): Plugin {
  const raiz = resolve(import.meta.dirname, CARPETA_DATOS)
  return {
    name: 'next-chip:datos-del-modelo',
    configureServer(server) {
      server.middlewares.use(`/${CARPETA_DATOS}/`, (req, res, next) => {
        const nombre = decodeURIComponent((req.url ?? '').split('?')[0]!.replace(/^\//, ''))
        if (!ARCHIVOS_PUBLICOS.includes(nombre)) return next()
        const ruta = join(raiz, nombre)
        if (!existsSync(ruta)) return next()
        res.setHeader('Content-Type', nombre.endsWith('.json') ? 'application/json' : 'application/octet-stream')
        res.end(readFileSync(ruta))
      })
    },
    generateBundle() {
      for (const nombre of ARCHIVOS_PUBLICOS) {
        this.emitFile({ type: 'asset', fileName: `${CARPETA_DATOS}/${nombre}`, source: readFileSync(join(raiz, nombre)) })
      }
    },
  }
}

const enTests = !!process.env.VITEST

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    datosDelModelo(),
    ...(enTests
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            manifest: {
              name: 'Next Chip',
              short_name: 'Next Chip',
              lang: 'es',
              display: 'standalone',
              background_color: '#0b0b0f',
              theme_color: '#0b0b0f',
            },
            workbox: {
              // El wasm (~15 MB) y los modelos no se precargan: se guardan en caché al usarse por primera vez.
              globPatterns: ['**/*.{js,css,html}'],
              maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
              runtimeCaching: [
                {
                  urlPattern: ({ url }) => /\.(wasm|onnx)$/.test(url.pathname) || url.pathname.startsWith(`/${CARPETA_DATOS}/`),
                  handler: 'CacheFirst',
                  options: { cacheName: 'next-chip-modelo', expiration: { maxEntries: 40 } },
                },
              ],
            },
          }),
        ]),
  ],
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 600_000,
    hookTimeout: 120_000,
  },
})
