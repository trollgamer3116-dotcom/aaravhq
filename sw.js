const V='aaravhq-v26';
const CORE=['./','index.html','styles.css?v=26','app.js?v=26','news.js?v=26','music.js?v=26','search.js?v=26','fx.js?v=26','boot.js?v=26','atmosphere.js?v=26','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const FONT_HOSTS=/^(fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('aaravhq-v')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const same=u.origin===location.origin;
  // Never touch API / media calls (YouTube, Open-Meteo, RSS proxies, FX rates, geocoding, news images): straight to network.
  if(!same&&!FONT_HOSTS.test(u.hostname))return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const cl=r.clone();caches.open(V).then(c=>c.put('index.html',cl));return r}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(V).then(c=>c.put(e.request,cl))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('./#cal')))});
