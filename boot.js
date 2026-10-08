/* HQ · boot: theme, quick capture, router + view transitions, splash, service worker */
'use strict';
const mq=matchMedia('(prefers-color-scheme: light)');
const THI={system:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/></svg>',light:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',dark:'<svg viewBox="0 0 24 24"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/></svg>'};
function applyTheme(){const t=S.settings.theme,eff=t==='system'?(mq.matches?'light':'dark'):t;const r=document.documentElement;r.dataset.theme=eff;r.dataset.tod=tod();try{bgPalette()}catch(e){}$('#themeBtn').innerHTML=THI[t]||THI.system;$('#themeBtn').title='Theme: '+t}
mq.addEventListener&&mq.addEventListener('change',()=>S.settings.theme==='system'&&applyTheme());
// Time of day selects saturated A/B palettes; light mode lifts them into airy pastels.
// IST anchors -> [A: a1..a4, B: b1..b4]. Phones keep palette A static.
const PAL={night:[['#3756cc','#147b93','#b8588a','#754bd1'],['#168b9d','#6b45ce','#4a7cd6','#b25b94']],
 dawn:[['#a95b9c','#eb9ca9','#ffc48c','#6b80dc'],['#d98469','#a481de','#ffdfa5','#5c9dc9']],
 day:[['#4280ed','#25b6c0','#ffc991','#a280e5'],['#36acb3','#6b97ed','#99dfbd','#8b9ce6']],
 gold:[['#cc7259','#efab72','#ffd49a','#9a73ca'],['#bd6f9f','#c689ca','#ffbea0','#8595d7']],
 eve:[['#655bd3','#a66bd7','#e59ba8','#397daa'],['#408ec7','#ba6caa','#efa6b5','#7d71d1']]};
const PAN=[[60,'night'],[330,'night'],[420,'dawn'],[540,'day'],[930,'day'],[1080,'gold'],[1200,'eve'],[1290,'eve'],[1500,'night']];
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),xh=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>{const p=hx(a),q=hx(b);return xh(p.map((v,i)=>v+(q[i]-v)*t))};
function istMin(){const [h,m]=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':').map(Number);return (h%24)*60+m}
function bgPalette(){const r=document.documentElement;let m=istMin();if(m<60)m+=1440;let k=0;while(k<PAN.length-2&&m>=PAN[k+1][0])k++;
 const [m0,p0]=PAN[k],[m1,p1]=PAN[k+1],t0=Math.max(0,Math.min(1,(m-m0)/((m1-m0)||1))),t=t0*t0*(3-2*t0),light=r.dataset.theme==='light';
 const base=PAL[p0][0].map((c,i)=>mixc(c,PAL[p1][0][i],t));if(window.ATM){ATM.palette(base);return}['a','b'].forEach((s,j)=>{for(let i=0;i<4;i++){let c=mixc(PAL[p0][j][i],PAL[p1][j][i],t);if(light)c=mixc(c,'#ffffff',.7);r.style.setProperty('--'+s+(i+1),c)}})}
bgPalette();
setInterval(()=>{document.documentElement.dataset.tod=tod();bgPalette()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)bgPalette()});
$('#themeBtn').onclick=()=>{const o=['system','light','dark'];S.settings.theme=o[(o.indexOf(S.settings.theme)+1)%3];save();
 const go=()=>{applyTheme();if(location.hash==='#settings')render()};if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(go);else go();toast('Theme: '+S.settings.theme[0].toUpperCase()+S.settings.theme.slice(1))};
applyTheme();applyWxMood();
let qcKind='goal';
function qcOpen(k){if(k){qcKind=k;document.querySelectorAll('#qcSeg button').forEach(x=>x.classList.toggle('on',x.dataset.k===k));$('#qcText').placeholder=k==='goal'?'One thing that would make today a win…':'Capture a thought…'}qc(true)}
function qc(open){if(open){$('#sheet').inert=false;if(!document.body.classList.contains('qc'))sheetOpener=document.activeElement;$('#sheet').classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('qc');setTimeout(()=>$('#qcText').focus(),120);FX.seg()}else closeSheets()}
$('#qcBtn').onclick=()=>{if(document.body.classList.contains('qc'))closeSheets();else window.HQPLUS?HQPLUS.capture():qc(true)};$('#scrim').onclick=closeSheets;$('#qcCancel').onclick=closeSheets;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.body.classList.contains('spot'))closeSheets()});
document.querySelectorAll('#qcSeg button').forEach(b=>b.onclick=()=>{qcKind=b.dataset.k;document.querySelectorAll('#qcSeg button').forEach(x=>x.classList.toggle('on',x===b));FX.seg();$('#qcText').placeholder=qcKind==='goal'?'One thing that would make today a win…':'Capture a thought…'});
$('#qcText').placeholder='One thing that would make today a win…';$('#sheet').inert=true;try{$('#qcText').value=localStorage.getItem('hq:draft:quick')||''}catch(e){}$('#qcText').oninput=()=>{try{localStorage.setItem('hq:draft:quick',$('#qcText').value)}catch(e){toast('Could not save this draft. Keep the sheet open.')}};
$('#qcForm').onsubmit=e=>{e.preventDefault();const v=$('#qcText').value.trim();if(!v)return;if(qcKind==='goal')S.todos.push({id:uid(),text:v.slice(0,140),done:false,date:today()});else S.notes.push({id:uid(),text:v,pinned:false,created:Date.now(),updated:Date.now()});const stored=save();if(!stored)return;$('#qcText').value='';try{localStorage.removeItem('hq:draft:quick')}catch(e){}closeSheets();toast(qcKind==='goal'?'Goal added to today ✓':'Note saved ✓');render()};
const TABOF={vault:'more',browse:'more',routines:'more',play:'more',goals:'more',notes:'more',habits:'more',stats:'more',settings:'more',focus:'more',tools:'more',convert:'more',clocks:'more',calc:'more',timers:'more'};
const ORDER=['home','cal','news','music','more'];
let vtSrc=null,curVT=null;
const viewOf=h=>{const t=(h||'#home').slice(1);return V[t]?t:'home'};
function render(remember=true){if(remember&&window.HQPLUS)HQPLUS.remember();const v=viewOf(location.hash);if(v==='news'&&document.body.dataset.view!=='news')newsEnter();const el=$('#view');el.classList.remove('vin');el.innerHTML=V[v]();if(!document.documentElement.dataset.vt){void el.offsetWidth;el.classList.add('vin')}document.body.dataset.view=v;
 document.querySelectorAll('#dock a').forEach(a=>{const on=a.dataset.t===(TABOF[v]||v);a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});placeYT();V[v].after&&V[v].after();window.HQPLUS&&HQPLUS.after(v);window.FX&&FX.refresh()}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('#view a[href^="#"]');if(!a||document.body.classList.contains('hediting'))return;vtSrc=a.querySelector('.mtile b, :scope>.kicker, .row>.kicker')||null},true);
function navigate(){window.HQPLUS&&HQPLUS.remember();window.PlayCorner&&PlayCorner.leave();const to=viewOf(location.hash),from=document.body.dataset.view;closeSheets();if(typeof RDR!=='undefined'&&RDR.open){RDR.pushed=false;closeReader(true)}if(npOpen){npPushed=false;closeNP(true)}
 if(homeEditing&&to!=='home')homeEditing=false;document.body.classList.remove('hediting');
 const go=()=>{render(false);window.scrollTo({top:window.HQPLUS?HQPLUS.scroll(to):0,behavior:'instant'})};
 if(document.startViewTransition&&!RMQ.matches&&!matchMedia('(pointer: coarse)').matches&&innerWidth>760&&from&&from!==to&&!document.hidden){const fi=ORDER.indexOf(TABOF[from]||from),ti=ORDER.indexOf(TABOF[to]||to);const R=document.documentElement;R.dataset.vt=ti>fi?'fwd':ti<fi?'back':(TABOF[to]&&!TABOF[from]?'fwd':TABOF[from]&&!TABOF[to]?'back':'fwd');
  const src=vtSrc&&vtSrc.isConnected?vtSrc:null;document.querySelectorAll('[style*="view-transition-name"]').forEach(x=>x.style.viewTransitionName='');if(src)src.style.viewTransitionName='shared';
  let t;try{t=document.startViewTransition(()=>{go();if(src){const g=document.querySelector('#view .ptitle');if(g)g.style.viewTransitionName='shared'}})}catch(err){delete R.dataset.vt;go();return}
  curVT=t;t.finished.catch(()=>{}).finally(()=>{if(curVT!==t)return;curVT=null;delete R.dataset.vt;document.querySelectorAll('[style*="view-transition-name"]').forEach(x=>x.style.viewTransitionName='')})}
 else go();vtSrc=null}
window.addEventListener('hashchange',navigate);
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('paused',document.hidden));
if(S.timer)loop();
render();
(function splash(){const s=document.getElementById('splash');if(!s)return;const seen=sessionStorage.getItem('hq:splash');try{sessionStorage.setItem('hq:splash','1')}catch(e){}
 const out=()=>{s.classList.add('out');document.body.classList.add('intro');setTimeout(()=>s.remove(),900);setTimeout(()=>document.body.classList.remove('intro'),2200)};
 if(seen||RMQ.matches){s.classList.add('quick');out();return}
 Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,1400))]).then(()=>setTimeout(out,Math.max(0,1150-performance.now())))})();
// warm the offline font cache once the service worker controls the page (latin subsets only)
function warmFonts(){try{if(!navigator.serviceWorker.controller||!navigator.onLine||localStorage.getItem('hq:fw')==='12')return;const l=document.querySelector('link[rel=stylesheet][href*="fonts.googleapis"]');if(!l)return;
 fetch(l.href,{mode:'cors'}).then(r=>r.ok?r.text():Promise.reject()).then(css=>Promise.all(css.split('/*').filter(b=>/^\s*latin(-ext)?\s*\*\//.test(b)).map(b=>(b.match(/url\((https:[^)]+)\)/)||[])[1]).filter(Boolean).map(u=>fetch(u,{mode:'cors'}).catch(()=>{})))).then(()=>{try{localStorage.setItem('hq:fw','12')}catch(e){}}).catch(()=>{})}catch(e){}}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('SW',e)));
 navigator.serviceWorker.addEventListener('controllerchange',()=>setTimeout(warmFonts,1500));setTimeout(warmFonts,5000)}
