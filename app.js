(()=>{
'use strict';
const KEY='aaravhq:v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'});
const today=()=>fmt.format(new Date());
const dnum=d=>Math.floor(Date.parse(d+'T00:00:00Z')/864e5);
const addDays=(d,n)=>new Date((dnum(d)+n)*864e5).toISOString().slice(0,10);
const istHour=()=>+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',hour12:false}).format(new Date())%24;
const defSet=()=>({work:25,brk:5,theme:'system',city:{name:'New Delhi',lat:28.6139,lon:77.209},remindMin:5});
const def=()=>({v:1,focus:{},sessions:0,todos:[],notes:[],blocks:[],habits:[],habitLog:{},settings:defSet(),timer:null,created:today()});
let S;try{S=Object.assign(def(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=def()}
S.settings=Object.assign(defSet(),S.settings);['notes','blocks','habits'].forEach(k=>Array.isArray(S[k])||(S[k]=[]));if(!S.habitLog||typeof S.habitLog!=='object')S.habitLog={};
['daily','practice','srs','loreSeen','hints','quits','cleared'].forEach(k=>delete S[k]);
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
(function carry(){const t=today();let n=0;S.todos.forEach(x=>{if(!x.done&&x.date<t){x.date=t;x.carried=(x.carried||0)+1;n++}});S.todos=S.todos.filter(x=>!(x.done&&x.date<addDays(t,-60)));save();if(n)setTimeout(()=>toast(`Carried over ${n} unfinished goal${n>1?'s':''} from earlier.`),600)})();
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),3000)}
const focusSet=()=>new Set(Object.entries(S.focus).filter(([,m])=>m>0).map(([d])=>d));
function streak(set){let d=today(),n=0;if(!set.has(d))d=addDays(d,-1);while(set.has(d)){n++;d=addDays(d,-1)}return n}
function best(set){const a=[...set].sort();let b=0,c=0,p=null;a.forEach(d=>{c=(p&&addDays(p,1)===d)?c+1:1;b=Math.max(b,c);p=d});return b}
function weekFocus(){const t=today();return Array.from({length:7},(_,i)=>{const d=addDays(t,i-6);return{d,m:S.focus[d]||0}})}
const V={};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const nowHM=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const COLORS={ember:'#ff5b3a',amber:'#ffb547',mint:'#5fe3b0',sky:'#5bb8ff',violet:'#a98bff',rose:'#ff7eb6'};
S.blocks.forEach(b=>{if(!b.color)b.color='ember';if(!b.start)b.allDay=true});
const blocksFor=d=>S.blocks.filter(b=>b.date===d).sort((x,y)=>(x.allDay?'':x.start).localeCompare(y.allDay?'':y.start));
function habitStreak(id){let d=today(),n=0;if(!(S.habitLog[d]||{})[id])d=addDays(d,-1);while((S.habitLog[d]||{})[id]){n++;d=addDays(d,-1)}return n}
const tod=()=>{const h=istHour();return h>=5&&h<8?'dawn':h>=8&&h<17?'day':h>=17&&h<20?'dusk':'night'};
const SVG=(p,c='wi')=>`<svg viewBox="0 0 24 24" class="${c}" aria-hidden="true">${p}</svg>`;
const ICO={cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/>',focus:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',goals:'<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>',notes:'<path d="M6 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20z"/><path d="M14.5 3.5v4.5H19M9 12h6M9 16h4"/>',habits:'<path d="M12 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8C19.5 16.4 12 21 12 21z"/>',stats:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',fx:'<circle cx="9" cy="9" r="5.5"/><path d="M15.5 9.6A5.5 5.5 0 1 1 9.6 15.5"/><path d="M8 7.5h2.5M8 10.5h2.5M9 7.5v4"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2M3.5 12h1.5M19 12h1.5"/>',calc:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',swap:'<path d="M7 4 3.5 7.5 7 11M3.5 7.5h14M17 13l3.5 3.5L17 20M20.5 16.5h-14"/>',plus:'<path d="M12 5v14M5 12h14"/>',refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',chevL:'<path d="m15 5-7 7 7 7"/>',chevR:'<path d="m9 5 7 7-7 7"/>',news:'<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><path d="M7.5 9h5M7.5 12.5h9M7.5 16h9"/>'};
const ic=(k,c='gi')=>SVG(ICO[k],c);
// ---------- WEATHER ----------
const wkind=c=>c<=1?'clear':c===2?'partly':c===3?'clouds':c<=48?'fog':c>=95?'storm':(c>=71&&c<=77)||c===85||c===86?'snow':'rain';
const WNAME={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Freezing fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',56:'Freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Snow showers',95:'Thunderstorm',96:'Storm & hail',99:'Storm & hail'};
function wIcon(code,day){const k=wkind(code);const sun='<circle cx="12" cy="12" r="4.2" class="sunf"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" stroke="#ffd27a"/>',moon='<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" class="moonf"/>',cloud='<path d="M7 18.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 18.5z"/>';
 if(k==='clear')return SVG(day?sun:moon);
 if(k==='partly')return SVG((day?'<g transform="translate(-3 -4) scale(.8)"><circle cx="12" cy="12" r="4.2" class="sunf"/></g>':'<g transform="translate(-3 -4) scale(.8)"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" class="moonf"/></g>')+cloud);
 if(k==='clouds')return SVG(cloud);
 if(k==='fog')return SVG('<path d="M4 9h16M3 13h18M5 17h14"/>');
 if(k==='snow')return SVG('<path d="M7 14.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 14.5z"/><path d="M8 18h.01M12 20h.01M16 18h.01M10 22h.01M14 22h.01" stroke-width="2.6"/>');
 if(k==='storm')return SVG('<path d="M7 14.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 14.5z"/><path d="m12.5 14-2 4h3l-2 4" class="bolt"/>');
 return SVG('<path d="M7 14.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 14.5z"/><path d="m9 17-1 3M13 17l-1 3M17 17l-1 3" class="rainc"/>')}
function sceneHTML(code,day){const k=wkind(code);let h='';
 if(k==='clear'||k==='partly')h+=day?'<i class="s-rays"></i><i class="s-sun"></i>':'<i class="s-stars"></i><i class="s-stars b"></i><i class="s-moon"></i>';
 if(k==='partly'||k==='clouds'||k==='rain'||k==='storm'||k==='snow')h+='<i class="s-cloud" style="top:8%"></i><i class="s-cloud c2"></i><i class="s-cloud c3"></i>';
 if(k==='rain'||k==='storm')h+='<i class="s-rain"></i><i class="s-rain b"></i>';
 if(k==='storm')h+='<i class="s-flash"></i>';
 if(k==='snow')h+='<i class="s-snow"></i>';
 if(k==='fog')h+='<i class="s-fog" style="top:20%"></i><i class="s-fog" style="top:50%;animation-delay:-6s"></i><i class="s-fog" style="top:75%;animation-delay:-12s"></i>';
 const cls=(k==='partly'?'clear':k)+' '+(day?'day':'night');return `<div class="scene ${cls}">${h}</div>`}
let wxBusy=false;
function getPos(){return new Promise(res=>{if(!navigator.geolocation)return res(null);let done=false;const t=setTimeout(()=>{done=true;res(null)},6000);navigator.geolocation.getCurrentPosition(p=>{if(done)return;clearTimeout(t);res({lat:p.coords.latitude,lon:p.coords.longitude,name:null})},()=>{if(done)return;clearTimeout(t);res(null)},{timeout:6000,maximumAge:18e5})})}
async function placeName(lat,lon){try{const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);const j=await r.json();return j.city||j.locality||j.principalSubdivision||'Your location'}catch(e){return 'Your location'}}
async function loadWeather(force){if(wxBusy)return;if(!force&&S.wx&&S.wx.cur&&Date.now()-S.wx.at<15*6e4)return;wxBusy=true;
 try{let pos=await getPos();if(pos)pos.name=await placeName(pos.lat,pos.lon);else pos=S.settings.city;
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lon}&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`);
  if(!r.ok)throw 0;const j=await r.json();const c=j.current,H=j.hourly,D=j.daily;let i0=H.time.findIndex(t=>t.slice(0,13)===c.time.slice(0,13));if(i0<0)i0=0;
  S.wx={cur:{t:c.temperature_2m,feel:c.apparent_temperature,code:c.weather_code,day:!!c.is_day,wind:c.wind_speed_10m,hum:c.relative_humidity_2m},
   hourly:H.time.slice(i0,i0+25).map((t,k)=>({t:t.slice(11,16),temp:H.temperature_2m[i0+k],code:H.weather_code[i0+k],p:H.precipitation_probability[i0+k],day:!!H.is_day[i0+k]})),
   daily:D.time.map((d,k)=>({d,code:D.weather_code[k],hi:D.temperature_2m_max[k],lo:D.temperature_2m_min[k],p:D.precipitation_probability_max[k]})),
   sunrise:D.sunrise[0].slice(11),sunset:D.sunset[0].slice(11),place:pos.name,at:Date.now()};S.wxErr=false;save()}
 catch(e){S.wxErr=true}
 wxBusy=false;applyWxMood();const el=document.getElementById('wxcard');if(el){el.innerHTML=wxInner();FX.refresh()}const g=document.getElementById('ctx');if(g)g.innerHTML=ctxLine()}
function applyWxMood(){const w=S.wx&&S.wx.cur;document.documentElement.dataset.wx=w?wkind(w.code):'none'}
function wxInner(){const w=S.wx;if(!w||!w.cur)return S.wxErr?`<div class="wxin wxerr"><div class="empty"><div class="glyph">~</div><div class="ed">The sky is shy today.</div><p>Couldn\u2019t reach the weather service. We\u2019ll try again soon.</p><button class="btn sm tap" id="wxRetry">${ic('refresh')} Try again</button></div></div>`:`<div class="wxin"><div class="kicker">Weather</div><div class="skel" style="height:90px;width:60%;margin-top:8px"></div><div class="skel" style="height:60px;margin-top:18px"></div></div>`;
 const c=w.cur,lo=Math.min(...w.daily.map(d=>d.lo)),hi=Math.max(...w.daily.map(d=>d.hi)),rng=Math.max(1,hi-lo);
 const age=Date.now()-w.at,stale=age>3*36e5;
 return sceneHTML(c.code,c.day)+`<div class="wxin"><div class="wxtop"><div><div class="kicker">${esc(w.place||'Weather')}${stale?' · saved':''}</div><div class="wxtemp">${Math.round(c.t)}<sup>°</sup></div><div class="wxcond">${WNAME[c.code]||'—'}</div>
 <div class="wxmeta"><span>Feels ${Math.round(c.feel)}°</span><span>H ${Math.round(w.daily[0].hi)}° · L ${Math.round(w.daily[0].lo)}°</span><span>${Math.round(c.hum)}% humidity</span><span>${Math.round(c.wind)} km/h</span></div></div></div>
 <div class="hourly">${w.hourly.map((h,k)=>`<div class="hr ${k===0?'now':''}"><span>${k===0?'Now':h.t.slice(0,2)}</span>${wIcon(h.code,h.day)}<b>${Math.round(h.temp)}°</b><em>${h.p>=20?h.p+'%':''}</em></div>`).join('')}</div>
 <div class="days">${w.daily.map((d,k)=>`<div class="day"><span>${k===0?'Today':new Date(d.d+'T12:00').toLocaleDateString('en-IN',{weekday:'short'})}</span>${wIcon(d.code,true)}<span class="pp">${d.p>=20?d.p+'%':''}</span><span class="lo">${Math.round(d.lo)}°</span><div class="trk"><i style="left:${(d.lo-lo)/rng*100}%;right:${(hi-d.hi)/rng*100}%"></i></div><span class="hi">${Math.round(d.hi)}°</span></div>`).join('').replace(/<span class="hi">/g,m=>m)}</div>
 <div class="small muted" style="margin-top:10px">Sunrise ${w.sunrise} · Sunset ${w.sunset}</div></div>`}
// ---------- HOME ----------
function greetWord(){const h=istHour();return h<5?'Late night':h<12?'Morning':h<17?'Afternoon':h<21?'Evening':'Night'}
function ctxLine(){const w=S.wx&&S.wx.cur,t=today(),bl=blocksFor(t),hm=nowHM(),nx=bl.find(b=>!b.allDay&&b.end>hm),h=istHour();let s;
 if(w){const T=Math.round(w.t),k=wkind(w.code);s=k==='rain'?`Rain outside, ${T}°. Perfect weather for deep work.`:k==='storm'?`Thunder around, ${T}°. Stay in and make something.`:k==='snow'?`Snow, ${T}°. Hot drink, long session.`:k==='fog'?`Foggy and ${T}°. Soft focus outside, sharp focus inside.`:k==='clouds'?`Grey skies, ${T}°. Calm light for a calm mind.`:w.day?`${k==='clear'?'Clear skies':'Bright and breezy'}, ${T}°. A good day to do something big.`:`A ${k==='clear'?'clear':'quiet'} night, ${T}°. ${h>=23||h<5?'Rest is part of the plan.':'One last sprint, then rest.'}`}
 else s=h<12?'A fresh page. What will you write on it?':h<18?'Plenty of day left. Make it count.':'The day is winding down. Finish gently.';
 if(nx)s+=` Next up: <b>${esc(nx.title)}</b> at ${nx.start}.`;else if(bl.length===0&&h<20)s+=' Your calendar is wide open.';
 return s}
const fmtHM=d=>({h:String(d.getHours()).padStart(2,'0'),m:String(d.getMinutes()).padStart(2,'0'),s:String(d.getSeconds()).padStart(2,'0')});
function heroClock(){const c=fmtHM(new Date());return `<span class="hh">${c.h}</span><span class="mm"><span class="col" aria-hidden="true"><i></i><i></i></span>${c.m}<span class="ss" id="hss">${c.s}</span></span>`}
const EMPTY=(g,t,p,extra='')=>`<div class="empty"><div class="glyph">${g}</div><div class="ed">${t}</div><p>${p}</p>${extra}</div>`;
V.home=()=>{const t=today(),td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length,fm=S.focus[t]||0,goal=120;
 const bl=blocksFor(t),hm=nowHM(),up=bl.filter(b=>b.allDay||b.end>hm).slice(0,4);
 const hl=S.habitLog[t]||{},hd=S.habits.filter(x=>hl[x.id]).length;
 const d7=Array.from({length:7},(_,i)=>addDays(t,i-6)).map(d=>{const l=S.habitLog[d]||{};return S.habits.length&&S.habits.every(x=>l[x.id])});
 const pins=S.notes.filter(n=>n.pinned).concat(S.notes.filter(n=>!n.pinned).sort((a,b)=>b.updated-a.updated)).slice(0,3);
 const d=typeof YTP!=='undefined'&&YTP&&YTP.getVideoData?YTP.getVideoData():null,np=d&&d.video_id;
 const nw=newsCache('ai'),top=nw&&nw.items.find(x=>x.img);
 const rates=fxCache(),usd=rates&&rates.rates.USD?(1/rates.rates.USD):null;
 const C=2*Math.PI*36,off=C*(1-Math.min(1,fm/goal));
 return `<section class="hero"><div class="px">
  <div class="hdate"><b>●</b>${new Date().toLocaleDateString('en-IN',{weekday:'short'})} · ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'})} · ${esc((S.wx&&S.wx.place)||S.settings.city.name.split(',')[0])}</div>
  <div class="bigclock" id="bigClock" aria-label="Current time">${heroClock()}</div>
  <h1 class="greet">${greetWord()}, <i>Aarav.</i></h1><p class="ctx" id="ctx">${ctxLine()}</p>
  <div class="chips"><a href="#focus" class="hchip lg tap"><b>${fm}m</b> focused</a><a href="#goals" class="hchip lg tap"><b>${dn}/${td.length}</b> goals</a><a href="#habits" class="hchip lg tap"><b>${hd}/${S.habits.length}</b> habits</a></div></div>
  <div class="scrollcue" aria-hidden="true"></div></section>
 <div class="bento">
  <section class="glass lens wxcard s2 d4 dr2 rv" id="wxcard">${wxInner()}</section>
  <section class="glass bt s2 d2 dr2 rv"><div class="row between"><div class="kicker">Today</div><a class="more-link tap" href="#cal">Calendar ${ic('chevR')}</a></div>
   ${up.length?up.map(b=>`<div class="listrow"><span class="time" style="color:${COLORS[b.color]}">${b.allDay?'All day':b.start}</span><span class="grow ell">${esc(b.title)}</span>${!b.allDay&&b.start<=hm?'<span class="chip a">Now</span>':''}</div>`).join(''):EMPTY('○','Wide open.','Nothing on the calendar. Claim an hour for something that matters.',`<a class="btn sm tap" href="#cal">${ic('plus')} Add event</a>`)}</section>
  <a href="#focus" class="glass bt d2 rv tap" style="justify-content:space-between"><div class="kicker">Focus</div><div class="row" style="flex-wrap:nowrap;gap:12px"><svg class="ring2" viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 42 42)"/></svg><div><div class="bignum">${fm}<small>m</small></div><div class="small muted">of ${goal}m today</div></div></div><span class="small acc" style="margin-top:12px">${S.timer?'Session running →':'Start a session →'}</span></a>
  <a href="#habits" class="glass bt d2 rv tap"><div class="kicker">Habits</div>${S.habits.length?`<div class="bignum">${hd}<small>/${S.habits.length}</small></div><div class="small muted" style="margin-bottom:12px">done today</div><div class="dots7">${d7.map(x=>`<i class="${x?'on':''}"></i>`).join('')}</div>`:EMPTY('♡','Tiny wins.','Build a streak, one day at a time.')}</a>
  <section class="glass bt s2 d2 rv" style="position:relative">${np?`<div class="mglow" style="background-image:url(https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg)"></div><div class="kicker">Now playing</div><div class="row" style="flex-wrap:nowrap;gap:14px;margin-top:auto"><img src="https://i.ytimg.com/vi/${d.video_id}/mqdefault.jpg" alt="" style="width:88px;height:88px;border-radius:18px;object-fit:cover;box-shadow:0 14px 30px -12px rgba(0,0,0,.8)"><div style="min-width:0"><b class="ell" style="display:block;font-size:16px">${esc(d.title)}</b><span class="small muted ell" style="display:block">${esc(d.author||'')}</span><a class="btn sm tap" href="#music" style="margin-top:10px">Open</a></div></div>`:`<div class="kicker">Music</div>${EMPTY('♪','Silence is golden.','But a good playlist is platinum.',`<a class="btn sm pri tap" href="#music">${IC.play} Play Aarav\u2019s mix</a>`)}`}</section>
  <a class="glass bt s2 d4 rv tap" href="#news" style="min-height:240px"><div class="row between"><div class="kicker">AI today</div><span class="more-link">All news ${ic('chevR')}</span></div>${top?`<div class="nhero"><img src="${esc(top.img)}" alt="" loading="lazy" onerror="this.remove()"><div class="sh"></div><div class="tx"><span class="nsrc" style="color:#fff">${esc(top.src)}</span><div style="margin-top:6px">${esc(top.title)}</div></div></div>`:EMPTY('✦','Fresh stories brewing.','Open News to pull the latest from AI, games and film.')}</a>
  <section class="glass bt d2 rv"><div class="row between"><div class="kicker">Goals</div><a class="more-link tap" href="#goals">All ${ic('chevR')}</a></div>${td.length?td.slice(0,4).map(x=>`<div class="listrow"><span class="grow ell" style="${x.done?'color:var(--tx3);text-decoration:line-through':''}">${esc(x.text)}</span>${x.done?'<span class="acc">✓</span>':''}</div>`).join(''):EMPTY('✓','A clean slate.','Tap + and add one thing that makes today a win.')}</section>
  <section class="glass bt d3 rv"><div class="row between"><div class="kicker">Notes</div><a class="more-link tap" href="#notes">All ${ic('chevR')}</a></div>${pins.length?pins.map(n=>`<div class="listrow"><span class="grow ell">${n.pinned?'<span class="acc">● </span>':''}${esc(n.text.split('\n')[0])}</span></div>`).join(''):EMPTY('✎','Your second brain is empty.','Capture a thought before it flies away.')}</section>
  <a href="#tools" class="glass bt s2 d3 rv tap"><div class="row between"><div class="kicker">Tools</div><span class="more-link">Open ${ic('chevR')}</span></div>
   <div class="toolrow"><div><div class="bignum" style="font-size:34px">${usd?'₹'+usd.toFixed(2):'₹—'}</div><div class="small muted">1 USD</div></div>${(S.clocks||[]).slice(1,3).map(c=>`<div><div class="bignum" style="font-size:34px" data-tz="${esc(c.tz)}">${tzTime(c.tz)}</div><div class="small muted">${esc(c.name)}</div></div>`).join('')}</div></a>
 </div>`};
V.home.after=()=>{loadWeather();const r=document.getElementById('wxRetry');if(r)r.onclick=()=>{S.wxErr=false;$('#wxcard').innerHTML=wxInner();loadWeather(true)};if(!fxCache()||Date.now()-fxCache().at>6*36e5)loadFx().then(()=>{});const n=newsCache('ai');if(!n||Date.now()-n.at>30*6e4)loadNews('ai').then(ok=>{if(ok&&location.hash.replace('#','')in{'':1,home:1}&&!newsCache.homeDone){newsCache.homeDone=1}})};
document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('#wxRetry');if(r){S.wxErr=false;$('#wxcard').innerHTML=wxInner();loadWeather(true)}});
setInterval(()=>{const c=document.getElementById('bigClock');if(c){const f=fmtHM(new Date());const s=document.getElementById('hss');if(s)s.textContent=f.s;const hh=c.querySelector('.hh');if(hh.textContent!==f.h||!c.querySelector('.mm').textContent.startsWith(f.m))c.innerHTML=heroClock()}
 const b=document.getElementById('barClock');if(b){const f=fmtHM(new Date());b.textContent=f.h+':'+f.m}
 document.querySelectorAll('[data-tz]').forEach(e=>e.textContent=tzTime(e.dataset.tz))},1000);
function toggleHabit(id,d){const l=S.habitLog[d]||(S.habitLog[d]={});if(l[id])delete l[id];else l[id]=true;save()}
// ---------- GENERIC SHEET ----------
const gs=document.createElement('div');gs.className='sheet lg pillglass';gs.id='gsheet';gs.setAttribute('role','dialog');document.body.appendChild(gs);
function openSheet(html,mount){gs.innerHTML=html;gs.classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('qc');mount&&mount(gs);FX.refresh()}
function closeSheets(){gs.classList.remove('on');$('#sheet').classList.remove('on');$('#scrim').classList.remove('on');document.body.classList.remove('qc')}
// ---------- CALENDAR ----------
let calY,calM,calSel,calDir='';
const ymd=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
function monthGrid(){const first=new Date(calY,calM,1),start=first.getDay(),days=new Date(calY,calM+1,0).getDate(),t=today();let cells='';
 for(let i=0;i<42;i++){const dt=new Date(calY,calM,1-start+i),k=ymd(dt.getFullYear(),dt.getMonth(),dt.getDate()),out=dt.getMonth()!==calM;const ev=blocksFor(k);
  cells+=`<button class="cd tap ${out?'out':''} ${k===t?'today':''} ${k===calSel?'sel':''}" data-d="${k}" aria-label="${k}${ev.length?', '+ev.length+' events':''}"><b>${dt.getDate()}</b><span class="ds">${ev.slice(0,3).map(e=>`<i style="background:${COLORS[e.color]}"></i>`).join('')}</span></button>`;
  if(i===34&&new Date(calY,calM,1-start+35).getMonth()!==calM&&start+days<=35)break}
 return `<div class="mgrid ${calDir}" id="mgrid">${cells}</div>`}
function agendaHTML(){const bl=blocksFor(calSel),t=today(),hm=nowHM(),isT=calSel===t;const dt=new Date(calSel+'T12:00');
 return `<div class="row between"><div><div class="kicker">${isT?'Today':dt.toLocaleDateString('en-IN',{weekday:'long'})}</div><h2 class="ed" style="font-size:34px;font-weight:400">${dt.toLocaleDateString('en-IN',{day:'numeric',month:'long'})}</h2></div><button class="btn pri tap" id="evAdd">${ic('plus')} Event</button></div>
 <div class="agenda" style="margin-top:8px">${bl.length?bl.map(b=>`<div class="ev tap ${isT&&!b.allDay&&b.end<=hm?'past':''} ${isT&&!b.allDay&&b.start<=hm&&b.end>hm?'now':''}" style="--c:${COLORS[b.color]}" data-ev="${b.id}" role="button" tabindex="0"><span class="time">${b.allDay?'All day':b.start+'–'+b.end}</span><span class="tt">${esc(b.title)}</span>${b.remind?'<span class="chip">⏰</span>':''}</div>`).join(''):EMPTY('○',isT?'Nothing planned.':'A blank day.','Tap Event to block time for what matters.')}</div>`}
V.cal=()=>{const t=today();if(calY==null){const d=new Date();calY=d.getFullYear();calM=d.getMonth();calSel=t}
 const mn=new Date(calY,calM,1).toLocaleDateString('en-IN',{month:'long'});
 return `<section class="phead"><div class="calhead"><div><div class="kicker">Calendar</div><div class="ptitle" id="calTitle">${mn}</div><div class="yr">${calY}</div></div>
 <div class="row"><button class="iconbtn tap" id="cPrev" aria-label="Previous month">${ic('chevL')}</button><button class="btn sm tap" id="cToday">Today</button><button class="iconbtn tap" id="cNext" aria-label="Next month">${ic('chevR')}</button></div></div></section>
 <section class="glass card rv"><div class="wk">${['S','M','T','W','T','F','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="mwrap" id="mwrap">${monthGrid()}</div></section>
 <section class="glass card rv" id="agenda">${agendaHTML()}</section>`};
function calRefresh(dir){calDir=dir||'';const mn=new Date(calY,calM,1).toLocaleDateString('en-IN',{month:'long'});$('#calTitle').textContent=mn;$('.calhead .yr').textContent=calY;$('#mwrap').innerHTML=monthGrid();$('#agenda').innerHTML=agendaHTML();bindCal();FX.refresh()}
function shiftMonth(n){calM+=n;if(calM<0){calM=11;calY--}if(calM>11){calM=0;calY++}const t=today();calSel=t.slice(0,7)===ymd(calY,calM,1).slice(0,7)?t:ymd(calY,calM,1);calRefresh(n>0?'fromR':'fromL')}
function bindCal(){document.querySelectorAll('.cd').forEach(b=>b.onclick=()=>{const k=b.dataset.d;const [y,m]=k.split('-').map(Number);if(m-1!==calM||y!==calY){calY=y;calM=m-1;calSel=k;calRefresh(k>ymd(calY,calM,1)?'':'')}else{calSel=k;document.querySelectorAll('.cd.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');$('#agenda').innerHTML=agendaHTML();bindAgenda()}});bindAgenda()}
function bindAgenda(){$('#evAdd').onclick=()=>evSheet();document.querySelectorAll('[data-ev]').forEach(e=>e.onclick=()=>evSheet(S.blocks.find(b=>b.id===e.dataset.ev)))}
V.cal.after=()=>{$('#cPrev').onclick=()=>shiftMonth(-1);$('#cNext').onclick=()=>shiftMonth(1);$('#cToday').onclick=()=>{const d=new Date();const dir=(d.getFullYear()*12+d.getMonth())>(calY*12+calM)?'fromR':'fromL';calY=d.getFullYear();calM=d.getMonth();calSel=today();calRefresh(dir)};bindCal();
 let sx=null;const w=$('#mwrap');w.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});w.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60)shiftMonth(dx<0?1:-1);sx=null},{passive:true})};
function evSheet(ev){const e=ev||{title:'',allDay:false,start:'',end:'',color:'ember',remind:false};
 if(!ev){const bl=blocksFor(calSel).filter(b=>!b.allDay),last=bl[bl.length-1];const st=last?last.end:(calSel===today()?String(Math.min(23,new Date().getHours()+1)).padStart(2,'0')+':00':'09:00');e.start=st;const [H,M]=st.split(':').map(Number);e.end=String(Math.min(23,H+1)).padStart(2,'0')+':'+(H>=23?'59':String(M).padStart(2,'0'))}
 openSheet(`<div class="row between" style="margin-bottom:14px"><h2>${ev?'Edit event':'New event'}</h2><span class="chip">${new Date(calSel+'T12:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span></div>
 <form id="evF" style="display:grid;gap:12px"><input type="text" id="evT" placeholder="Title" maxlength="100" value="${esc(e.title)}" required>
 <label class="toggle"><input type="checkbox" id="evAll" ${e.allDay?'checked':''}> All day</label>
 <div class="row" id="evTimes" style="flex-wrap:nowrap;${e.allDay?'display:none':''}"><label class="f" style="flex:1">Starts<input type="time" id="evS" value="${e.start||''}"></label><label class="f" style="flex:1">Ends<input type="time" id="evE" value="${e.end||''}"></label></div>
 <div class="swatches" role="radiogroup" aria-label="Color">${Object.entries(COLORS).map(([k,c])=>`<button type="button" class="sw tap ${e.color===k?'on':''}" style="--c:${c}" data-c="${k}" aria-label="${k}"></button>`).join('')}</div>
 <label class="toggle" id="evRemL" style="${e.allDay?'display:none':''}"><input type="checkbox" id="evR" ${e.remind?'checked':''}> Remind me ${S.settings.remindMin} min before</label>
 <div class="row between" style="margin-top:6px">${ev?'<button type="button" class="btn danger tap" id="evDel">Delete</button>':'<span></span>'}<div class="row"><button type="button" class="btn ghost tap" id="evX">Cancel</button><button class="btn pri tap">Save</button></div></div></form>`,g=>{
  let col=e.color;g.querySelectorAll('.sw').forEach(s=>s.onclick=()=>{col=s.dataset.c;g.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===s))});
  $('#evAll').onchange=x=>{$('#evTimes').style.display=x.target.checked?'none':'';$('#evRemL').style.display=x.target.checked?'none':''};
  $('#evX').onclick=closeSheets;const dl=document.getElementById('evDel');if(dl)dl.onclick=()=>{S.blocks=S.blocks.filter(b=>b!==ev);save();closeSheets();calRefresh();toast('Event deleted.')};
  $('#evF').onsubmit=x=>{x.preventDefault();const ti=$('#evT').value.trim(),all=$('#evAll').checked,s=$('#evS').value,en=$('#evE').value;if(!ti)return;
   if(!all&&(!s||!en))return toast('Add a start and end time, or make it all-day.');if(!all&&en<=s)return toast('End time must be after the start.');
   const rem=!all&&$('#evR').checked;const o=ev||{id:uid(),date:calSel};Object.assign(o,{title:ti,allDay:all,start:all?'':s,end:all?'':en,color:col,remind:rem,notified:false});if(!ev)S.blocks.push(o);save();if(rem)askNotify();closeSheets();calRefresh();toast(ev?'Event updated.':'Event added.')};
  setTimeout(()=>{if(!ev)$('#evT').focus()},350)})}
// ---------- NEWS ----------
const FEEDS={ai:{n:'AI',f:['https://www.theverge.com/rss/ai-artificial-intelligence/index.xml','https://techcrunch.com/category/artificial-intelligence/feed/']},games:{n:'Games',f:['https://www.polygon.com/rss/index.xml','https://www.gamespot.com/feeds/game-news/']},movies:{n:'Movies',f:['https://variety.com/v/film/feed/','https://collider.com/feed/']}};
const NKEY='aaravhq:news';
function newsCache(c){try{return (JSON.parse(localStorage.getItem(NKEY)||'{}'))[c]||null}catch(e){return null}}
function newsSave(c,v){let o={};try{o=JSON.parse(localStorage.getItem(NKEY)||'{}')}catch(e){}o[c]=v;try{localStorage.setItem(NKEY,JSON.stringify(o))}catch(e){}}
const txt=h=>{const d=new DOMParser().parseFromString(h||'','text/html');return (d.body.textContent||'').trim()};
const firstImg=h=>{const m=(h||'').match(/<img[^>]+src=["']([^"']+)["']/i);return m?m[1]:''};
const SRCN={'theverge.com':'The Verge','techcrunch.com':'TechCrunch','polygon.com':'Polygon','gamespot.com':'GameSpot','variety.com':'Variety','collider.com':'Collider'};
const srcOf=u=>{try{const h=new URL(u).hostname.replace(/^www\./,'');return SRCN[h]||h}catch(e){return ''}};
async function viaRss2json(f){const r=await fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(f));if(!r.ok)throw 0;const j=await r.json();if(j.status!=='ok')throw 0;
 return j.items.map(i=>({title:txt(i.title),link:i.link,date:i.pubDate?Date.parse(i.pubDate.replace(' ','T')+'Z'):0,img:i.thumbnail||(i.enclosure&&(i.enclosure.link||i.enclosure.thumbnail))||firstImg(i.content)||firstImg(i.description),src:srcOf(i.link)}))}
async function viaProxy(f){const r=await fetch('https://api.allorigins.win/raw?url='+encodeURIComponent(f));if(!r.ok)throw 0;const x=new DOMParser().parseFromString(await r.text(),'text/xml');
 return [...x.querySelectorAll('item,entry')].slice(0,15).map(it=>{const g=s=>{const e=it.getElementsByTagName(s)[0];return e?e.textContent:''};const ln=g('link')||(it.querySelector('link')&&it.querySelector('link').getAttribute('href'));const med=it.getElementsByTagName('media:content')[0]||it.getElementsByTagName('media:thumbnail')[0]||it.getElementsByTagName('enclosure')[0];
  return{title:txt(g('title')),link:ln,date:Date.parse(g('pubDate')||g('published')||g('updated'))||0,img:(med&&(med.getAttribute('url')))||firstImg(g('content:encoded')||g('description')||g('content')),src:srcOf(ln)}})}
let newsBusy={};
async function loadNews(c){if(newsBusy[c])return newsBusy[c];return newsBusy[c]=(async()=>{const res=await Promise.all(FEEDS[c].f.map(f=>viaRss2json(f).catch(()=>viaProxy(f)).catch(()=>[])));
 const seen=new Set(),items=res.flat().filter(i=>i.title&&i.link&&!seen.has(i.link)&&seen.add(i.link)).sort((a,b)=>b.date-a.date).slice(0,18);newsBusy[c]=null;
 if(items.length){newsSave(c,{items,at:Date.now()});return true}return false})()}
const ago=t=>{if(!t)return '';const m=Math.round((Date.now()-t)/6e4);return m<1?'just now':m<60?m+'m ago':m<1440?Math.round(m/60)+'h ago':Math.round(m/1440)+'d ago'};
let newsCat='ai',newsErr=false;
function newsBody(){const n=newsCache(newsCat);if(!n)return newsErr?EMPTY('⌁','The newsroom is quiet.','Couldn\u2019t reach the feeds right now. Check your connection and try again.',`<button class="btn sm tap" id="nRetry">${ic('refresh')} Retry</button>`):`<div class="newsgrid"><div class="skel" style="height:420px;grid-column:1/-1"></div>${'<div class="skel" style="height:260px"></div>'.repeat(3)}</div>`;
 const fi=Math.max(0,n.items.findIndex(x=>x.img));const f=n.items[fi],rest=n.items.filter((_,k)=>k!==fi);const card=(i,k)=>`<a class="glass ncard rv tap" href="${esc(i.link)}" target="_blank" rel="noopener"><div class="im">${i.img?`<img src="${esc(i.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<div class="ph" style="z-index:-1">✦</div></div><div class="bd"><span class="nsrc">${esc(i.src)}</span><h4>${esc(i.title)}</h4><div class="nm"><span>${ago(i.date)}</span><span>↗</span></div></div></a>`;
 return `${newsErr?`<div class="tile small" style="padding:10px 14px;margin-bottom:12px">You\u2019re seeing stories saved ${ago(n.at)}. We\u2019ll refresh when you\u2019re back online.</div>`:''}
 <a class="nfeat rv tap" href="${esc(f.link)}" target="_blank" rel="noopener">${f.img?`<img src="${esc(f.img)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<div class="sh"></div><div class="tx"><span class="nsrc">${esc(f.src)} · ${ago(f.date)}</span><h3>${esc(f.title)}</h3></div></a>
 <div class="newsgrid" style="margin-top:14px">${rest.map(card).join('')}</div><p class="small muted" style="text-align:center;margin:18px 0 0">Updated ${ago(n.at)} · via ${[...new Set(n.items.map(i=>i.src))].join(', ')}</p>`}
V.news=()=>`<section class="phead"><div class="row between" style="align-items:flex-end"><div><div class="kicker">The Feed</div><div class="ptitle">News<i>.</i></div></div><button class="iconbtn tap" id="nRef" aria-label="Refresh">${ic('refresh')}</button></div>
 <div class="seg" id="nSeg" style="margin-top:14px">${Object.entries(FEEDS).map(([k,v])=>`<button data-c="${k}" class="${k===newsCat?'on':''}">${v.n}</button>`).join('')}</div></section>
 <section id="nBody">${newsBody()}</section>`;
async function newsFetch(force){const c=newsCat,n=newsCache(c);if(!force&&n&&Date.now()-n.at<20*6e4)return;const ok=await loadNews(c);newsErr=!ok;if(newsCat===c&&location.hash==='#news'){$('#nBody').innerHTML=newsBody();bindNews();FX.refresh()}}
function bindNews(){const r=document.getElementById('nRetry');if(r)r.onclick=()=>{newsErr=false;$('#nBody').innerHTML=newsBody();newsFetch(true)}}
V.news.after=()=>{document.querySelectorAll('#nSeg button').forEach(b=>b.onclick=()=>{newsCat=b.dataset.c;newsErr=false;document.querySelectorAll('#nSeg button').forEach(x=>x.classList.toggle('on',x===b));FX.seg();$('#nBody').innerHTML=newsBody();bindNews();FX.refresh();newsFetch()});
 $('#nRef').onclick=e=>{e.currentTarget.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:700,easing:'cubic-bezier(.34,1.45,.5,1)'});newsFetch(true)};bindNews();newsFetch()};
// ---------- TOOLS: currency ----------
const FXKEY='aaravhq:fx';
const fxCache=()=>{try{return JSON.parse(localStorage.getItem(FXKEY)||'null')}catch(e){return null}};
async function loadFx(){try{const r=await fetch('https://open.er-api.com/v6/latest/INR');const j=await r.json();if(j.result!=='success')throw 0;localStorage.setItem(FXKEY,JSON.stringify({rates:j.rates,at:Date.now(),upd:j.time_last_update_unix*1000}));return true}
 catch(e){try{const r=await fetch('https://api.frankfurter.app/latest?from=INR');const j=await r.json();j.rates.INR=1;localStorage.setItem(FXKEY,JSON.stringify({rates:j.rates,at:Date.now(),upd:Date.parse(j.date)}));return true}catch(e2){return false}}}
let fxNames;try{fxNames=new Intl.DisplayNames(['en'],{type:'currency'})}catch(e){fxNames=null}
const cname=c=>{try{return fxNames?fxNames.of(c):c}catch(e){return c}};
const POP=['USD','EUR','GBP','AED','JPY','SGD','CAD','AUD','CNY'];
function fxConvert(a,f,t){const r=fxCache();if(!r||!r.rates[f]||!r.rates[t])return null;return a/r.rates[f]*r.rates[t]}
const fmtN=(n,c)=>{try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:c,maximumFractionDigits:n<1?4:2}).format(n)}catch(e){return n.toFixed(2)+' '+c}};
if(!S.fx)S.fx={amt:1000,from:'INR',to:'USD'};
V.convert=()=>{const r=fxCache(),codes=r?Object.keys(r.rates).sort():['INR','USD'];const opt=sel=>codes.map(c=>`<option value="${c}" ${c===sel?'selected':''}>${c}</option>`).join('');
 return `<section class="phead"><div class="kicker">Tools</div><div class="ptitle">Currency<i>.</i></div></section>
 <section class="glass card lens rv"><label class="f">Amount<input class="fxamt" type="text" inputmode="decimal" id="fxA" value="${S.fx.amt}"></label>
 <div class="fxrow" style="margin-top:14px"><label class="f">From<select id="fxF">${opt(S.fx.from)}</select><span class="fxn" id="fxFn"></span></label><button class="swap lg tap" id="fxS" aria-label="Swap currencies">${ic('swap')}</button><label class="f">To<select id="fxT">${opt(S.fx.to)}</select><span class="fxn" id="fxTn"></span></label></div>
 <div style="margin-top:22px"><div class="small muted" id="fxL"></div><div class="fxres" id="fxR">—</div><div class="small muted" id="fxU" style="margin-top:8px"></div></div></section>
 <section class="glass card rv"><div class="kicker">Against the rupee</div><div class="rates" id="fxRates"></div></section>`};
function fxDraw(){const a=parseFloat(String($('#fxA').value).replace(/[, ]/g,''))||0,f=$('#fxF').value,t=$('#fxT').value;S.fx={amt:a,from:f,to:t};save();const v=fxConvert(a,f,t),r=fxCache();
 $('#fxL').textContent=`${fmtN(a,f)} =`;$('#fxFn').textContent=cname(f);$('#fxTn').textContent=cname(t);$('#fxR').textContent=v==null?'Rates unavailable':fmtN(v,t);
 $('#fxU').textContent=r?`1 ${f} = ${(fxConvert(1,f,t)||0).toPrecision(5)} ${t} · rates from ${new Date(r.upd||r.at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}${Date.now()-r.at>864e5?' (saved)':''}`:'Connect once to download rates; they\u2019ll be saved for offline use.';
 $('#fxRates').innerHTML=r?POP.filter(c=>r.rates[c]).map(c=>`<div class="rate tap" data-c="${c}"><b>₹${(1/r.rates[c]).toLocaleString('en-IN',{maximumFractionDigits:c==='JPY'?3:2})}</b><span>1 ${c} · ${esc(cname(c))}</span></div>`).join(''):EMPTY('₹','No rates yet.','We\u2019ll fetch them as soon as you\u2019re online.');
 document.querySelectorAll('.rate').forEach(e=>e.onclick=()=>{$('#fxF').value=e.dataset.c;$('#fxT').value='INR';fxDraw()})}
V.convert.after=()=>{fxDraw();['input','change'].forEach(ev=>{$('#fxA').addEventListener(ev,fxDraw);$('#fxF').addEventListener(ev,fxDraw);$('#fxT').addEventListener(ev,fxDraw)});
 $('#fxS').onclick=e=>{const b=e.currentTarget;b.classList.toggle('spin');const f=$('#fxF').value;$('#fxF').value=$('#fxT').value;$('#fxT').value=f;fxDraw()};
 const r=fxCache();if(!r||Date.now()-r.at>6*36e5)loadFx().then(ok=>{if(location.hash==='#convert'){if(ok&&!r)render();else fxDraw()}})};
// ---------- TOOLS: world clock ----------
if(!S.clocks)S.clocks=[{tz:'Asia/Kolkata',name:'New Delhi'},{tz:'America/New_York',name:'New York'},{tz:'Europe/London',name:'London'},{tz:'Asia/Tokyo',name:'Tokyo'}];
const tzParts=tz=>{const p={};new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,weekday:'short'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);p.hour=String(+p.hour%24).padStart(2,'0');return p};
const tzTime=tz=>{try{const p=tzParts(tz);return p.hour+':'+p.minute}catch(e){return '--:--'}};
function tzOffset(tz){const n=new Date(),a=new Date(n.toLocaleString('en-US',{timeZone:tz})),b=new Date(n.toLocaleString('en-US'));const h=Math.round((a-b)/36e5*2)/2;return h===0?'Same time':(h>0?'+':'')+h+'h'}
let ZONES=[];try{ZONES=Intl.supportedValuesOf('timeZone')}catch(e){ZONES=['Asia/Kolkata','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Asia/Shanghai','Europe/London','Europe/Paris','Europe/Berlin','America/New_York','America/Los_Angeles','America/Chicago','America/Toronto','Australia/Sydney','Pacific/Auckland','Africa/Johannesburg','America/Sao_Paulo']}
const tzName=z=>z.split('/').pop().replace(/_/g,' ');
V.clocks=()=>`<section class="phead"><div class="row between" style="align-items:flex-end"><div><div class="kicker">Tools</div><div class="ptitle">World<i>.</i></div></div><div class="seg" id="wcSeg"><button data-f="analog" class="${S.settings.face!=='digital'?'on':''}">Analog</button><button data-f="digital" class="${S.settings.face==='digital'?'on':''}">Digital</button></div></div></section>
 <section class="clocks">${S.clocks.map((c,i)=>`<div class="glass wc rv">${i?`<button class="x tap" data-rm="${i}" aria-label="Remove ${esc(c.name)}">✕</button>`:''}${S.settings.face!=='digital'?`<div class="face" data-face="${esc(c.tz)}"><i class="tk"></i><i class="h"></i><i class="m"></i><i class="s"></i><i class="pin"></i></div>`:''}<div class="dg" data-tz="${esc(c.tz)}">${tzTime(c.tz)}</div><div class="ct">${esc(c.name)}</div><div class="of">${i===0?'Home':tzOffset(c.tz)}</div></div>`).join('')}</section>
 <section class="glass card rv"><h2 style="margin-bottom:12px">Add a city</h2><form id="wcF" class="row" style="flex-wrap:nowrap"><input type="text" id="wcI" list="tzl" placeholder="Search a city or time zone (e.g. Paris)" autocomplete="off"><datalist id="tzl">${ZONES.map(z=>`<option value="${esc(tzName(z))} — ${esc(z)}">`).join('')}</datalist><button class="btn pri tap" style="flex:none">Add</button></form></section>`;
function drawFaces(){document.querySelectorAll('[data-face]').forEach(f=>{const p=tzParts(f.dataset.face),h=+p.hour,m=+p.minute,s=+p.second;f.classList.toggle('night',h<6||h>=19);
 f.querySelector('.h').style.transform=`rotate(${(h%12)*30+m*.5}deg)`;f.querySelector('.m').style.transform=`rotate(${m*6+s*.1}deg)`;const se=f.querySelector('.s');se.style.transition=s===0?'none':'';se.style.transform=`rotate(${s*6}deg)`})}
setInterval(drawFaces,1000);
V.clocks.after=()=>{drawFaces();document.querySelectorAll('#wcSeg button').forEach(b=>b.onclick=()=>{S.settings.face=b.dataset.f;save();render()});
 document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{S.clocks.splice(+b.dataset.rm,1);save();render()});
 $('#wcF').onsubmit=e=>{e.preventDefault();const v=$('#wcI').value.trim();if(!v)return;const m=v.match(/—\s*(.+)$/);let z=m?m[1].trim():ZONES.find(x=>x.toLowerCase()===v.toLowerCase())||ZONES.find(x=>tzName(x).toLowerCase()===v.toLowerCase())||ZONES.find(x=>tzName(x).toLowerCase().startsWith(v.toLowerCase()));
  if(!z)return toast('Couldn\u2019t find that city. Try a nearby major city.');if(S.clocks.some(c=>c.tz===z))return toast('That city is already here.');S.clocks.push({tz:z,name:tzName(z)});save();render();toast(tzName(z)+' added.')}};
// ---------- TOOLS: calculator ----------
let cx={cur:'0',toks:[],fresh:true,op:null};if(!S.calcHist)S.calcHist=[];
const OPS={'+':1,'−':1,'×':2,'÷':2};
function cEval(t){const out=[],st=[];t.forEach(x=>{if(x in OPS){while(st.length&&OPS[st[st.length-1]]>=OPS[x])out.push(st.pop());st.push(x)}else out.push(+x)});while(st.length)out.push(st.pop());const s=[];
 out.forEach(x=>{if(typeof x==='number')s.push(x);else{const b=s.pop(),a=s.pop();s.push(x==='+'?a+b:x==='−'?a-b:x==='×'?a*b:b===0?NaN:a/b)}});const r=s[0];return isFinite(r)?parseFloat(r.toPrecision(12)):NaN}
const cFmt=s=>{if(s==='Error')return s;if(/e/.test(s))return s;const neg=s.startsWith('-');const [i,d]=s.replace('-','').split('.');return (neg?'−':'')+(+i).toLocaleString('en-IN')+(d!==undefined?'.'+d:'')};
function cDraw(){const rs=$('#cRs');if(!rs)return;const t=cFmt(cx.cur);rs.textContent=t;rs.style.fontSize=t.length>12?'40px':t.length>9?'52px':'';$('#cEx').textContent=cx.toks.map(x=>x in OPS?' '+x+' ':cFmt(x)).join('');
 document.querySelectorAll('.key.op').forEach(k=>k.classList.toggle('on',cx.fresh&&cx.op===k.dataset.k&&cx.toks.length>0));$('#cAC').textContent=cx.cur!=='0'&&!cx.fresh?'C':'AC'}
function cKey(k){if(cx.cur==='Error'&&k!=='AC'){cx={cur:'0',toks:[],fresh:true,op:null}}
 if(/^[0-9]$/.test(k)){if(cx.fresh){cx.cur=k;cx.fresh=false}else if(cx.cur.replace(/[-.]/g,'').length<15)cx.cur=cx.cur==='0'?k:cx.cur==='-0'?'-'+k:cx.cur+k;cx.op=null}
 else if(k==='.'){if(cx.fresh){cx.cur='0.';cx.fresh=false}else if(!cx.cur.includes('.'))cx.cur+='.';cx.op=null}
 else if(k in OPS){if(cx.fresh&&cx.op&&cx.toks.length){cx.toks[cx.toks.length-1]=k}else{cx.toks.push(cx.cur,k)}cx.op=k;cx.fresh=true}
 else if(k==='='){if(!cx.toks.length)return;const ex=[...cx.toks,cx.cur];const r=cEval(ex);const e=ex.map(x=>x in OPS?' '+x+' ':cFmt(x)).join('');cx={cur:isNaN(r)?'Error':String(r),toks:[],fresh:true,op:null};if(!isNaN(r)){S.calcHist.unshift({e,r:String(r)});S.calcHist=S.calcHist.slice(0,30);save();cHist()}}
 else if(k==='AC'){if($('#cAC').textContent==='C'){cx.cur='0';cx.fresh=true}else cx={cur:'0',toks:[],fresh:true,op:null}}
 else if(k==='±'){cx.cur=cx.cur.startsWith('-')?cx.cur.slice(1):'-'+cx.cur;if(cx.fresh)cx.fresh=false}
 else if(k==='%'){const base=cx.toks.length>=2&&/[+−]/.test(cx.toks[cx.toks.length-1])?+cx.toks[cx.toks.length-2]:1;cx.cur=String(parseFloat((+cx.cur/100*(base===1?1:base)).toPrecision(12)));cx.fresh=false}
 else if(k==='⌫'){if(!cx.fresh){cx.cur=cx.cur.length>1&&cx.cur!=='-0'?cx.cur.slice(0,-1):'0';if(cx.cur==='-')cx.cur='0'}}
 cDraw()}
function cHist(){const h=$('#cHist');if(!h)return;h.innerHTML=S.calcHist.length?S.calcHist.map((x,i)=>`<div class="listrow tap" data-i="${i}"><span class="grow ell muted">${esc(x.e)} =</span><span>${esc(cFmt(x.r))}</span></div>`).join(''):`<p class="muted small" style="margin:0">Your calculations will appear here.</p>`;
 h.querySelectorAll('[data-i]').forEach(r=>r.onclick=()=>{cx={cur:S.calcHist[+r.dataset.i].r,toks:[],fresh:false,op:null};cDraw()})}
V.calc=()=>{const K=[['AC','fn','cAC'],['±','fn'],['%','fn'],['÷','op'],['7'],['8'],['9'],['×','op'],['4'],['5'],['6'],['−','op'],['1'],['2'],['3'],['+','op'],['0','zero'],['.'],['=','op']];
 return `<section class="phead"><div class="kicker">Tools</div><div class="ptitle">Calculate<i>.</i></div></section>
 <div class="grid2"><section class="glass card calc rv"><div class="cdisp" id="cDisp" title="Swipe or tap to delete a digit"><div class="ex" id="cEx"></div><div class="rs" id="cRs">0</div></div>
 <div class="keys">${K.map(([k,c,id])=>`<button class="key tap ${c||''}" data-k="${k}" ${id?`id="${id}"`:''}>${k}</button>`).join('')}</div></section>
 <section class="glass card rv hist"><div class="row between"><div class="kicker">History</div><button class="btn sm ghost tap" id="cClr">Clear</button></div><div id="cHist"></div></section></div>`};
V.calc.after=()=>{document.querySelectorAll('.key').forEach(b=>b.onclick=()=>cKey(b.dataset.k));$('#cDisp').onclick=()=>cKey('⌫');$('#cClr').onclick=()=>{S.calcHist=[];save();cHist()};cDraw();cHist()};
document.addEventListener('keydown',e=>{if(location.hash!=='#calc'||e.target.matches('input,textarea'))return;const m={'*':'×','x':'×','/':'÷','-':'−','+':'+','Enter':'=','=':'=','Backspace':'⌫','Escape':'AC','%':'%','.':'.',',':'.'};const k=/^[0-9]$/.test(e.key)?e.key:m[e.key];if(k){e.preventDefault();cKey(k);const b=document.querySelector(`.key[data-k="${k}"]`);if(b){b.classList.add('pressed');b.animate([{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:350,easing:'cubic-bezier(.34,1.45,.5,1)'})}}});
V.tools=()=>`<section class="phead"><div class="kicker">Utilities</div><div class="ptitle">Tools<i>.</i></div></section>
 <section class="menu">${[['convert','fx','Currency','Live rates vs ₹'],['clocks','clock','World clock',S.clocks.length+' cities'],['calc','calc','Calculator',S.calcHist.length+' in history']].map(([h,i,n,s])=>`<a href="#${h}" class="glass mtile rv tap"><span class="mi">${ic(i)}</span><div><b>${n}</b><span>${s}</span></div></a>`).join('')}</section>`;
// ---------- MORE ----------
V.more=()=>`<section class="phead"><div class="kicker">Everything else</div><div class="ptitle">More<i>.</i></div></section>
 <section class="menu">${[['focus','focus','Focus',S.timer?'Running now':(S.focus[today()]||0)+' min today'],['goals','goals','Goals',S.todos.filter(x=>x.date===today()&&!x.done).length+' open'],['notes','notes','Notes',S.notes.length+' notes'],['habits','habits','Habits',S.habits.length+' tracked'],['convert','fx','Currency','Live INR rates'],['clocks','clock','World clock',S.clocks.length+' cities'],['calc','calc','Calculator','With history'],['stats','stats','Stats',streak(focusSet())+'-day streak'],['settings','settings','Settings','Theme, data, location']].map(([h,i,n,s])=>`<a href="#${h}" class="glass mtile rv tap"><span class="mi">${ic(i)}</span><div><b>${n}</b><span>${s}</span></div></a>`).join('')}</section>`;

function askNotify(){if(!('Notification' in window)||Notification.permission!=='default')return Promise.resolve();return Notification.requestPermission().catch(()=>{})}
function notify(title,body){try{if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:title+body}));else new Notification(title,{body,icon:'icons/icon-192.png'})}catch(e){}}
function checkReminders(){if(!('Notification' in window)||Notification.permission!=='granted')return;const t=today(),now=Date.now();let ch=false;
 S.blocks.forEach(b=>{if(b.date!==t||!b.remind||b.notified)return;const at=new Date(`${b.date}T${b.start}:00`).getTime()-S.settings.remindMin*6e4;if(now>=at&&now<at+30*6e4){notify(b.title,`Starts at ${b.start}`);b.notified=true;ch=true}});if(ch)save()}
setInterval(checkReminders,20000);setTimeout(checkReminders,2000);
V.habits=()=>{const t=today(),days=Array.from({length:7},(_,i)=>addDays(t,i-6));
 return `<section class="phead"><div class="kicker">Last 7 days</div><div class="ptitle">Habits<i>.</i></div></section>
 <section class="glass card"><div class="kicker">This week</div>
 <div style="margin-top:16px;overflow-x:auto">${S.habits.length?`<div class="hab head"><span></span>${days.map(d=>`<span>${new Date(d+'T12:00Z').toLocaleDateString('en-IN',{weekday:'narrow',timeZone:'UTC'})}</span>`).join('')}<span>Run</span></div>`+S.habits.map(x=>`<div class="hab"><span class="n ell">${esc(x.name)}</span>${days.map(d=>`<button class="check ${(S.habitLog[d]||{})[x.id]?'on':''}" data-h="${x.id}" data-d="${d}" aria-label="${esc(x.name)} ${d}"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`).join('')}<span class="sk">${habitStreak(x.id)}d</span></div>`).join(''):EMPTY('♡','Small wins, every day.','Add a habit below — drink water, read 20 pages, revise formulas — and watch the streak grow.')}</div></section>
 <section class="glass card"><div class="kicker">Add a habit</div><form id="hForm" class="row" style="flex-wrap:nowrap"><input type="text" id="hName" placeholder="e.g. Revise formulas" maxlength="60"><button class="btn pri" style="flex:none">Add</button></form>
 ${S.habits.length?`<div style="margin-top:12px">${S.habits.map(x=>`<div class="listrow"><span class="grow ell">${esc(x.name)}</span><span class="small muted">best ${bestHabit(x.id)}d</span><button class="x" data-rm="${x.id}" aria-label="Remove">✕</button></div>`).join('')}</div>`:''}</section>`};
function bestHabit(id){return best(new Set(Object.entries(S.habitLog).filter(([,l])=>l[id]).map(([d])=>d)))}
V.habits.after=()=>{$('#hForm').onsubmit=e=>{e.preventDefault();const n=$('#hName').value.trim();if(!n)return;S.habits.push({id:uid(),name:n});save();render()};
 document.querySelectorAll('.hab [data-h]').forEach(b=>b.onclick=()=>{toggleHabit(b.dataset.h,b.dataset.d);b.classList.toggle('on');if(b.classList.contains('on')){b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),500)}const sk=b.parentElement.querySelector('.sk');sk.textContent=habitStreak(b.dataset.h)+'d'});
 document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{if(!confirm('Remove this habit and its history?'))return;const id=b.dataset.rm;S.habits=S.habits.filter(x=>x.id!==id);Object.values(S.habitLog).forEach(l=>delete l[id]);save();render()})};
// ---- NOTES ----
let noteQ='',editId=null;
V.notes=()=>{const q=noteQ.toLowerCase();const list=S.notes.filter(n=>!q||n.text.toLowerCase().includes(q)).sort((a,b)=>(b.pinned-a.pinned)||(b.updated-a.updated));
 return `<section class="phead"><div class="kicker">${S.notes.length} saved</div><div class="ptitle">Notes<i>.</i></div></section>
 <section class="glass card"><div class="kicker">New note</div>
 <form id="nForm" style="margin-top:14px;display:grid;gap:10px"><textarea id="nText" placeholder="Write a quick note…" rows="3"></textarea><div class="row" style="justify-content:flex-end"><button class="btn pri">Save note</button></div></form></section>
 <section class="glass card"><input type="search" id="nQ" placeholder="Search notes" value="${esc(noteQ)}" autocomplete="off"><div id="nList">${list.length?list.map(n=>n.id===editId?`<div class="tile note"><textarea id="eText" rows="4">${esc(n.text)}</textarea><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn sm ghost" id="eCancel">Cancel</button><button class="btn sm pri" id="eSave">Save</button></div></div>`:`<div class="tile note ${n.pinned?'pinned':''}" data-id="${n.id}"><p>${esc(n.text)}</p><div class="meta"><span>${n.pinned?'Pinned · ':''}${new Date(n.updated).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</span><span class="row" style="gap:4px"><button class="btn sm ghost" data-pin>${n.pinned?'Unpin':'Pin'}</button><button class="btn sm ghost" data-edit>Edit</button><button class="x" data-del aria-label="Delete">✕</button></span></div></div>`).join(''):(q?EMPTY('?','No matches.','Nothing found for that search. Try another word.'):EMPTY('✎','Your second brain is empty.','Write down an idea, a formula, a quote — anything worth keeping.'))}</div></section>`};
V.notes.after=()=>{
 $('#nForm').onsubmit=e=>{e.preventDefault();const v=$('#nText').value.trim();if(!v)return;S.notes.push({id:uid(),text:v,pinned:false,created:Date.now(),updated:Date.now()});save();render()};
 const q=$('#nQ');q.oninput=()=>{noteQ=q.value;const p=q.selectionStart;render();const n=$('#nQ');n.focus();n.setSelectionRange(p,p)};
 document.querySelectorAll('.note[data-id]').forEach(el=>{const n=S.notes.find(x=>x.id===el.dataset.id);
  el.querySelector('[data-pin]').onclick=()=>{n.pinned=!n.pinned;save();render()};
  el.querySelector('[data-edit]').onclick=()=>{editId=n.id;render();$('#eText').focus()};
  el.querySelector('[data-del]').onclick=()=>{if(confirm('Delete this note?')){S.notes=S.notes.filter(x=>x!==n);save();render()}}});
 const es=document.getElementById('eSave');if(es){es.onclick=()=>{const n=S.notes.find(x=>x.id===editId),v=$('#eText').value.trim();if(n&&v){n.text=v;n.updated=Date.now();save()}editId=null;render()};$('#eCancel').onclick=()=>{editId=null;render()}}};
// ---- MORE ----
let tick=null,phase='work';
V.focus=()=>{const st=S.settings,w=weekFocus(),mx=Math.max(30,...w.map(x=>x.m)),tot=w.reduce((a,b)=>a+b.m,0);
 return `<section class="phead"><div class="kicker">Deep work</div><div class="ptitle">Focus<i>.</i></div></section>
 <section class="glass card lens"><div class="row" style="justify-content:space-between"><div class="seg" id="seg"><button data-p="work" class="${phase==='work'?'on':''}">Focus</button><button data-p="brk" class="${phase==='brk'?'on':''}">Break</button></div><span class="chip g">${S.sessions} sessions</span></div>
 <div class="timer"><div class="ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="fg" cx="60" cy="60" r="52" stroke-dasharray="326.73" stroke-dashoffset="0"/></svg><div class="t"><div><b id="clock">00:00</b><span>${phase==='work'?'Focus':'Break'}</span></div></div></div></div>
 <div class="row" style="justify-content:center"><button class="btn pri" id="go">Start</button><button class="btn danger" id="quit">Stop</button></div><p id="react" class="small muted" style="text-align:center;margin:12px 0 0"></p></section>
 <div class="grid2"><section class="glass card"><div class="kicker">This week · ${tot} min</div><div class="bars">${w.map(x=>`<div class="${x.d===today()?'today':''}"><span>${x.m}</span><i style="height:${Math.max(3,x.m/mx*80)}px"></i><span>${new Date(x.d).toLocaleDateString('en-IN',{weekday:'short',timeZone:'UTC'})}</span></div>`).join('')}</div><p class="small muted">Today: ${S.focus[today()]||0} min</p></section>
 <section class="glass card"><div class="kicker">Lengths</div><div class="row"><label class="f" style="flex:1">Focus (min)<input type="number" id="lw" min="1" max="180" value="${st.work}"></label><label class="f" style="flex:1">Break (min)<input type="number" id="lb" min="1" max="60" value="${st.brk}"></label></div><div class="row" style="margin-top:12px">${[[25,5],[50,10],[90,15]].map(([a,b])=>`<button class="btn preset tap" data-w="${a}" data-b="${b}">${a}/${b}</button>`).join('')}</div></section></div>`};
function tmLeft(){const T=S.timer;return T?Math.max(0,Math.round((T.end-Date.now())/1000)):(phase==='work'?S.settings.work:S.settings.brk)*60}
function drawClock(){const c=$('#clock');if(!c)return;const l=tmLeft(),tot=S.timer?S.timer.len*60:(phase==='work'?S.settings.work:S.settings.brk)*60;c.textContent=String(Math.floor(l/60)).padStart(2,'0')+':'+String(l%60).padStart(2,'0');$('#fg').style.strokeDashoffset=(326.73*(1-l/tot)).toFixed(2);$('#go').textContent=S.timer?'Running…':'Start'}
function finish(){const T=S.timer;S.timer=null;if(T.phase==='work'){const d=today();S.focus[d]=(S.focus[d]||0)+T.len;S.sessions++;phase='brk';toast(`Session complete: ${T.len} min added.`)}else{phase='work';toast('Break over.')}save();try{navigator.vibrate&&navigator.vibrate([80,60,80])}catch(e){}if(location.hash==='#focus'||location.hash==='#home'||!location.hash)render()}
function loop(){clearInterval(tick);tick=setInterval(()=>{if(S.timer&&Date.now()>=S.timer.end)finish();drawClock()},1000)}
V.focus.after=()=>{if(S.timer)phase=S.timer.phase;drawClock();
 document.querySelectorAll('#seg button').forEach(b=>b.onclick=()=>{if(S.timer)return toast('Stop the current timer first.');phase=b.dataset.p;render()});
 $('#go').onclick=()=>{if(S.timer)return;const len=phase==='work'?S.settings.work:S.settings.brk;S.timer={phase,len,start:Date.now(),end:Date.now()+len*6e4};save();loop();drawClock();$('#react').textContent=phase==='work'?`Focus started: ${len} min.`:`Break: ${len} min.`};
 $('#quit').onclick=()=>{if(!S.timer)return;const T=S.timer,el=Math.floor((Date.now()-T.start)/6e4);S.timer=null;if(T.phase==='work'&&el>0){const d=today();S.focus[d]=(S.focus[d]||0)+el}save();render();$('#react').textContent=T.phase==='work'?`Stopped early. ${el} min logged.`:'Break ended.'};
 const upd=()=>{S.settings.work=Math.min(180,Math.max(1,+$('#lw').value||25));S.settings.brk=Math.min(60,Math.max(1,+$('#lb').value||5));save();drawClock()};
 $('#lw').onchange=upd;$('#lb').onchange=upd;
 document.querySelectorAll('.preset').forEach(b=>b.onclick=()=>{$('#lw').value=b.dataset.w;$('#lb').value=b.dataset.b;upd()})};
V.goals=()=>{const t=today(),td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length;
 return `<section class="phead"><div class="kicker">Today · ${dn}/${td.length} done</div><div class="ptitle">Goals<i>.</i></div></section>
 <section class="glass card"><div class="kicker" id="gk">Add a goal</div>
 <form id="addf" class="row" style="margin-top:16px;flex-wrap:nowrap"><input type="text" id="addt" placeholder="Add a goal for today" maxlength="140" autocomplete="off"><button class="btn pri" style="flex:none">Add</button></form>
 <div id="list">${td.length?td.map(x=>`<div class="todo ${x.done?'done':''}" data-id="${x.id}"><button class="check" aria-label="toggle"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="txt">${esc(x.text)}${x.carried?`<span class="carry">↻ carried ${x.carried}×</span>`:''}</span><button class="x" aria-label="delete">✕</button></div>`).join(''):EMPTY('✓','A clean slate.','What would make today a win? Unfinished goals gently carry over to tomorrow.')}</div></section>`};
function burst(el){const r=el.getBoundingClientRect(),cs=['#ff5b3a','#ff9a5c','#ffd27a','#ffffff','#ff7eb6'];for(let i=0;i<14;i++){const b=document.createElement('i');b.className='burst';const a=Math.PI*2*i/14,d=40+Math.random()*30;b.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;background:${cs[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--r:${Math.random()*360}deg`;document.body.appendChild(b);setTimeout(()=>b.remove(),850)}}
V.goals.after=()=>{
 $('#addf').onsubmit=e=>{e.preventDefault();const v=$('#addt').value.trim();if(!v)return;S.todos.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:v,done:false,date:today()});save();render();$('#addt').focus()};
 document.querySelectorAll('.todo').forEach(el=>{const x=S.todos.find(y=>y.id===el.dataset.id);
  el.querySelector('.check').onclick=e=>{x.done=!x.done;x.doneOn=x.done?today():null;save();el.classList.toggle('done',x.done);if(x.done){el.classList.add('pop');burst(e.currentTarget)}$('#gk').textContent=`Today · ${S.todos.filter(y=>y.date===today()&&y.done).length}/${S.todos.filter(y=>y.date===today()).length} done`};
  el.querySelector('.x').onclick=()=>{S.todos=S.todos.filter(y=>y!==x);save();render()}})};
V.stats=()=>{const fs=focusSet(),t=today(),fm=Object.values(S.focus).reduce((x,y)=>x+y,0),gd=S.todos.filter(x=>x.done).length;
 const lvl=m=>m<=0?0:m<25?1:m<60?2:m<120?3:4;const cells=[];for(let d=addDays(t,-((dnum(t)+4)%7)-7*17);d<=t;d=addDays(d,1))cells.push(`<i class="l${lvl(S.focus[d]||0)}" title="${d}: ${S.focus[d]||0} min"></i>`);
 return `<section class="phead"><div class="kicker">Your rhythm</div><div class="ptitle">Stats<i>.</i></div></section>
 <section class="glass card"><div class="stats">
 <div class="tile stat"><b>${streak(fs)}</b><span>Focus streak · best ${best(fs)}</span></div><div class="tile stat"><b>${(fm/60).toFixed(1)}h</b><span>Total focus</span></div>
 <div class="tile stat"><b>${S.sessions}</b><span>Sessions completed</span></div><div class="tile stat"><b>${gd}</b><span>Goals completed</span></div></div></section>
 <section class="glass card"><div class="kicker">Focus heatmap · 18 weeks</div><div class="heat">${cells.join('')}</div><p class="small muted">Less <i class="hk"></i><i class="hk l1"></i><i class="hk l2"></i><i class="hk l3"></i><i class="hk l4"></i> More (25 / 60 / 120+ min)</p></section>`};
V.settings=()=>`<section class="phead"><div class="kicker">Preferences</div><div class="ptitle">Settings<i>.</i></div></section>
 <section class="glass card"><div class="kicker">Your data</div><p class="muted" style="margin-top:0">Everything lives on this device. Back it up anytime.</p>
 <div class="row" style="margin-top:16px"><button class="btn pri" id="exp">Export JSON</button><label class="btn" style="cursor:pointer">Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn danger" id="rst">Reset everything</button></div></section>
 <section class="glass card"><div class="kicker">Appearance</div><div class="seg" id="thSeg">${['system','light','dark'].map(x=>`<button data-th="${x}" class="${S.settings.theme===x?'on':''}">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div></section>
 <section class="glass card"><div class="kicker">Weather location</div><p class="small muted" style="margin:0 0 10px">Used when location access is unavailable. Current: <b>${esc(S.settings.city.name)}</b></p><form id="cityF" class="row" style="flex-wrap:nowrap"><input type="text" id="cityI" placeholder="City name" value="${esc(S.settings.city.name)}"><button class="btn pri" style="flex:none">Save</button></form></section>
 <section class="glass card"><div class="kicker">Reminders</div><label class="f">Remind before an event (minutes)<input type="number" id="remM" min="0" max="120" value="${S.settings.remindMin}"></label></section>
 <section class="glass card"><div class="kicker">Install</div><p class="muted small" style="line-height:1.6">iPhone: open in Safari → Share → <b>Add to Home Screen</b>.<br>Mac: Safari → File → <b>Add to Dock</b>, or Chrome → install icon in the address bar.<br>Everything except music and live weather works offline after the first load.</p></section>`;
V.settings.after=()=>{
 document.querySelectorAll('#thSeg button').forEach(b=>b.onclick=()=>{S.settings.theme=b.dataset.th;save();applyTheme();render()});
 $('#remM').onchange=e=>{S.settings.remindMin=Math.max(0,Math.min(120,+e.target.value||0));save()};
 $('#cityF').onsubmit=async e=>{e.preventDefault();const n=$('#cityI').value.trim();if(!n)return;try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name='+encodeURIComponent(n));const j=await r.json();const c=j.results&&j.results[0];if(!c)return toast('City not found.');S.settings.city={name:c.name+(c.country?', '+c.country:''),lat:c.latitude,lon:c.longitude};S.wx=null;save();toast('Weather location set to '+S.settings.city.name+'.');render()}catch(err){toast('Couldn\u2019t look up that city. Check your connection.')}};
 $('#exp').onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`aaravhq-${today()}.json`;document.body.appendChild(a);a.click();a.remove();toast('Exported.')};
 $('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(typeof d!=='object'||!d||d.v!==1)throw 0;S=Object.assign(def(),d);S.settings=Object.assign(defSet(),S.settings);save();applyTheme();toast('Imported.');render()}).catch(()=>toast('That file isn\u2019t a valid Aarav HQ backup.'))};
 $('#rst').onclick=()=>{if(confirm('Reset ALL Aarav HQ data? This cannot be undone.')){localStorage.removeItem(KEY);S=def();save();applyTheme();toast('All data reset.');location.hash='#home';render()}}};
// ---- MUSIC ----
const DEF_PL={type:'playlist',id:'PLEeH0PskYedM',title:"Aarav's playlist",def:true,src:'https://music.youtube.com/playlist?list=PLEeH0PskYedM&si=8hRrfRZ36VhHETo9'};
function ensureMusic(){if(!S.music||!Array.isArray(S.music.lib))S.music={lib:[],cur:DEF_PL.id};if(!S.music.lib.some(x=>x.def))S.music.lib.unshift({...DEF_PL})}
ensureMusic();
function parseYT(str){let u;try{u=new URL(str.trim())}catch(e){const m=str.trim();if(/^[\w-]{11}$/.test(m))return{type:'video',id:m};if(/^(PL|RD|OL|UU|FL|LL)[\w-]{8,}$/.test(m))return{type:'playlist',id:m};return null}
 if(!/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(u.hostname))return null;
 const list=u.searchParams.get('list');let v=u.searchParams.get('v');
 if(!v&&u.hostname.endsWith('youtu.be'))v=u.pathname.slice(1).split('/')[0];
 const m=u.pathname.match(/\/(shorts|embed|live|v)\/([\w-]{11})/);if(!v&&m)v=m[2];
 if(v&&/^[\w-]{11}$/.test(v))return{type:'video',id:v,list:list||null};
 if(list&&/^[\w-]+$/.test(list))return{type:'playlist',id:list};return null}
const IC={prev: '<svg viewBox="0 0 24 24" class="gi"><path d="M6 5v14M19 5 9 12l10 7z"/></svg>', next: '<svg viewBox="0 0 24 24" class="gi"><path d="M18 5v14M5 5l10 7-10 7z"/></svg>', play: '<svg viewBox="0 0 24 24" class="gi f"><path d="M7 4.5v15l12.5-7.5z"/></svg>', pause: '<svg viewBox="0 0 24 24" class="gi f"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>'};
const thumb=id=>id?`https://i.ytimg.com/vi/${id}/mqdefault.jpg`:'icons/icon-192.png';
let YTP=null,ytReady=false,ytLoading=false,ytErr='',pendingLoad=null,playing=false;
const ERRS={2:'That link has an invalid ID.',5:'This video can\u2019t play in the embedded player.',100:'That video was removed or made private.',101:'The owner doesn\u2019t allow this video to play outside YouTube.',150:'The owner doesn\u2019t allow this video to play outside YouTube.'};
function friendlyErr(msg){ytErr=msg;const e=document.getElementById('ytErr');if(e){e.innerHTML=errHTML();e.hidden=false}toast('🎧 '+msg.split('.')[0]+'.')}
const errHTML=()=>`${esc(ytErr)}<br><span class="small muted">If it\u2019s the default playlist, its ID (PLEeH0PskYedM) looks shorter than normal, so the link may have been cut off. Paste the full playlist link from YouTube Music (Share → Copy link) below, or pick something else from the library.</span>`;
function loadYTAPI(){if(ytLoading||window.YT&&YT.Player)return;ytLoading=true;window.onYouTubeIframeAPIReady=initYT;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{ytLoading=false;friendlyErr('Couldn\u2019t reach YouTube. Music needs an internet connection.')};document.head.appendChild(s)}
function curItem(){ensureMusic();return S.music.lib.find(x=>x.id===S.music.cur)||S.music.lib[0]}
function initYT(){const it=curItem();const pv={playsinline:1,rel:0,modestbranding:1,origin:location.origin};
 if(it.type==='playlist'){pv.listType='playlist';pv.list=it.id}
 const opt={width:'100%',height:'100%',playerVars:pv};if(it.type==='video')opt.videoId=it.id;
 YTP=new YT.Player('ytPlayer',Object.assign(opt,{
  events:{onReady:()=>{ytReady=true;if(pendingLoad){const p=pendingLoad;pendingLoad=null;playItem(p,true)}else checkPlaylist(it);updMini()},
   onStateChange:e=>{playing=e.data===1;if(e.data===1||e.data===-1||e.data===5){ytErr='';const x=document.getElementById('ytErr');if(x&&e.data===1)x.hidden=true}updMini()},
   onError:e=>{friendlyErr(ERRS[e.data]||('The player hit an error (code '+e.data+').'))}}}));
 placeYT()}
function checkPlaylist(it){if(it.type!=='playlist')return;setTimeout(()=>{if(!YTP||!YTP.getPlaylist)return;const pl=YTP.getPlaylist();if(curItem().id===it.id&&(!pl||!pl.length))friendlyErr('I couldn\u2019t load this playlist. It may be private, deleted, or the ID is incomplete.')},4500)}
function playItem(it,auto){S.music.cur=it.id;save();ytErr='';const x=document.getElementById('ytErr');if(x)x.hidden=true;
 if(!ytReady){pendingLoad=it;loadYTAPI();return}
 if(it.type==='playlist')YTP.loadPlaylist({list:it.id,listType:'playlist',index:0});else YTP.loadVideoById(it.id);
 checkPlaylist(it);updMini();if(location.hash==='#music')render()}
function updMini(){const m=$('#mini');if(!m)return;const d=YTP&&YTP.getVideoData?YTP.getVideoData():null,it=curItem();
 const show=!!(ytReady&&d&&d.video_id);m.classList.toggle('hidden',!show);document.body.classList.toggle('hasmini',show);
 if(show){$('#miniTitle').textContent=d.title||'Loading…';$('#miniSub').textContent=(d.author?d.author+' · ':'')+(it?it.title:'');const t=thumb(d.video_id);if($('#miniThumb').src!==t)$('#miniThumb').src=t}
 $('#mPlay').innerHTML=playing?IC.pause:IC.play;const bp=document.getElementById('bigPlay');if(bp)bp.innerHTML=playing?IC.pause+' Pause':IC.play+' Play';
 const mi=$('#mini');mi.classList.toggle('playing',playing);const eq=document.getElementById('mEq');if(eq)eq.parentElement.classList.toggle('paused-eq',!playing);const gl=document.getElementById('mGlow');if(gl&&d&&d.video_id){const u=`url(https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg)`;if(gl.dataset.u!==u){gl.dataset.u=u;gl.style.backgroundImage=u}}const nt=document.getElementById('nowT');if(nt&&d)nt.textContent=d.title||'';}
function placeYT(){const w=$('#ytWrap'),slot=document.getElementById('vidslot');if(!slot){w.classList.add('off');w.style.cssText='';return}
 const r=slot.getBoundingClientRect();w.classList.remove('off');w.style.cssText=`left:${r.left+scrollX}px;top:${r.top+scrollY}px;width:${r.width}px;height:${r.height}px`}
addEventListener('resize',placeYT);
const ctl={toggle(){if(!ytReady){playItem(curItem());return}playing?YTP.pauseVideo():YTP.playVideo()},next(){if(!ytReady)return;const it=curItem();if(it.type==='playlist'||YTP.getPlaylist&&YTP.getPlaylist())YTP.nextVideo();else toast('This is a single video, so there\u2019s no next track.')},prev(){if(!ytReady)return;if(YTP.getPlaylist&&YTP.getPlaylist()&&YTP.getPlaylistIndex()>0)YTP.previousVideo();else YTP.seekTo(0,true)}};
$('#mPlay').onclick=ctl.toggle;$('#mNext').onclick=ctl.next;$('#mPrev').onclick=ctl.prev;
setInterval(()=>{if(ytReady)updMini()},2000);
async function fetchTitle(it){try{const url=it.type==='video'?'https://www.youtube.com/watch?v='+it.id:'https://www.youtube.com/playlist?list='+it.id;const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url));if(!r.ok)return;const j=await r.json();if(j.title){it.title=j.title;it.thumb=j.thumbnail_url;save();if(location.hash==='#music')render()}}catch(e){}}
V.music=()=>{const it=curItem();return `<section class="phead"><div class="kicker">Now playing</div><div class="ptitle">Music<i>.</i></div></section>
 <section class="glass card lens" style="overflow:hidden"><div class="mglow" id="mGlow"></div><div class="row between"><span class="chip a">${it.type==='playlist'?'Playlist':'Video'}</span><span class="eq" id="mEq"><i></i><i></i><i></i></span></div>
 <div id="vidslot" class="vidslot" style="margin-top:14px">${ytReady?'':'<div><div class="vinyl" style="margin:0 auto 12px"></div>Press play — Aarav\u2019s mix is queued.</div>'}</div>
 <p class="small muted" id="nowT" style="margin:10px 0 0">${esc(it.title)}</p>
 <div class="row" style="margin-top:12px"><button class="btn tap" id="bPrev" aria-label="Previous">${IC.prev}</button><button class="btn pri tap" id="bigPlay">${playing?IC.pause+' Pause':IC.play+' Play'}</button><button class="btn tap" id="bNext" aria-label="Next">${IC.next}</button></div>
 <div id="ytErr" class="err" ${ytErr?'':'hidden'}>${ytErr?errHTML():''}</div></section>
 <section class="glass card"><div class="kicker">Library</div><form id="addyt" class="row" style="flex-wrap:nowrap"><input type="text" id="ytUrl" placeholder="Paste a YouTube / YT Music video or playlist link" autocomplete="off"><button class="btn pri tap" style="flex:none">Add</button></form>
 <div class="lib">${S.music.lib.map(x=>`<div class="tile ${x.id===it.id?'on':''}" data-id="${esc(x.id)}"><img src="${esc(x.thumb||(x.type==='video'?thumb(x.id):'icons/icon-192.png'))}" alt="" loading="lazy"><div class="lt"><b>${esc(x.title)}</b><span>${x.type==='playlist'?'Playlist':'Video'}${x.def?' · default':''}</span></div><button class="btn play sm" aria-label="Play">${IC.play}</button>${x.def?'':'<button class="x" aria-label="remove">✕</button>'}</div>`).join('')}</div>
 </section>`};
V.music.after=()=>{placeYT();requestAnimationFrame(placeYT);setTimeout(placeYT,400);setTimeout(placeYT,700);
 $('#bigPlay').onclick=ctl.toggle;$('#bNext').onclick=ctl.next;$('#bPrev').onclick=ctl.prev;
 $('#addyt').onsubmit=e=>{e.preventDefault();const p=parseYT($('#ytUrl').value);if(!p)return toast('That doesn\u2019t look like a YouTube link.');
  if(S.music.lib.some(x=>x.id===p.id&&x.type===p.type)){toast('Already in the library.');return}
  const it={type:p.type,id:p.id,title:p.type==='video'?'Video '+p.id:'Playlist '+p.id,added:Date.now()};S.music.lib.push(it);save();fetchTitle(it);toast('Added to library.');render()};
 document.querySelectorAll('.lib .tile').forEach(el=>{const x=S.music.lib.find(y=>y.id===el.dataset.id);el.querySelector('.play').onclick=()=>playItem(x);const rm=el.querySelector('.x');if(rm)rm.onclick=()=>{S.music.lib=S.music.lib.filter(y=>y!==x);if(S.music.cur===x.id)S.music.cur=S.music.lib[0].id;save();render()}});
 loadYTAPI()};
function updatePill(){}
const mq=matchMedia('(prefers-color-scheme: light)');
const THI={system:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/></svg>',light:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',dark:'<svg viewBox="0 0 24 24"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/></svg>'};
function applyTheme(){const t=S.settings.theme,eff=t==='system'?(mq.matches?'light':'dark'):t;const r=document.documentElement;r.dataset.theme=eff;r.dataset.tod=tod();$('#themeBtn').innerHTML=THI[t]||THI.system;$('#themeBtn').title='Theme: '+t}
mq.addEventListener&&mq.addEventListener('change',()=>S.settings.theme==='system'&&applyTheme());
setInterval(()=>{document.documentElement.dataset.tod=tod()},60000);
$('#themeBtn').onclick=()=>{const o=['system','light','dark'];S.settings.theme=o[(o.indexOf(S.settings.theme)+1)%3];save();
 const go=()=>{applyTheme();if(location.hash==='#settings')render()};if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(go);else go();toast('Theme: '+S.settings.theme[0].toUpperCase()+S.settings.theme.slice(1))};
applyTheme();applyWxMood();
let qcKind='goal';
function qc(open){if(open){$('#sheet').classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('qc');setTimeout(()=>$('#qcText').focus(),120);FX.seg()}else closeSheets()}
$('#qcBtn').onclick=()=>{if(document.body.classList.contains('qc'))closeSheets();else qc(true)};$('#scrim').onclick=closeSheets;$('#qcCancel').onclick=closeSheets;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheets()});
document.querySelectorAll('#qcSeg button').forEach(b=>b.onclick=()=>{qcKind=b.dataset.k;document.querySelectorAll('#qcSeg button').forEach(x=>x.classList.toggle('on',x===b));FX.seg();$('#qcText').placeholder=qcKind==='goal'?'One thing that would make today a win…':'Capture a thought…'});
$('#qcText').placeholder='One thing that would make today a win…';
$('#qcForm').onsubmit=e=>{e.preventDefault();const v=$('#qcText').value.trim();if(!v)return;if(qcKind==='goal')S.todos.push({id:uid(),text:v.slice(0,140),done:false,date:today()});else S.notes.push({id:uid(),text:v,pinned:false,created:Date.now(),updated:Date.now()});save();$('#qcText').value='';closeSheets();toast(qcKind==='goal'?'Goal added to today ✓':'Note saved ✓');render()};
const TABOF={goals:'more',notes:'more',habits:'more',stats:'more',settings:'more',focus:'more',tools:'more',convert:'more',clocks:'more',calc:'more'};
function render(){const t=(location.hash||'#home').slice(1);const v=V[t]?t:'home';const el=$('#view');el.classList.remove('vin');el.innerHTML=V[v]();void el.offsetWidth;el.classList.add('vin');document.body.dataset.view=v;
 document.querySelectorAll('#dock a').forEach(a=>a.classList.toggle('on',a.dataset.t===(TABOF[v]||v)));if(v!=='music')placeYT();V[v].after&&V[v].after();window.FX&&FX.refresh()}
window.addEventListener('hashchange',()=>{closeSheets();window.scrollTo({top:0,behavior:'instant'});render()});
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('paused',document.hidden));
if(S.timer)loop();
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('SW',e)));
})();

