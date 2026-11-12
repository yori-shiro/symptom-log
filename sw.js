/* 体調の記録：一度開けば電波のない場所でも開けるようにする */
const CACHE = "taicho-kiroku-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./apple-touch-icon.png",
  "./fonts/ZenMaruGothic-Regular.woff2",
  "./fonts/ZenMaruGothic-Medium.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 保存済みのものを先に返し、裏で新しい版を取りにいく（更新は次に開いたときに反映） */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
