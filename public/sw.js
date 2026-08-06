const CACHE_NAME = 'arabic-tutor-v2'
const OFFLINE_URLS = [
  '/',
  '/dictionary',
  '/scenarios',
  '/chat',
  '/settings',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Network-first: always prefer the live server response so deployed/dev changes
// show up immediately. The cache is only a fallback for offline use.
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  )
})

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'יַאלְלַה נִתְחַכּוּ 🌿',
    body: 'זמן לתרגל ערבית ירושלמית! יַלָּה!',
    icon: '/icons/icon-192.png',
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      dir: 'rtl',
      lang: 'he',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
