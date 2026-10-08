/* HQ · News: feeds, For you, Saved, and the reader view */
'use strict';
const FEEDS={
 ai:{n:'AI',f:['https://www.theverge.com/rss/ai-artificial-intelligence/index.xml','https://techcrunch.com/category/artificial-intelligence/feed/','https://www.technologyreview.com/topic/artificial-intelligence/feed']},
 games:{n:'Games',f:['https://www.polygon.com/rss/index.xml','https://www.gamespot.com/feeds/game-news/']},
 movies:{n:'Movies',f:['https://variety.com/v/film/feed/','https://collider.com/feed/','https://www.indiewire.com/c/film/feed/']}};
const NCATS=['foryou','ai','games','movies','saved'];
const NLAB={foryou:'For you',ai:'AI',games:'Games',movies:'Movies',saved:'Saved'};
const NKEY='aaravhq:news',RKEY='aaravhq:reader';
const hid=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))|0;return (h>>>0).toString(36)};
function newsCache(c){try{return (JSON.parse(localStorage.getItem(NKEY)||'{}'))[c]||null}catch(e){return null}}
function newsSave(c,v){let o={};try{o=JSON.parse(localStorage.getItem(NKEY)||'{}')}catch(e){}o[c]=v;
 try{localStorage.setItem(NKEY,JSON.stringify(o))}catch(e){Object.values(o).forEach(x=>x&&x.items&&x.items.forEach(i=>delete i.body));try{localStorage.setItem(NKEY,JSON.stringify(o))}catch(e2){}}}
const txt=h=>{const d=new DOMParser().parseFromString(h||'','text/html');return (d.body.textContent||'').replace(/\s+/g,' ').trim()};
const firstImg=h=>{const m=(h||'').match(/<img[^>]+src=["']([^"']+)["']/i);return m?m[1].replace(/&amp;/g,'&'):''};
const SRCN={'theverge.com':'The Verge','techcrunch.com':'TechCrunch','technologyreview.com':'MIT Tech Review','polygon.com':'Polygon','gamespot.com':'GameSpot','variety.com':'Variety','collider.com':'Collider','indiewire.com':'IndieWire'};
const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}};
const srcOf=u=>SRCN[hostOf(u)]||hostOf(u);
const tfetch=(u,ms=9000,o={})=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return fetch(u,Object.assign({},o,{signal:c.signal})).finally(()=>clearTimeout(t))};

// ---------- sanitizer: whitelist → inert document (nothing loads, nothing runs) ----------
const RD=document.implementation.createHTMLDocument('reader');
const KEEP={P:'p',H1:'h2',H2:'h2',H3:'h3',H4:'h4',H5:'h4',H6:'h4',UL:'ul',OL:'ol',LI:'li',BLOCKQUOTE:'blockquote',STRONG:'strong',B:'strong',EM:'em',I:'em',CITE:'em',FIGURE:'figure',FIGCAPTION:'figcaption',BR:'br',HR:'hr',PRE:'pre',CODE:'code',SUP:'sup',SUB:'sub'};
const DROP=new Set('SCRIPT STYLE IFRAME NOSCRIPT FORM INPUT BUTTON SVG VIDEO AUDIO OBJECT EMBED NAV ASIDE FOOTER HEADER SELECT TEXTAREA LINK META TEMPLATE CANVAS DIALOG TITLE HEAD SOURCE TRACK MAP'.split(' '));
const BLOCKISH=new Set('DIV SECTION ARTICLE MAIN TABLE TBODY THEAD TR TD TH DL DD DT CENTER ADDRESS DETAILS SUMMARY SPAN'.split(' '));
const BLOCKS=new Set(['P','H2','H3','H4','UL','OL','BLOCKQUOTE','FIGURE','PRE','HR']);
const JUNK=/(^|[\s_-])(share|sharing|social|related|newsletter|promo|advert|advertisement|ad-slot|ads|sponsor|comments?|subscribe|recirc|popular|trending|author-bio|tags|breadcrumbs?|toolbar|signup|paywall|outbrain|taboola|jumplink)([\s_-]|$)/i;
const absU=(u,b)=>{try{return u?new URL(u,b).href:''}catch(e){return ''}};
function walk(src,dst,base,deep){
 for(const n of [...src.childNodes]){
  if(n.nodeType===3){dst.appendChild(RD.createTextNode(n.nodeValue));continue}
  if(n.nodeType!==1)continue;const t=n.tagName.toUpperCase();if(DROP.has(t))continue;
  if(deep&&JUNK.test((n.getAttribute('class')||'')+' '+(n.id||'')))continue;
  if(t==='IMG'){const s=absU(n.getAttribute('data-src')||n.getAttribute('src')||(n.getAttribute('srcset')||'').split(/[\s,]/)[0],base);const w=+n.getAttribute('width')||0;
   if(s&&/^https:/.test(s)&&!/(pixel|tracking|feedburner|gravatar|1x1|spacer|blank\.gif)/i.test(s)&&!(w&&w<60)){const i=RD.createElement('img');i.setAttribute('src',s);i.setAttribute('alt',(n.getAttribute('alt')||'').slice(0,200));dst.appendChild(i)}continue}
  if(t==='PICTURE'){const im=n.querySelector('img');if(im)walk({childNodes:[im]},dst,base,deep);continue}
  if(t==='A'){const h=absU(n.getAttribute('href'),base);if(h&&/^https?:/.test(h)){const a=RD.createElement('a');a.setAttribute('href',h);walk(n,a,base,deep);if(a.textContent.trim()||a.querySelector('img'))dst.appendChild(a)}else walk(n,dst,base,deep);continue}
  const m=KEEP[t];
  if(m){const e=RD.createElement(m);walk(n,e,base,deep);if(m==='br'||m==='hr'||e.textContent.trim()||e.querySelector('img'))dst.appendChild(e);continue}
  if(BLOCKISH.has(t)&&t!=='SPAN'){const tmp=RD.createElement('div');walk(n,tmp,base,deep);blockify(tmp,dst);continue}
  walk(n,dst,base,deep)}}
function blockify(tmp,dst){let p=null;
 for(const c of [...tmp.childNodes]){
  if(c.nodeType===1&&BLOCKS.has(c.tagName.toUpperCase())){p=null;dst.appendChild(c);continue}
  if(c.nodeType===1&&c.tagName.toUpperCase()==='BR'){if(p&&p.lastChild&&p.lastChild.nodeName==='BR'){p.lastChild.remove();p=null}else if(p)p.appendChild(c);continue}
  if(c.nodeType===3&&!c.nodeValue.trim()&&!p)continue;
  if(!p){p=RD.createElement('p');dst.appendChild(p)}p.appendChild(c)}}
function tidy(r){
 r.querySelectorAll('p p').forEach(x=>x.replaceWith(...x.childNodes));
 r.querySelectorAll('p,h2,h3,h4,li,figcaption,blockquote,strong,em').forEach(e=>{if(!e.textContent.trim()&&!e.querySelector('img'))e.remove()});
 r.querySelectorAll('p').forEach(p=>{const t=p.textContent.trim();if(t.length<240&&/(appeared first on|continue reading|^read more|^advertisement$|sign up for|subscribe to our|^related:|click here|follow us on)/i.test(t))p.remove()});
 r.querySelectorAll('p').forEach(p=>{if(!p.textContent.trim()&&p.querySelector('img')){const f=RD.createElement('figure');p.querySelectorAll('img').forEach(i=>f.appendChild(i));p.replaceWith(f)}});
 r.querySelectorAll('p>br:first-child,p>br:last-child').forEach(b=>b.remove())}
function clean(html,base,deep){const d=new DOMParser().parseFromString(html||'','text/html');const tmp=RD.createElement('div'),root=RD.createElement('div');walk(d.body,tmp,base,deep);blockify(tmp,root);tidy(root);return root.innerHTML}
function pack(html,via){const t=RD.createElement('div');t.innerHTML=html;const words=(t.textContent.match(/\S+/g)||[]).length;return{html,words,via}}

// ---------- markdown (from the reader proxy) → HTML ----------
function md2html(md){
 const e2=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const inl=s=>{s=e2(s);
  s=s.replace(/!\[([^\]]*)\]\((https?:[^)\s]+)(?:\s+&quot;[^)]*&quot;)?\)/g,(m,a,u)=>`<img src="${u}" alt="${a}">`);
  s=s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)(?:\s+&quot;[^)]*&quot;)?\)/g,(m,t,u)=>`<a href="${u}">${t}</a>`);
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>');
  s=s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g,'$1<em>$2</em>').replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g,'$1<em>$2</em>');
  return s.replace(/`([^`]+)`/g,'<code>$1</code>')};
 const L=md.replace(/\r/g,'').split('\n'),out=[],LI=/^\s*([-*+]|\d+[.)])\s+/;let i=0;
 while(i<L.length){const l=L[i];
  if(!l.trim()){i++;continue}
  if(/^```/.test(l)){const b=[];i++;while(i<L.length&&!/^```/.test(L[i]))b.push(L[i++]);i++;out.push('<pre><code>'+e2(b.join('\n'))+'</code></pre>');continue}
  let m=l.match(/^(#{1,6})\s+(.*)$/);if(m){const lv=Math.min(4,Math.max(2,m[1].length));out.push(`<h${lv}>${inl(m[2].replace(/\s#+$/,''))}</h${lv}>`);i++;continue}
  if(L[i+1]!=null&&/^=+\s*$/.test(L[i+1])){out.push(`<h2>${inl(l)}</h2>`);i+=2;continue}
  if(L[i+1]!=null&&/^-{2,}\s*$/.test(L[i+1])&&!LI.test(l)){out.push(`<h3>${inl(l)}</h3>`);i+=2;continue}
  if(/^([*_-]\s*){3,}$/.test(l.trim())){out.push('<hr>');i++;continue}
  if(/^>\s?/.test(l)){const b=[];while(i<L.length&&/^>\s?/.test(L[i]))b.push(L[i++].replace(/^>\s?/,''));out.push('<blockquote><p>'+inl(b.join(' '))+'</p></blockquote>');continue}
  if(LI.test(l)){const ord=/^\s*\d/.test(l),b=[];while(i<L.length&&LI.test(L[i])){b.push(L[i].replace(LI,''));i++;while(i<L.length&&L[i].trim()&&!LI.test(L[i])&&/^\s{2,}/.test(L[i]))b[b.length-1]+=' '+L[i++].trim()}out.push(`<${ord?'ol':'ul'}>${b.map(x=>'<li>'+inl(x)+'</li>').join('')}</${ord?'ol':'ul'}>`);continue}
  const b=[];while(i<L.length&&L[i].trim()&&!/^(#{1,6}\s|>|```)/.test(L[i])&&!LI.test(L[i])&&!(L[i+1]!=null&&/^(=+|-{2,})\s*$/.test(L[i+1])))b.push(L[i++].trim());
  if(!b.length)b.push(L[i++].trim());
  const p=b.join(' ');out.push(/^!\[[^\]]*\]\([^)]*\)$/.test(p)?'<figure>'+inl(p)+'</figure>':'<p>'+inl(p)+'</p>')}
 return out.join('\n')}

// ---------- readability-lite: keep the article, drop the chrome ----------
function articleize(html,it){const r=RD.createElement('div');r.innerHTML=html;const kids=[...r.children];
 const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),tn=norm(it.title||'').slice(0,24);let start=0;
 for(let k=0;k<Math.min(kids.length,60);k++){const e=kids[k];if(/^H[2-4]$/.test(e.tagName)&&tn&&norm(e.textContent).startsWith(tn)){start=k+1;break}}
 if(!start){const k=kids.findIndex(e=>e.tagName==='P'&&e.textContent.trim().length>=140);if(k>0){let j=k-1;while(j>=0&&kids[j].tagName==='FIGURE')j--;start=j+1}}
 kids.slice(0,start).forEach(e=>e.remove());
 let words=0,cut=false;[...r.children].forEach(e=>{if(cut){e.remove();return}const t=e.textContent.replace(/\s+/g,' ').trim();
  if(words>180&&t.length<120&&/^(related|more from|most popular|recommended|read more|read next|up next|you might also like|comments?|about the author|trending|latest|more stories|share this|sign up|newsletter|top stories|further reading|more news|popular on|must read|you may also like|more in)/i.test(t)){cut=true;e.remove();return}
  const lt=[...e.querySelectorAll('a')].reduce((a,x)=>a+x.textContent.length,0);
  if(t.length&&lt/t.length>.6&&t.length<500&&e.tagName!=='FIGURE'){e.remove();return}
  if(t.length<90&&/^(advertisement|skip to|share|copy link|image:|photo:|credit:|getty|listen to|this article|subscribe)/i.test(t)){e.remove();return}
  words+=(t.match(/\S+/g)||[]).length});
 return tidyReader(r.innerHTML)}
function tidyReader(html){const r=RD.createElement('div');r.innerHTML=html;const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const seen=new Set();[...r.children].forEach(e=>{const t=e.textContent.replace(/\s+/g,' ').trim();if(/^(posts from (this|these)|follow topics and authors|follow this (topic|author)|by [\w .'-]{2,60}$)/i.test(t)){e.remove();return}if(t.length>60){const key=norm(t);if(seen.has(key)&&!e.querySelector('img'))e.remove();else seen.add(key)}});
 return r.innerHTML}
function extractHTML(html){const d=new DOMParser().parseFromString(html,'text/html');
 for(const s of d.querySelectorAll('script[type="application/ld+json"]')){try{const j=JSON.parse(s.textContent);for(const o of [].concat(j['@graph']||j)){if(o&&typeof o.articleBody==='string'&&o.articleBody.length>1200)return o.articleBody.split(/\n+/).map(x=>x.trim()).filter(Boolean).map(x=>'<p>'+esc(x)+'</p>').join('')}}catch(e){}}
 d.querySelectorAll('script,style,noscript,nav,header,footer,aside,form,iframe,svg,button').forEach(e=>e.remove());
 d.querySelectorAll('[class],[id]').forEach(e=>{if(e!==d.body&&JUNK.test((e.getAttribute('class')||'')+' '+(e.id||'')))e.remove()});
 const sc=new Map();d.querySelectorAll('p').forEach(p=>{const n=p.textContent.trim().length;if(n<70)return;let e=p.parentElement,w=1;for(let k=0;k<3&&e;k++,w/=2,e=e.parentElement)sc.set(e,(sc.get(e)||0)+n*w)});
 let best=null,bs=0;sc.forEach((v,e)=>{if(v>bs){bs=v;best=e}});return best&&bs>=600?best.innerHTML:''}

// ---------- article sources (best first), all CORS-friendly ----------
const WPH=/(^|\.)(techcrunch\.com|variety\.com|indiewire\.com|technologyreview\.com|deadline\.com|hollywoodreporter\.com)$/;
async function viaWP(it){const u=new URL(it.link),seg=u.pathname.split('/').filter(Boolean),slug=seg[seg.length-1]||'',base=u.origin+'/wp-json/wp/v2/posts';let j=null;const m=slug.match(/-(\d{6,})$/);
 if(m){const r=await tfetch(`${base}/${m[1]}?_fields=content,jetpack_featured_media_url`,8000);if(r.ok)j=await r.json()}
 if(!j||!j.content){const r=await tfetch(`${base}?slug=${encodeURIComponent(slug)}&_fields=content,jetpack_featured_media_url`,8000);if(r.ok)j=(await r.json())[0]}
 if(!j||!j.content)return null;const o=pack(clean(j.content.rendered,it.link,false),'wp');const fm=j.jetpack_featured_media_url;if(fm&&/^https:\/\//.test(fm))o.img=/\?/.test(fm)?fm:fm+'?w=1200';return o}
async function viaJina(it){const r=await tfetch('https://r.jina.ai/'+it.link,9000);if(!r.ok)throw 0;let t=await r.text();const k=t.indexOf('Markdown Content:');if(k>=0)t=t.slice(k+17);return pack(articleize(clean(md2html(t),it.link,false),it),'reader')}
async function viaProxyPage(it){const r=await tfetch('https://api.allorigins.win/raw?url='+encodeURIComponent(it.link),9000);if(!r.ok)throw 0;const h=extractHTML(await r.text());return h?pack(articleize(clean(h,it.link,true),it),'proxy'):null}
function rcAll(){try{return JSON.parse(localStorage.getItem(RKEY)||'{}')}catch(e){return {}}}
const rcGet=id=>rcAll()[id]||null;
function rcPut(id,v){const o=rcAll();o[id]=Object.assign({},v,{at:Date.now()});const pin=new Set(S.saved.map(x=>x.id));const ks=Object.keys(o).filter(k=>!pin.has(k)&&k!==id).sort((a,b)=>o[a].at-o[b].at);while(ks.length>24)delete o[ks.shift()];
 for(let n=0;n<8;n++){try{localStorage.setItem(RKEY,JSON.stringify(o));return}catch(e){const k=ks.shift();if(!k)return;delete o[k]}}}
const artBusy={};
function getArticle(it){if(artBusy[it.id])return artBusy[it.id];return artBusy[it.id]=(async()=>{const c=rcGet(it.id);if(c)return c;let res=null;
 if(it.body){const f=pack(it.body,'feed');if(f.words>=350)res=f}
 if(!res&&WPH.test(hostOf(it.link))){try{res=await viaWP(it)}catch(e){}}
 const better=r=>r&&r.words>=120&&r.words>(res?res.words:0)+60;
 if((!res||res.words<250)&&navigator.onLine!==false){const r=await new Promise(done=>{let left=2,best=null;const fin=x=>{if(better(x)&&(!best||x.words>best.words))best=x;if(best&&best.words>=250||--left<=0)done(best)};
   [viaJina,viaProxyPage].forEach(f=>f(it).then(fin,()=>fin(null)))});if(better(r))res=r}
 if(res&&res.words>=120){rcPut(it.id,res);return res}return null})().finally(()=>{delete artBusy[it.id]})}

// ---------- feeds ----------
function classifyStory(o,c){const u=o.link||'';if(c==='games'&&/\/(movies|tv|entertainment)\//i.test(u))return 'movies';return c}
const mkItem=(o,c)=>{const it={id:hid(o.link),title:o.title,link:o.link,date:o.date||0,img:o.img||'',src:srcOf(o.link),cat:classifyStory(o,c),desc:(o.desc||'').slice(0,480)};
 if(o.html){const b=clean(o.html,o.link,false),p=pack(b,'feed');if(p.words>=250)it.body=b.slice(0,40000)}return it};
async function viaRss2json(f,c){const r=await tfetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(f)+'&_='+Date.now(),12000,{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();if(j.status!=='ok')throw 0;
 return j.items.map(i=>mkItem({title:txt(i.title),link:i.link,date:i.pubDate?Date.parse(i.pubDate.replace(' ','T')+'Z'):0,img:i.thumbnail||(i.enclosure&&(i.enclosure.link||i.enclosure.thumbnail))||firstImg(i.content)||firstImg(i.description),desc:txt(i.description),html:(i.content||'').length>(i.description||'').length?i.content:i.description},c))}
async function viaProxy(f,c){const r=await tfetch('https://api.allorigins.win/raw?url='+encodeURIComponent(f)+'&_='+Date.now(),12000,{cache:'no-store'});if(!r.ok)throw 0;const x=new DOMParser().parseFromString(await r.text(),'text/xml');
 if(x.querySelector('parsererror'))throw 0;
 return [...x.querySelectorAll('item,entry')].slice(0,15).map(it=>{const g=s=>{const e=it.getElementsByTagName(s)[0];return e?e.textContent:''};const ln=g('link')||(it.querySelector('link')&&it.querySelector('link').getAttribute('href'));const med=it.getElementsByTagName('media:content')[0]||it.getElementsByTagName('media:thumbnail')[0]||it.getElementsByTagName('enclosure')[0];const full=g('content:encoded')||g('content'),ds=g('description')||g('summary');
  return mkItem({title:txt(g('title')),link:ln,date:Date.parse(g('pubDate')||g('published')||g('updated'))||0,img:(med&&med.getAttribute('url'))||firstImg(full||ds),desc:txt(ds),html:full||ds},c)})}
const newsBusy={};
function loadNews(c){if(newsBusy[c])return newsBusy[c];return newsBusy[c]=(async()=>{const res=await Promise.all(FEEDS[c].f.map(f=>viaProxy(f,c).then(items=>{if(!items.length)throw 0;return items}).catch(()=>viaRss2json(f,c)).catch(()=>[])));
 if(!res.some(a=>a.length))return false;
 const seen=new Set(),old=newsCache(c),items=res.flat().concat(old?.items||[]).filter(i=>i.title&&i.link&&!seen.has(i.link)&&seen.add(i.link)).sort((a,b)=>b.date-a.date).slice(0,45);
 if(items.length){newsSave(c,{items,at:Date.now()});return true}return false})().finally(()=>{newsBusy[c]=null})}
const ago=t=>{if(!t)return '';const m=Math.round((Date.now()-t)/6e4);return m<1?'just now':m<60?m+'m ago':m<1440?Math.round(m/60)+'h ago':Math.round(m/1440)+'d ago'};
const isSaved=i=>!!i&&S.saved.some(x=>x.id===i.id);
const isRead=i=>S.readIds.includes(i.id);
function forYou(){const all=[],seen=new Set();['ai','games','movies'].forEach(c=>{const n=newsCache(c);if(n)n.items.forEach(i=>{if(seen.has(i.link))return;seen.add(i.link);all.push(Object.assign({},i,{cat:classifyStory(i,i.cat||c)}))})});if(!all.length)return null;
 const R=S.newsReads,tot=1+Object.values(R).reduce((a,b)=>a+b,0),now=Date.now(),rd=new Set(S.readIds);
 all.forEach(i=>{const age=Math.max(0,(now-(i.date||now))/36e5);i.sc=Math.exp(-age/36)*(1+1.5*((R[i.cat]||0)/tot))+(i.img?.12:0)-(rd.has(i.id)?.6:0)});
 all.sort((a,b)=>b.sc-a.sc);const out=[];while(all.length&&out.length<30){let k=all.findIndex(x=>!(out.length>=2&&out[out.length-1].cat===x.cat&&out[out.length-2].cat===x.cat));if(k<0)k=0;out.push(all.splice(k,1)[0])}return out}
function listFor(c){if(c==='saved')return S.saved.slice().sort((a,b)=>b.savedAt-a.savedAt);if(c==='foryou')return forYou();const caches=Object.keys(FEEDS).map(k=>newsCache(k)).filter(Boolean);if(!caches.length)return null;const seen=new Set();return caches.flatMap(n=>n.items).filter(i=>classifyStory(i,i.cat)===c&&!seen.has(i.link)&&seen.add(i.link)).map(i=>Object.assign({},i,{cat:c})).sort((a,b)=>(b.date||0)-(a.date||0))}

// ---------- news list ----------
let newsCat='foryou',newsErr=false,curList=[],newsQuery='',newsSort='latest',newsLayout='grid',newsRefreshing=0,newsLastCheck=0,newsStatus='';
function newsStatusPaint(){const s=document.getElementById('newsStatus'),r=document.getElementById('nRef');if(s){s.textContent=newsRefreshing?'Checking the latest stories…':newsStatus;s.classList.toggle('fetching',!!newsRefreshing)}if(r){r.classList.toggle('fetching',!!newsRefreshing);r.setAttribute('aria-busy',String(!!newsRefreshing))}}
function newsMatches(items){const terms=newsQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);const out=(items||[]).filter(i=>terms.every(t=>(i.title+' '+i.src+' '+(i.desc||'')).toLowerCase().includes(t)));if(newsSort==='latest')out.sort((a,b)=>(b.date||0)-(a.date||0));return out}
const BM='<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4.2L6 21V4.5a1 1 0 0 1 1-1z"/></svg>';
const catTag=i=>(newsCat==='foryou'||newsCat==='saved')&&i.cat?`<span class="ncat c-${i.cat}">${NLAB[i.cat]}</span>`:'';
const imgTag=(i,cls='')=>i.img?`<img ${cls} src="${esc(i.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="const f=this.closest('.nfeat');if(f){f.classList.remove('has-image');f.classList.add('clear-lead')}this.remove()">`:'';
const nCard=(i,k)=>`<article class="glass ncard rv tap ${isRead(i)?'read':''}" data-i="${k}" tabindex="0" role="button"><div class="im"><div class="ph">✦</div>${imgTag(i)}${catTag(i)}</div><div class="bd"><span class="nsrc">${esc(i.src)}</span><h4>${esc(i.title)}</h4><div class="nm"><span>${ago(i.date)}${isRead(i)?' · <em>Read</em>':''}</span><button class="bmk ${isSaved(i)?'on':''}" data-bm="${k}" aria-label="Save for later">${BM}</button></div></div></article>`;
const nFeat=(i,k)=>`<article class="nfeat rv tap ${i.img?'has-image':'clear-lead'} ${isRead(i)?'read':''}" data-i="${k}" tabindex="0" role="button">${imgTag(i)}<div class="sh"></div><button class="bmk lgb ${isSaved(i)?'on':''}" data-bm="${k}" aria-label="Save for later">${BM}</button><div class="tx">${catTag(i)}<span class="nsrc">${esc(i.src)} · ${ago(i.date)}</span><h3>${esc(i.title)}</h3>${i.desc?`<p>${esc(i.desc.slice(0,150))}${i.desc.length>150?'…':''}</p>`:''}</div></article>`;
const nRow=(i,k)=>`<article class="glass nrow tap" data-i="${k}" tabindex="0" role="button"><div class="im"><div class="ph">✦</div>${imgTag(i)}</div><div class="bd"><span class="nsrc">${esc(i.src)}${i.cat?' · '+NLAB[i.cat]:''}</span><h4>${esc(i.title)}</h4><span class="small muted">Saved ${ago(i.savedAt)}${rcGet(i.id)?' · available offline':''}</span></div><button class="bmk on" data-bm="${k}" aria-label="Remove from Saved">${BM}</button></article>`;
const nSkel=()=>`<div class="nfeat skel" aria-hidden="true"></div><div class="newsgrid" aria-hidden="true">${Array.from({length:6},()=>`<div class="glass ncard sk"><div class="im skel"></div><div class="bd"><i class="skel"></i><i class="skel"></i><i class="skel s"></i></div></div>`).join('')}</div>`;
function newsBody(){const c=newsCat;
 if(c==='saved'){curList=newsMatches(listFor('saved'));return !curList.length&&newsQuery?EMPTY('⌕','No matching saved stories.','Try another title or source.'):curList.length?`<div class="nlist stg">${curList.map(nRow).join('')}</div>`:EMPTY(BM.replace('gi','gi big'),'Nothing saved yet.','Tap the bookmark on any story to keep it here, readable even offline.')}
 const raw=listFor(c);const l=raw&&newsMatches(raw);if(raw&&raw.length&&!l.length){curList=[];return EMPTY('⌕','No matching stories.','Try another title, topic or source.')}if(!l||!l.length){curList=[];return newsErr?EMPTY('⌁','The newsroom is quiet.','Couldn\u2019t reach the feeds right now. Check your connection and try again.',`<button class="btn sm tap" id="nRetry">${ic('refresh')} Retry</button>`):nSkel()}
 const fi=newsSort==='latest'?0:Math.max(0,l.findIndex(x=>x.img));curList=[l[fi]].concat(l.filter((_,k)=>k!==fi));
 const at=Math.min(...(c==='foryou'?['ai','games','movies']:Object.keys(FEEDS)).map(k=>newsCache(k)?.at).filter(Boolean));
 return `${newsErr?`<div class="tile small offl">${ic('refresh')} You\u2019re seeing stories saved ${ago(at)}. Pull down to try again.</div>`:''}
 ${c==='foryou'?`<p class="fyi small muted">A mix of AI, games and film${Object.keys(S.newsReads).length?', tuned to what you read':''}.</p>`:''}
 <div class="news-summary"><span>${curList.length} stories</span><span>${newsSort==='latest'?'Newest first':'Your daily selection'}</span></div>${newsLayout==='grid'&&!newsQuery?`<div class="news-lead">${nFeat(curList[0],0)}<div class="lead-side">${curList.slice(1,3).map((x,k)=>nCard(x,k+1)).join('')}</div></div><div class="newsgrid">${curList.slice(3).map((x,k)=>nCard(x,k+3)).join('')}</div>`:`<div class="newsgrid ${newsLayout==='list'?'compact':''}">${curList.map(nCard).join('')}</div>`}
 <p class="small muted" style="text-align:center;margin:18px 0 0">Updated ${ago(at)} · ${[...new Set(curList.map(i=>i.src))].join(', ')}</p>`}
V.news=()=>`<section class="phead"><div class="row between" style="align-items:flex-end"><div><div class="kicker plain">03 / NEWS, WITHOUT THE NOISE</div><h1 class="ptitle">the signal<i>.</i></h1><p class="page-deck">AI, games & film. Fresh from the source.</p></div><button class="iconbtn tap" id="nRef" aria-label="Refresh">${ic('refresh')}</button></div>
 <div class="segwrap"><div class="seg nseg" id="nSeg" role="tablist">${NCATS.map(k=>`<button data-c="${k}" role="tab" aria-selected="${k===newsCat}" aria-controls="nBody" class="${k===newsCat?'on':''}">${NLAB[k]}${k==='saved'&&S.saved.length?`<em id="svN">${S.saved.length}</em>`:''}</button>`).join('')}</div></div></section>
 <div class="news-controls"><label class="news-search">${ic('search')}<input id="newsSearch" type="search" placeholder="Search stories or sources" aria-label="Search stories or sources" value="${esc(newsQuery)}"></label><select id="newsSort" aria-label="Sort stories"><option value="recommended" ${newsSort==='recommended'?'selected':''}>For you</option><option value="latest" ${newsSort==='latest'?'selected':''}>Latest first</option></select><div class="news-layout" aria-label="Feed layout"><button id="newsGrid" aria-label="Card view" aria-pressed="${newsLayout==='grid'}">${ic('grid')}</button><button id="newsList" aria-label="List view" aria-pressed="${newsLayout==='list'}">${ic('news')}</button></div></div>
 <p id="newsStatus" class="news-status" role="status" aria-live="polite">${newsRefreshing?'Checking the latest stories…':esc(newsStatus)}</p><section id="nBody" aria-label="News stories">${newsBody()}</section>`;
function nPaint(){const b=document.getElementById('nBody');if(!b)return;b.innerHTML=newsBody();bindNews();FX.refresh()}
async function newsFetch(force){const c=newsCat;if(c==='saved')return true;const cats=Object.keys(FEEDS);
 const need=cats.filter(k=>{const n=newsCache(k);return force||!n||Date.now()-n.at>20*6e4});if(!need.length)return true;
 const signature=()=>JSON.stringify((listFor(c)||[]).map(i=>[i.id,i.title,i.img,i.date,i.desc]));const beforeView=signature(),oldErr=newsErr;
 const before=new Set((forYou()||[]).map(i=>i.id));newsRefreshing++;newsStatusPaint();
 try{const res=await Promise.all(need.map(k=>loadNews(k).then(ok=>{if(ok&&newsCat===c&&location.hash==='#news'&&document.querySelector('#nBody .skel'))nPaint();return ok})));
 const ok=res.some(Boolean),added=(forYou()||[]).filter(i=>!before.has(i.id)).length;newsErr=!ok;newsLastCheck=Date.now();newsStatus=ok?(added?`${added} new stories · freshly checked`:'You’re up to date · checked just now'):'Feeds unavailable · showing saved stories';if(ok&&res.some(x=>!x))newsStatus+=' · some sources unavailable';if(newsCat===c&&location.hash==='#news'&&(signature()!==beforeView||oldErr!==newsErr||document.querySelector('#nBody .skel')))nPaint();return ok
 }finally{newsRefreshing--;newsStatusPaint()}}
function bindNews(){const r=document.getElementById('nRetry');if(r)r.onclick=()=>{newsErr=false;nPaint();newsFetch(true)}}
function toggleSave(it,btn){if(!it)return;const k=S.saved.findIndex(x=>x.id===it.id);let on;
 if(k>=0){S.saved.splice(k,1);on=false}else{const o=Object.assign({},it,{savedAt:Date.now()});delete o.sc;S.saved.unshift(o);on=true;getArticle(it).then(r=>{if(r)rcPut(it.id,r)}).catch(()=>{})}
 save();document.querySelectorAll('.bmk[data-bm]').forEach(b=>{const x=curList[+b.dataset.bm];if(x&&x.id===it.id)b.classList.toggle('on',on)});
 if(btn){btn.classList.remove('pop');void btn.offsetWidth;btn.classList.add('pop');if(on)burst(btn)}
 const n=document.getElementById('svN'),sb=document.querySelector('#nSeg [data-c=saved]');if(sb)sb.innerHTML='Saved'+(S.saved.length?`<em id="svN">${S.saved.length}</em>`:'');
 if(RDR.it&&RDR.it.id===it.id)$('#rdBm').classList.toggle('on',on);
 toast(on?'Saved for later':'Removed from Saved');if(newsCat==='saved'&&!on&&location.hash==='#news'&&!RDR.open)nPaint()}
V.news.after=()=>{let searchDelay;$('#newsSearch').oninput=e=>{newsQuery=e.target.value;clearTimeout(searchDelay);searchDelay=setTimeout(nPaint,120)};$('#newsSort').onchange=e=>{newsSort=e.target.value;nPaint()};[['newsGrid','grid'],['newsList','list']].forEach(([id,layout])=>{$('#'+id).onclick=()=>{newsLayout=layout;$('#newsGrid').setAttribute('aria-pressed',String(layout==='grid'));$('#newsList').setAttribute('aria-pressed',String(layout==='list'));nPaint()}});
 document.querySelectorAll('#nSeg button').forEach(b=>b.onclick=()=>{if(newsCat===b.dataset.c)return;newsCat=b.dataset.c;newsErr=false;document.querySelectorAll('#nSeg button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-selected',String(x===b))});FX.seg();b.scrollIntoView({inline:'nearest',block:'nearest',behavior:'smooth'});nPaint();newsFetch()});
 $('#nRef').onclick=e=>{e.currentTarget.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:700,easing:'cubic-bezier(.34,1.45,.5,1)'});newsFetch(true)};
 const body=$('#nBody');body.onclick=e=>{const b=e.target.closest('[data-bm]');if(b){e.stopPropagation();toggleSave(curList[+b.dataset.bm],b);return}const c=e.target.closest('[data-i]');if(c)openReader(curList,+c.dataset.i,c.querySelector('img'))};
 body.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-i]')){e.preventDefault();openReader(curList,+e.target.dataset.i,e.target.querySelector('img'))}};
 bindNews();newsFetch(true)};
V.news.ptr=()=>newsFetch(true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&location.hash==='#news'&&Date.now()-newsLastCheck>60000)newsFetch(true)});
window.addEventListener('online',()=>{if(location.hash==='#news')newsFetch(true)});

// ---------- reader ----------
const RDR={open:false,list:[],i:0,it:null,pushed:false};
const FSZ=[15,16,17,18,20,22,24];
const rdTheme=()=>S.reader.theme||(document.documentElement.dataset.theme==='light'?'light':'dark');
function rdApply(){const s=$('#rdSheet');s.dataset.rt=rdTheme();s.dataset.rf=S.reader.font;s.style.setProperty('--rfs',S.reader.fs+'px');
 document.querySelectorAll('#rpTh button').forEach(b=>b.classList.toggle('on',b.dataset.t===rdTheme()));document.querySelectorAll('#rpFont button').forEach(b=>b.classList.toggle('on',b.dataset.f===S.reader.font));
 const k=FSZ.indexOf(S.reader.fs);document.querySelectorAll('#rpDots i').forEach((d,j)=>d.classList.toggle('on',j<=k));FX.seg()}
const mins=w=>Math.max(1,Math.round(w/230));
const sameImg=(a,b)=>{try{const p=u=>new URL(u).pathname.replace(/[-_]?\d{2,4}x\d{2,4}/,'').replace(/\.(jpe?g|png|webp)$/i,'');return p(a)===p(b)}catch(e){return false}};
function rdBodyHTML(res,it){if(res)return res.html;const sum=it.desc?`<p>${esc(it.desc)}</p>`:'';return sum+`<div class="rd-wait" aria-live="polite"><i class="skel"></i><i class="skel"></i><i class="skel"></i><i class="skel s"></i><span>Fetching the full story…</span></div>`}
function rdFallback(it){return (it.desc?`<p>${esc(it.desc)}</p>`:'')+`<div class="rd-fb"><b>This is the summary.</b><span>The full article couldn\u2019t be loaded here${navigator.onLine?'':' while you\u2019re offline'}. It\u2019s one tap away on ${esc(it.src||'the original site')}.</span><a class="btn pri tap" href="${esc(it.link)}" target="_blank" rel="noopener">Open original ${ic('ext')}</a></div>`}
function rdFinish(res,it){const b=$('#rdBody');if(!b)return;
 if(res&&res.img&&!it.img)rdLateHero(res.img,it);
 if(res&&it.img)res={html:(()=>{const t=RD.createElement('div');t.innerHTML=res.html;const f=t.querySelector('img');if(f&&sameImg(f.getAttribute('src'),it.img)){const fig=f.closest('figure');(fig||f).remove()}return t.innerHTML})(),words:res.words,via:res.via};
 b.innerHTML=res?tidyReader(res.html):rdFallback(it);b.querySelectorAll('a[href]').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer'});b.querySelectorAll('img').forEach(i=>{i.loading='lazy';i.decoding='async';i.referrerPolicy='no-referrer';i.onerror=()=>{const f=i.closest('figure');(f&&!f.textContent.trim()?f:i).remove()}});
 const fp=b.querySelector(':scope>p');b.classList.toggle('dc',!!(res&&fp&&fp===b.firstElementChild&&fp.textContent.trim().length>180&&/^[A-Za-z“"]/.test(fp.textContent.trim())));
 $('#rdMins').textContent=res?mins(res.words)+' min read':'Summary';const v=$('#rdVia');if(v)v.textContent=res?({feed:'From the feed',wp:'Full text',reader:'Reader view',proxy:'Reader view'})[res.via]||'':'';
 b.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});rdProgress()}
function rdLateHero(src,it){const pre=new Image();pre.referrerPolicy='no-referrer';pre.onload=()=>{if(RDR.it!==it||!RDR.open||it.img)return;const h=$('#rdPage .rd-hero.none'),sc=$('#rdScroll');if(!h||!sc||sc.scrollTop>40)return;
 it.img=src;h.className='rd-hero';h.innerHTML=`<img id="rdHero" src="${esc(src)}" alt="" referrerpolicy="no-referrer"><i class="rd-hf"></i>`;
 const bd=$('#rdBody');if(bd){const f=bd.querySelector('img');if(f&&sameImg(f.getAttribute('src'),src)){const fig=f.closest('figure');(fig||f).remove()}}
 if(!RMQ.matches){const H=h.getBoundingClientRect().height;h.animate([{height:'76px'},{height:H+'px'}],{duration:620,easing:'cubic-bezier(.2,.9,.25,1)'});h.firstChild.animate([{opacity:0,transform:'scale(1.06)'},{opacity:1,transform:'none'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'})}
 rdProgress()};pre.src=src}
function rdRender(){const it=RDR.list[RDR.i];RDR.it=it;const nx=RDR.list[RDR.i+1];markRead(it);
 const cached=rcGet(it.id)||(it.body&&pack(it.body,'feed').words>=350?pack(it.body,'feed'):null);
 const d=it.date?new Date(it.date):null;
 $('#rdBsrc').textContent=it.src||'';$('#rdBm').classList.toggle('on',isSaved(it));
 $('#rdPage').innerHTML=`${it.img?`<div class="rd-hero"><img id="rdHero" src="${esc(it.img)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('noimg')"><i class="rd-hf"></i></div>`:'<div class="rd-hero none"></div>'}
 <header class="rd-head"><div class="rd-m1"><span class="nsrc">${esc(it.src)}</span>${it.cat?`<span class="ncat c-${it.cat}">${NLAB[it.cat]}</span>`:''}</div><h1 class="rd-title">${esc(it.title)}</h1>
 <div class="rd-m2">${d?d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:d.getFullYear()!==new Date().getFullYear()?'numeric':undefined})+' · '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})+' · ':''}<span id="rdMins">${cached?mins(cached.words)+' min read':'…'}</span><span class="rd-via" id="rdVia"></span></div></header>
 <div class="rd-body" id="rdBody">${rdBodyHTML(cached,it)}</div>
 <footer class="rd-end"><a class="btn tap" href="${esc(it.link)}" target="_blank" rel="noopener">Open original ${ic('ext')}</a>
 ${nx?`<button class="rd-next glass tap" id="rdNx"><span class="kicker">Up next · swipe ←</span><span class="rn">${nx.img?`<img src="${esc(nx.img)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<b>${esc(nx.title)}</b></span></button>`:`<p class="small muted" style="text-align:center">You\u2019re all caught up ✦</p>`}</footer>`;
 $('#rdScroll').scrollTop=0;rdProgress();$('#rdPrev').disabled=RDR.i===0;$('#rdNext').disabled=!nx;
 const n=document.getElementById('rdNx');if(n)n.onclick=()=>rdGo(1);
 if(cached)rdFinish(cached,it);else getArticle(it).then(res=>{if(RDR.it===it&&RDR.open)rdFinish(res,it)})}
function markRead(it){if(!S.readIds.includes(it.id)){S.readIds.unshift(it.id);S.readIds=S.readIds.slice(0,300);if(it.cat)S.newsReads[it.cat]=(S.newsReads[it.cat]||0)+1;const t=today();S.readLog[t]=(S.readLog[t]||0)+1;save()}}
function rdProgress(){const s=$('#rdScroll'),h=s.scrollHeight-s.clientHeight;const p=h>0?Math.min(1,s.scrollTop/h):0;$('#rdProg').style.transform=`scaleX(${p.toFixed(4)})`;
 const im=document.getElementById('rdHero');if(im&&!RMQ.matches){const y=s.scrollTop;im.style.transform=y>=0?`translate3d(0,${(y*.45).toFixed(1)}px,0) scale(${(1+Math.min(y,600)/3000).toFixed(4)})`:`scale(${(1-y/300).toFixed(4)})`}
 $('#rdBar').classList.toggle('solid',s.scrollTop>40)}
const RMQ=matchMedia('(prefers-reduced-motion: reduce)');
function openReader(list,i,srcImg){if(!list||!list[i])return;closeSheets();RDR.list=list.slice();RDR.i=i;RDR.open=true;const R=$('#reader');rdApply();rdRender();
 R.setAttribute('aria-hidden','false');R.classList.add('on');document.body.classList.add('reading');
 const sh=$('#rdSheet'),hero=document.getElementById('rdHero');
 if(!RMQ.matches&&srcImg&&hero&&srcImg.complete&&srcImg.naturalWidth){const a=srcImg.getBoundingClientRect();sh.classList.add('fly');
  requestAnimationFrame(()=>{const b=hero.getBoundingClientRect(),cl=srcImg.cloneNode();cl.className='flyimg';cl.removeAttribute('onerror');Object.assign(cl.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px'});document.body.appendChild(cl);hero.style.opacity=0;
   const an=cl.animate([{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px',borderRadius:'22px'},{left:b.left+'px',top:b.top+'px',width:b.width+'px',height:b.height+'px',borderRadius:'28px 28px 0 0'}],{duration:620,easing:'cubic-bezier(.2,.9,.25,1)',fill:'forwards'});
   an.onfinish=()=>{hero.style.opacity='';cl.remove();sh.classList.remove('fly')}})}
 else sh.classList.remove('fly');
 if(!RDR.pushed){history.pushState({rd:1},'');RDR.pushed=true}
 setTimeout(()=>$('#rdClose').focus({preventScroll:true}),50)}
function closeReader(fromPop){if(!RDR.open)return;RDR.open=false;const R=$('#reader');R.classList.remove('on');R.setAttribute('aria-hidden','true');document.body.classList.remove('reading');$('#rdPop').classList.remove('on');$('#rdSheet').style.transform='';
 if(RDR.pushed){RDR.pushed=false;if(!fromPop)history.back()}
 if(location.hash==='#news'&&document.getElementById('nBody')){document.querySelectorAll('#nBody [data-i]').forEach(c=>{const x=curList[+c.dataset.i];if(x&&isRead(x)&&!c.classList.contains('read'))c.classList.add('read')})}}
addEventListener('popstate',()=>{if(RDR.open)closeReader(true)});
function rdGo(d){const j=RDR.i+d,pg=$('#rdPage');if(j<0||j>=RDR.list.length){pg.animate([{transform:'none'},{transform:`translateX(${-d*28}px)`},{transform:'none'}],{duration:420,easing:'cubic-bezier(.34,1.45,.5,1)'});toast(d>0?'That\u2019s the last story.':'That\u2019s the first story.');return}
 if(RMQ.matches){RDR.i=j;rdRender();return}
 pg.animate([{transform:pg.style.transform||'none',opacity:1},{transform:`translateX(${-d*40}%)`,opacity:0}],{duration:200,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).onfinish=()=>{RDR.i=j;rdRender();pg.style.transform='';pg.style.opacity='';pg.animate([{transform:`translateX(${d*36}%)`,opacity:0},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.9,.25,1.04)'})}}
(function bindReader(){const sc=$('#rdScroll'),sh=$('#rdSheet'),pg=$('#rdPage');let raf=0;
 sc.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;rdProgress()})},{passive:true});
 $('#rdClose').onclick=()=>closeReader();$('#reader').addEventListener('click',e=>{if(e.target.id==='reader')closeReader()});
 $('#rdPrev').onclick=()=>rdGo(-1);$('#rdNext').onclick=()=>rdGo(1);
 $('#rdBm').onclick=e=>toggleSave(RDR.it,e.currentTarget);
 $('#rdShare').onclick=async()=>{const it=RDR.it;try{if(navigator.share){await navigator.share({title:it.title,url:it.link});return}await navigator.clipboard.writeText(it.link);toast('Link copied')}catch(e){}};
 $('#rdAa').onclick=e=>{e.stopPropagation();$('#rdPop').classList.toggle('on');FX.seg()};
 sh.addEventListener('click',e=>{if(!e.target.closest('#rdPop,#rdAa'))$('#rdPop').classList.remove('on')});
 document.querySelectorAll('#rpFs button').forEach(b=>b.onclick=()=>{const k=Math.max(0,Math.min(FSZ.length-1,FSZ.indexOf(S.reader.fs)+(+b.dataset.d)));S.reader.fs=FSZ[k];save();rdApply()});
 document.querySelectorAll('#rpFont button').forEach(b=>b.onclick=()=>{S.reader.font=b.dataset.f;save();rdApply()});
 document.querySelectorAll('#rpTh button').forEach(b=>b.onclick=()=>{S.reader.theme=b.dataset.t;save();rdApply()});
 document.addEventListener('keydown',e=>{if(!RDR.open||e.target.matches('input,textarea'))return;if(e.key==='Escape'){e.stopImmediatePropagation();if($('#rdPop').classList.contains('on'))$('#rdPop').classList.remove('on');else closeReader()}else if(e.key==='ArrowRight')rdGo(1);else if(e.key==='ArrowLeft')rdGo(-1)},true);
 // touch: swipe between stories, pull down at the top to close
 let sx=0,sy=0,st=0,mode=null,dx=0,dy=0;
 sc.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now();mode=null;dx=dy=0},{passive:true});
 sc.addEventListener('touchmove',e=>{if(e.touches.length!==1)return;dx=e.touches[0].clientX-sx;dy=e.touches[0].clientY-sy;
  if(!mode){if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.4)mode='x';else if(dy>10&&sc.scrollTop<=0&&Math.abs(dy)>Math.abs(dx))mode='y';else if(Math.abs(dy)>10)mode='scroll'}
  if(mode==='x'){e.preventDefault();pg.style.transform=`translate3d(${dx*.85}px,0,0)`;pg.style.opacity=String(1-Math.min(.5,Math.abs(dx)/700))}
  else if(mode==='y'){e.preventDefault();sh.style.transition='none';sh.style.transform=`translate3d(0,${Math.max(0,dy*.7)}px,0)`}},{passive:false});
 sc.addEventListener('touchend',()=>{const v=Math.abs(dx)/Math.max(1,Date.now()-st);
  if(mode==='x'){if(Math.abs(dx)>90||v>.55)rdGo(dx<0?1:-1);else{pg.animate([{transform:pg.style.transform,opacity:pg.style.opacity},{transform:'none',opacity:1}],{duration:450,easing:'cubic-bezier(.34,1.45,.5,1)'});pg.style.transform='';pg.style.opacity=''}}
  else if(mode==='y'){sh.style.transition='';if(dy>110||dy/Math.max(1,Date.now()-st)>.7){closeReader()}else sh.style.transform=''}
  if(mode!=='x'){pg.style.opacity=''}mode=null},{passive:true});
 $('#rdBar').addEventListener('touchstart',e=>{sy=e.touches[0].clientY;st=Date.now();dy=0},{passive:true});
 $('#rdBar').addEventListener('touchmove',e=>{dy=e.touches[0].clientY-sy;if(dy>0){e.preventDefault();sh.style.transition='none';sh.style.transform=`translate3d(0,${dy*.7}px,0)`}},{passive:false});
 $('#rdBar').addEventListener('touchend',()=>{sh.style.transition='';if(dy>100)closeReader();else sh.style.transform='';dy=0},{passive:true});
})();
