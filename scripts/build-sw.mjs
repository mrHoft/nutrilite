import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const distDir = path.resolve('dist')
const cachePrefix = 'nutrilite-'

async function listFiles(dir, root = dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, root)))
    } else {
      files.push(`/${path.relative(root, fullPath).split(path.sep).join('/')}`)
    }
  }

  return files
}

const files = (await listFiles(distDir))
  .filter((file) => file !== '/sw.js')
  .filter((file) => !file.endsWith('.ai.txt'))
  .sort()

if (!files.includes('/index.html')) {
  throw new Error('build-sw: dist/index.html was not found')
}

const hash = createHash('sha256')
for (const file of files) {
  hash.update(file)
  hash.update(await readFile(path.join(distDir, file)))
}

const cacheName = `${cachePrefix}${hash.digest('hex').slice(0, 12)}`
const precacheUrls = JSON.stringify(files, null, 2)

const serviceWorker = `const CACHE_PREFIX = '${cachePrefix}'
const CACHE_NAME = '${cacheName}'
const OFFLINE_URL = '/index.html'
const PRECACHE_URLS = ${precacheUrls}

function offlineResponse() {
  return new Response('Offline', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

async function cacheNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok && response.headers.get('Content-Type')?.includes('text/html')) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(OFFLINE_URL, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(OFFLINE_URL)
    return cached || offlineResponse()
  }
}

async function cacheAsset(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return offlineResponse()
  }
}

function isNavigation(request) {
  return request.mode === 'navigate'
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    isNavigation(request) ? cacheNavigation(request) : cacheAsset(request),
  )
})
`

await writeFile(path.join(distDir, 'sw.js'), serviceWorker)
console.log(`sw.js: precaching ${files.length} files in ${cacheName}`)
