/* HQ · Spotlight: one search for notes, events, goals, habits, news, music and tools */
(()=>{'use strict';
const sp=$('#spot'),q=$('#spotQ'),res=$('#spotRes');let sel=0,items=[],openT=0;
const PAGES=[['home','home','Home','Clock, weather and widgets','dashboard'],['cal','cal','Calendar','Month view and events','events schedule plan agenda'],['news','news','News','For you, AI, games, film','articles stories feed read saved bookmarks'],['music','music','Music','Now playing and library','songs playlist play queue'],['focus','focus','Focus','Deep work timer','pomodoro study'],['goals','goals','Goals','Today\u2019s goals','todo tasks'],['notes','notes','Notes','Everything you\u2019ve written','ideas'],['habits','habits','Habits','Daily streaks','streak routine'],['convert','fx','Currency','Live rates vs ₹','fx exchange rupee dollar inr usd euro'],['clocks','clock','World clock','Time around the world','timezone time zones'],['calc','calc','Calculator','With history','math'],['timers','timer','Timers','Stopwatch and countdowns','stopwatch countdown alarm lap'],['stats','stats','Stats','Focus streaks and heatmap','progress history'],['settings','settings','Settings','Theme, data, location','preferences backup export import']];
const ACTIONS=()=>[{t:'New note',s:'Capture a thought',k:'add note write',i:'notes',run:()=>qcOpen('note')},{t:'New goal',s:'Add to today',k:'add goal todo task',i:'goals',run:()=>qcOpen('goal')},
 {t:'New event',s:'Add to the calendar',k:'add event calendar schedule',i:'cal',run:()=>{go('cal');setTimeout(()=>{const b=document.getElementById('evAdd');b&&b.click()},500)}},
 {t:'Start a focus session',s:S.settings.work+' minutes',k:'focus start pomodoro session',i:'focus',run:()=>{go('focus');setTimeout(()=>{const b=document.getElementById('go');b&&b.click()},500)}},
 {t:'5-minute timer',s:'Countdown',k:'timer 5 countdown',i:'timer',run:()=>{addTimer(300,'');go('timers')}},
 {t:playing?'Pause music':'Play music',s:playing?'':'HQ Mix',k:'play pause music song resume',i:'music',run:()=>ctl.toggle()},
 {t:'Open Now Playing',s:'Full-screen player',k:'now playing player full screen music',i:'music',run:()=>openNP($('#miniThumb'))},
 {t:'Toggle theme',s:'System · Light · Dark',k:'theme dark light mode appearance',i:'settings',run:()=>$('#themeBtn').click()},
 {t:'Edit Home widgets',s:'Reorder or hide',k:'customize home widgets reorder layout edit',i:'grid',run:()=>{go('home');setTimeout(()=>homeEdit(true),500)}}];
const go=h=>{if(location.hash==='#'+h)render();else location.hash='#'+h};
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const bonus=(s,b)=>s>0?s+b:0;
function score(text,toks){const t=norm(text);let sc=0;for(const k of toks){const i=t.indexOf(k);if(i<0)return 0;sc+=i===0?4:/[^a-z0-9]/.test(t[i-1])?3:1}return sc}
const hl=(s,toks)=>{let h=esc(s);toks.filter(k=>k.length>0).forEach(k=>{const re=new RegExp('('+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');h=h.replace(/(<[^>]*>)|([^<]+)/g,(m,tag,tx)=>tag||tx.replace(re,'<mark>$1</mark>'))});return h};
function snip(text,toks,n=70){const t=String(text).replace(/\s+/g,' ');const i=toks.length?norm(t).indexOf(toks[0]):0;const a=Math.max(0,i-24);return (a?'…':'')+t.slice(a,a+n)+(t.length>a+n?'…':'')}
function calc(s0){let s=s0.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/,/g,'').replace(/\s+/g,'').replace(/^=/,'');if(!/^[\d.+\-*/^%()]+$/.test(s)||!/\d/.test(s)||!/[+\-*/^%]/.test(s.replace(/^-/,'')))return null;let i=0;
 const num=()=>{const m=s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);if(!m)throw 0;i+=m[0].length;return parseFloat(m[0])};
 const atom=()=>{if(s[i]==='('){i++;const v=expr();if(s[i]!==')')throw 0;i++;return v}if(s[i]==='-'){i++;return -atom()}if(s[i]==='+'){i++;return atom()}return num()};
 const post=()=>{let v=atom();while(s[i]==='%'){i++;v/=100}return v};const pow=()=>{const b=post();if(s[i]==='^'){i++;return Math.pow(b,pow())}return b};
 const term=()=>{let v=pow();while(s[i]==='*'||s[i]==='/'){const o=s[i++],r=pow();v=o==='*'?v*r:v/r}return v};
 const expr=()=>{let v=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++],r=term();v=o==='+'?v+r:v-r}return v};
 try{const v=expr();return i===s.length&&isFinite(v)?parseFloat(v.toPrecision(12)):null}catch(e){return null}}
const SYM={'$':'USD','€':'EUR','£':'GBP','¥':'JPY','₹':'INR','rs':'INR','rupees':'INR','rupee':'INR','dollars':'USD','dollar':'USD','euros':'EUR','euro':'EUR','pounds':'GBP','yen':'JPY','dirham':'AED','dirhams':'AED'};
function fxQ(raw){const m=raw.trim().match(/^([$€£¥₹])?\s*([\d.,]+)\s*([a-z]{2,7}|[$€£¥₹])?\s*(?:(?:to|in|=|→|->)\s*([a-z]{2,7}|[$€£¥₹]))?$/i);if(!m)return null;
 const cur=x=>{if(!x)return null;const k=x.toLowerCase();return SYM[k]||SYM[x]||(x.length===3?x.toUpperCase():null)};const from=cur(m[1])||cur(m[3]);if(!from)return null;const r=fxCache();if(!r||!r.rates[from])return null;
 let to=cur(m[4])||(from==='INR'?'USD':'INR');if(!r.rates[to])return null;const a=parseFloat(m[2].replace(/,/g,''));if(!(a>=0))return null;return{a,from,to,v:fxConvert(a,from,to)}}
function timeQ(raw){const m=norm(raw).match(/^(?:time\s+(?:in|at)\s+|what\s+time\s+is\s+it\s+in\s+)(.+)$|^(.+?)\s+time$/);if(!m)return null;const c=(m[1]||m[2]).trim();if(c.length<2)return null;
 const own=(S.clocks||[]).find(x=>norm(x.name).startsWith(c));const z=own?own.tz:ZONES.find(x=>norm(tzName(x))===c)||ZONES.find(x=>norm(tzName(x)).startsWith(c));if(!z)return null;return{z,name:own?own.name:tzName(z)}}
const IC2=k=>`<span class="si">${ICO[k]?ic(k):k}</span>`;
function row(it,i){return `<button class="srow tap ${i===sel?'sel':''}" role="option" data-k="${i}" aria-selected="${i===sel}">${it.img?`<span class="si im"><img src="${esc(it.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></span>`:IC2(it.i||'search')}<span class="st"><b>${it.h||esc(it.t)}</b>${it.s?`<span>${it.sh||esc(it.s)}</span>`:''}</span>${it.r?`<span class="sr">${it.r}</span>`:''}<span class="sret">↵</span></button>`}
function build(raw){const toks=norm(raw).split(/\s+/).filter(Boolean);const G=[];items=[];
 const add=(label,arr)=>{if(arr.length)G.push({label,arr})};
 if(!toks.length){add('Quick actions',ACTIONS().slice(0,6));add('Jump to',PAGES.slice(0,8).map(([h,i,t,s])=>({t,s,i,run:()=>go(h)})));
  if(S.recentQ.length)G.unshift({label:'Recent searches',arr:S.recentQ.slice(0,4).map(r=>({t:r,i:'search',fill:r,run:()=>{q.value=r;paint()}}))});return G}
 const c=calc(raw);if(c!=null)add('Calculator',[{t:'= '+c.toLocaleString('en-IN',{maximumFractionDigits:10}),s:raw.trim()+' · tap to open the calculator',i:'calc',big:1,run:()=>{cx={cur:String(c),toks:[],fresh:false,op:null};go('calc')}}]);
 const f=fxQ(raw);if(f)add('Currency',[{t:fmtN(f.v,f.to),s:`${fmtN(f.a,f.from)} · live rate${Date.now()-fxCache().at>864e5?' (saved)':''}`,i:'fx',big:1,run:()=>{S.fx={amt:f.a,from:f.from,to:f.to};save();go('convert')}}]);
 const tq=timeQ(raw);if(tq)add('World clock',[{t:tzTime(tq.z),s:`${tq.name} · ${tzOffset(tq.z)}`,i:'clock',big:1,run:()=>go('clocks')}]);
 if(/^(weather|temp|temperature|forecast|rain)/.test(toks[0])&&S.wx&&S.wx.cur)add('Weather',[{t:`${Math.round(S.wx.cur.t)}° · ${WNAME[S.wx.cur.code]||''}`,s:`${S.wx.place||'Now'} · H ${Math.round(S.wx.daily[0].hi)}° L ${Math.round(S.wx.daily[0].lo)}°`,i:'sparkle',big:1,run:()=>{go('home');setTimeout(()=>{const w=document.getElementById('wxcard');w&&w.scrollIntoView({behavior:'smooth',block:'center'})},500)}}]);
 const rank=(arr,fn,lim=4)=>arr.map(x=>[x,fn(x)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,lim).map(x=>x[0]);
 add('Actions',rank(ACTIONS(),a=>score(a.t+' '+a.k,toks),3));
 add('Pages & tools',rank(PAGES,p=>score(p[2]+' '+p[4],toks)*1.2,4).map(([h,i,t,s])=>({t,s,i,h:hl(t,toks),run:()=>go(h)})));
 add('Notes',rank(S.notes,n=>bonus(score(n.text,toks),n.pinned?.5:0)).map(n=>({t:n.text.split('\n')[0],h:hl(snip(n.text.split('\n')[0],toks,60),toks),s:new Date(n.updated).toLocaleDateString('en-IN',{day:'numeric',month:'short'})+(n.text.includes('\n')?' · '+snip(n.text.split('\n').slice(1).join(' '),toks,40):''),i:'notes',run:()=>{noteQ=raw.trim();go('notes')}})));
 add('Calendar',rank(S.blocks,b=>bonus(score(b.title,toks),b.date>=today()?.5:0)).map(b=>({t:b.title,h:hl(b.title,toks),s:new Date(b.date+'T12:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})+' · '+(b.allDay?'All day':b.start+'–'+b.end),i:'cal',r:`<i class="sdot" style="background:${COLORS[b.color]}"></i>`,run:()=>{const [y,m]=b.date.split('-').map(Number);calY=y;calM=m-1;calSel=b.date;go('cal')}})));
 add('Goals',rank(S.todos,x=>bonus(score(x.text,toks),x.date===today()?.5:0)).map(x=>({t:x.text,h:hl(x.text,toks),s:(x.date===today()?'Today':new Date(x.date+'T12:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}))+(x.done?' · done':''),i:'goals',run:()=>go('goals')})));
 add('Habits',rank(S.habits,x=>score(x.name,toks),3).map(x=>({t:x.name,h:hl(x.name,toks),s:habitStreak(x.id)+'-day streak',i:'habits',run:()=>go('habits')})));
 const seen=new Set(),news=[];S.saved.concat(...['ai','games','movies'].map(k=>((newsCache(k)||{}).items||[]).map(i=>Object.assign({},i,{cat:i.cat||k})))).forEach(i=>{if(!seen.has(i.id)){seen.add(i.id);news.push(i)}});
 const nr=rank(news,i=>score(i.title+' '+(i.src||''),toks)*2+score(i.desc||'',toks)*.3,5);add('News',nr.map((i,k)=>({t:i.title,h:hl(i.title,toks),s:`${i.src}${i.cat?' · '+NLAB[i.cat]:''}${isSaved(i)?' · saved':''}`,img:i.img,run:()=>openReader(nr,k)})));
 const mus=[];S.music.lib.forEach(x=>mus.push({t:x.title,s:(x.type==='playlist'?'Playlist':'Video')+' · library',img:x.thumb||(x.type==='video'?thumb(x.id):''),i:'music',key:x.title,run:()=>{playItem(x);toast('Playing '+x.title)}}));
 S.music.recent.forEach(x=>{if(x.t)mus.push({t:cleanT(x.t),s:cleanA(x.a)+' · recently played',img:thumb(x.id,'default'),key:x.t+' '+x.a,run:()=>playVid(x.id)})});
 Object.entries(YM).slice(-300).forEach(([id,m])=>{if(!S.music.recent.some(r=>r.id===id))mus.push({t:cleanT(m.t),s:m.a+' · in your queue',img:thumb(id,'default'),key:m.t+' '+m.a,run:()=>playVid(id)})});
 add('Music',rank(mus,x=>score(x.key,toks),4).map(x=>Object.assign(x,{h:hl(x.t,toks)})));
 add('World clock',rank(S.clocks||[],c=>score(c.name,toks),2).map(c=>({t:c.name,s:tzTime(c.tz)+' · '+tzOffset(c.tz),i:'clock',run:()=>go('clocks')})));
 return G}
function paint(){const raw=q.value;const G=build(raw);items=[];let html='';
 G.forEach(g=>{html+=`<div class="sgrp"><div class="sl">${g.label}</div>${g.arr.map(it=>{items.push(it);return row(it,items.length-1).replace('class="srow',it.big?'class="srow big':'class="srow')}).join('')}</div>`});
 if(!items.length)html=`<div class="sempty"><div class="glyph">?</div><b>No results for “${esc(raw.trim())}”</b><span>Try a note, an event, a headline, a song, “100 usd”, “time in tokyo” or “12*7”.</span></div>`;
 sel=Math.min(sel,Math.max(0,items.length-1));res.innerHTML=html.replace(/data-k="(\d+)" aria-selected="(true|false)"/g,(m,k)=>`data-k="${k}" aria-selected="${+k===sel}"`);res.querySelectorAll('.srow').forEach(r=>r.classList.toggle('sel',+r.dataset.k===sel))}
function move(d){if(!items.length)return;sel=(sel+d+items.length)%items.length;res.querySelectorAll('.srow').forEach(r=>{const on=+r.dataset.k===sel;r.classList.toggle('sel',on);r.setAttribute('aria-selected',on);if(on)r.scrollIntoView({block:'nearest'})})}
function runK(k){const it=items[k];if(!it)return;const raw=q.value.trim();if(raw&&!it.fill){S.recentQ=[raw].concat(S.recentQ.filter(x=>x!==raw)).slice(0,8);save()}if(it.fill){it.run();return}close();setTimeout(it.run,it.big?40:120)}
function open(){if(document.body.classList.contains('spot'))return;closeSheets();sp.hidden=false;document.body.classList.add('spot');q.value='';sel=0;paint();openT=Date.now();requestAnimationFrame(()=>{sp.classList.add('on');q.focus({preventScroll:true})})}
function close(){if(!document.body.classList.contains('spot'))return;sp.classList.remove('on');document.body.classList.remove('spot');q.blur();setTimeout(()=>{if(!sp.classList.contains('on'))sp.hidden=true},380)}
window.Spot={open,close};
$('#searchBtn').onclick=open;$('#spotX').onclick=close;sp.addEventListener('click',e=>{if(e.target.matches('[data-close]'))close()});
let tmr=0;q.addEventListener('input',()=>{sel=0;clearTimeout(tmr);tmr=setTimeout(paint,40)});
q.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Enter'){e.preventDefault();runK(sel)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(q.value){q.value='';paint()}else close()}});
res.addEventListener('click',e=>{const r=e.target.closest('[data-k]');if(r)runK(+r.dataset.k)});
res.addEventListener('pointermove',e=>{const r=e.target.closest('[data-k]');if(r&&+r.dataset.k!==sel){sel=+r.dataset.k;res.querySelectorAll('.srow').forEach(x=>{x.classList.toggle('sel',+x.dataset.k===sel)})}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.body.classList.contains('spot')?close():open()}else if(e.key==='/'&&!e.target.matches('input,textarea,select,[contenteditable]')&&!document.body.classList.contains('spot')&&!(typeof RDR!=='undefined'&&RDR.open)&&!npOpen){e.preventDefault();open()}});
})();
