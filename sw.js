const V='aaravhq-v5';
const CORE=['./','index.html','styles.css','app.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(/(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|ytimg\.com|googlevideo\.com|ggpht\.com)$/.test(u.hostname))return; // never cache YouTube
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{caches.open(V).then(c=>c.put('index.html',r.clone()));return r}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok&&(u.origin===location.origin||u.host.includes('gstatic')||u.host.includes('googleapis'))){const cl=r.clone();caches.open(V).then(c=>c.put(e.request,cl))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
