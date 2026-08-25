const CACHE_NAME = 'mtrix-cache-v23';
const ASSETS = [
  '/', 
  './index.html',
  './style.css',
  './main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
];

// Install Service Worker & Simpan Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching aset penting...');
      return cache.addAll(ASSETS);
    })
  );
});

// Aktifkan Service Worker & Hapus Cache Lama jika ada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Intercept Requests (Strategi: Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
  // Biarkan Firebase berjalan normal (jangan di-cache oleh SW, biarkan Firebase yang urus)
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('firebase')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Cepat! Ambil dari memori HP/Laptop
      }
      return fetch(event.request); // Kalau tidak ada di memori, ambil dari internet
    })
  );
});
