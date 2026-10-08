/* HQ · core: state, helpers, weather, home, calendar, tools, focus, goals, notes, habits, stats, settings */
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
const def=()=>({v:1,focus:{},sessions:0,todos:[],notes:[],blocks:[],habits:[],habitLog:{},settings:defSet(),timer:null,created:today(),saved:[],readIds:[],readLog:{},newsReads:{},newsPrefs:{topics:['ai','games','movies'],hiddenSources:[],lastVisit:0},reader:{fs:18,font:'serif',theme:null},home:{order:null,hidden:[]},sw:{run:false,start:0,acc:0,laps:[]},timers:[],recentQ:[]});
let S;try{S=Object.assign(def(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=def()}
S.settings=Object.assign(defSet(),S.settings);fixState();['notes','blocks','habits'].forEach(k=>Array.isArray(S[k])||(S[k]=[]));if(!S.habitLog||typeof S.habitLog!=='object')S.habitLog={};
['daily','practice','srs','loreSeen','hints','quits','cleared'].forEach(k=>delete S[k]);
function fixState(){const d=def();S.newsPrefs=Object.assign(d.newsPrefs,S.newsPrefs);if(!Array.isArray(S.newsPrefs.topics)||!S.newsPrefs.topics.some(k=>['ai','games','movies'].includes(k)))S.newsPrefs.topics=d.newsPrefs.topics;if(!Array.isArray(S.newsPrefs.hiddenSources))S.newsPrefs.hiddenSources=[];['saved','readIds','timers','recentQ','notes','blocks','habits','todos'].forEach(k=>Array.isArray(S[k])||(S[k]=[]));['readLog','newsReads','habitLog','focus'].forEach(k=>S[k]&&typeof S[k]==='object'||(S[k]={}));S.reader=Object.assign(d.reader,S.reader);S.home=Object.assign(d.home,S.home);S.sw=Object.assign(d.sw,S.sw);if(!Array.isArray(S.sw.laps))S.sw.laps=[]}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));document.getElementById('saveWarning')?.remove();return true}catch(e){if(!document.getElementById('saveWarning')){const w=document.createElement('div');w.id='saveWarning';w.className='glass plus-undo';w.setAttribute('role','alert');w.innerHTML='<span>Changes could not save. Keep HQ open.</span><button class="btn sm tap">Export recovery</button>';document.body.appendChild(w);w.querySelector('button').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='hq-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}}return false}};
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
const ICO={ai:'<path d="M12 3c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9Z"/>',cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/>',focus:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',goals:'<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>',notes:'<path d="M6 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20z"/><path d="M14.5 3.5v4.5H19M9 12h6M9 16h4"/>',habits:'<path d="M12 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8C19.5 16.4 12 21 12 21z"/>',stats:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',fx:'<circle cx="9" cy="9" r="5.5"/><path d="M15.5 9.6A5.5 5.5 0 1 1 9.6 15.5"/><path d="M8 7.5h2.5M8 10.5h2.5M9 7.5v4"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2M3.5 12h1.5M19 12h1.5"/>',calc:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',swap:'<path d="M7 4 3.5 7.5 7 11M3.5 7.5h14M17 13l3.5 3.5L17 20M20.5 16.5h-14"/>',plus:'<path d="M12 5v14M5 12h14"/>',refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',chevL:'<path d="m15 5-7 7 7 7"/>',chevR:'<path d="m9 5 7 7-7 7"/>',news:'<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><path d="M7.5 9h5M7.5 12.5h9M7.5 16h9"/>',home:'<path d="M4 10.2 12 4l8 6.2V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>',music:'<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M10 2.5h4M18.5 6.5l1.5-1.5"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',ext:'<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>',sparkle:'<path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5zM18.5 15.5c.3 1.8 1 2.5 2.5 2.8-1.6.3-2.2 1-2.5 2.7-.3-1.7-1-2.4-2.5-2.7 1.5-.3 2.2-1 2.5-2.8z"/>',bm:'<path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4.2L6 21V4.5a1 1 0 0 1 1-1z"/>'};
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
function greetHTML(){const h=istHour();return h<5?'Late <i>night.</i>':h<12?'Good <i>morning.</i>':h<17?'Good <i>afternoon.</i>':'Good <i>evening.</i>'}
function ctxLine(){const w=S.wx&&S.wx.cur,bl=blocksFor(today()),nx=bl.find(b=>!b.allDay&&b.end>nowHM());let s='Your desk is open.';
 if(w){const k=wkind(w.code),label={clear:w.day?'Clear skies':'Clear night',rain:'Rain outside',storm:'Thunderstorms',snow:'Snow outside',fog:'Fog outside',clouds:'Cloudy skies'};s=`${label[k]||'Outside right now'} · ${Math.round(w.t)}°.`}
 if(nx)s+=` Next: <b>${esc(nx.title)}</b> at ${nx.start}.`;else if(!bl.length)s+=' No plans on the calendar.';
 return s}
const fmtHM=d=>({h:String(d.getHours()).padStart(2,'0'),m:String(d.getMinutes()).padStart(2,'0'),s:String(d.getSeconds()).padStart(2,'0')});
function heroClock(){const c=fmtHM(new Date());return `<span class="hh">${c.h}</span><span class="mm"><span class="col" aria-hidden="true"><i></i><i></i></span><span class="md">${c.m}</span><span class="ss" id="hss">${c.s}</span></span>`}
const EMPTY=(g,t,p,extra='')=>`<div class="empty"><div class="glyph">${g}</div><div class="ed">${t}</div><p>${p}</p>${extra}</div>`;
// ---------- HOME: hero + reorderable widgets ----------
const OLD_WDEF=['recap','weather','today','focus','habits','music','news','goals','notes','tools'];
const WDEF=['news','music','weather','today','notes','tools','recap','goals','habits','focus'];
const WNAMES={recap:'Daily recap',weather:'Weather',today:'Today',focus:'Focus',habits:'Habits',music:'Music',news:'For you',goals:'Goals',notes:'Notes',tools:'Tools'};
function homeOrder(){const h=S.home;if(Array.isArray(h.order)&&h.order.join('|')===OLD_WDEF.join('|'))h.order=[...WDEF];let o=(Array.isArray(h.order)?h.order:[]).filter((x,i,a)=>WDEF.includes(x)&&a.indexOf(x)===i);WDEF.forEach(x=>{if(!o.includes(x))o.splice(Math.min(WDEF.indexOf(x),o.length),0,x)});h.order=o;if(!Array.isArray(h.hidden))h.hidden=[];h.hidden=h.hidden.filter(x=>WDEF.includes(x));return o}
const ringC=r=>2*Math.PI*r;
function recapData(day){const t=day||today(),td=S.todos.filter(x=>x.date===t),hl=S.habitLog[t]||{};
 return{t,fm:S.focus[t]||0,goal:120,dn:td.filter(x=>x.done).length,tg:td.length,open:td.filter(x=>!x.done).length,hd:S.habits.filter(x=>hl[x.id]).length,th:S.habits.length,ev:blocksFor(t).length,
  nt:S.notes.filter(n=>n.created&&fmt.format(new Date(n.created))===t).length,rd:(S.readLog||{})[t]||0,sg:((S.music||{}).log||{})[t]||0}}
function recapWidget(){const h=istHour(),late=h<4,eve=h>=19||late,r=recapData(late?addDays(today(),-1):today());
 const fp=Math.min(1,r.fm/r.goal),gp=r.tg?r.dn/r.tg:0,hp=r.th?r.hd/r.th:0;const parts=[fp].concat(r.tg?[gp]:[],r.th?[hp]:[]),avg=parts.reduce((a,b)=>a+b,0)/parts.length;
 const head=eve?(avg>=.9?'A full-circle day.':avg>=.6?'Solid work today.':avg>=.3?'A gentle day. That counts too.':(r.fm||r.dn||r.hd)?'Small steps still count.':'Tomorrow is a clean slate.')
  :(avg>=.9?'Already crushing it.':avg>=.5?'Good momentum.':h<12?'The day is wide open.':'Plenty of day left.');
 const ring=(rad,p,col,k)=>{const C=ringC(rad);return `<circle class="rbg" cx="60" cy="60" r="${rad}"/><circle class="rg" cx="60" cy="60" r="${rad}" style="stroke:${col};--c:${C.toFixed(1)};--o:${(C*(1-Math.min(1,p))).toFixed(1)};transition-delay:${.15+k*.15}s" transform="rotate(-90 60 60)"/>`};
 const extras=[[r.ev,'event'],[r.nt,'note'],[r.rd,'story','stories'],[r.sg,'song']].filter(x=>x[0]).map(([n,a,pl])=>`${n} ${n===1?a:(pl||a+'s')}`);
 let tom='';if(eve){const nd=addDays(r.t,1),w=S.wx&&S.wx.daily&&S.wx.daily.find(x=>x.d===nd),tb=blocksFor(nd)[0];
  tom=`<div class="rtom"><span class="kicker plain">Tomorrow</span><div class="rtrow">${w?`<span class="rti">${wIcon(w.code,true)}<b>${Math.round(w.hi)}°</b><em>${Math.round(w.lo)}°</em></span>`:''}<span class="rti grow ell">${tb?`<b>${tb.allDay?'All day':tb.start}</b> ${esc(tb.title)}`:'No events yet'}</span>${r.open?`<span class="rti"><b>${r.open}</b> goal${r.open>1?'s':''} carry over</span>`:''}</div></div>`}
 return{cls:'s2 d6 recap'+(eve?' eve':''),inner:`${eve?'<i class="rstars" aria-hidden="true"></i>':''}<div class="rwrap"><svg class="rings" viewBox="0 0 120 120" aria-hidden="true">${ring(52,fp,'var(--ember)',0)}${ring(40,gp,'#ffb547',1)}${ring(28,hp,'#5fe3b0',2)}</svg>
  <div class="rtx"><div class="kicker">${eve?'Tonight\u2019s recap':'Today so far'}</div><div class="rhead">${head}</div>
  <div class="rleg"><span><i style="background:var(--ember)"></i>Focus <b>${r.fm}</b>/${r.goal}m</span>${r.tg?`<span><i style="background:#ffb547"></i>Goals <b>${r.dn}</b>/${r.tg}</span>`:''}${r.th?`<span><i style="background:#5fe3b0"></i>Habits <b>${r.hd}</b>/${r.th}</span>`:''}</div>
  <div class="small muted rext">${extras.length?extras.join(' · '):(late?'Nothing else logged.':'Nothing logged yet today.')}</div></div></div>${tom}`}}
function homeWidgets(){const t=today(),td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length,fm=S.focus[t]||0,goal=120;
 const bl=blocksFor(t),hm=nowHM(),up=bl.filter(b=>b.allDay||b.end>hm).slice(0,4);
 const hl=S.habitLog[t]||{},hd=S.habits.filter(x=>hl[x.id]).length;
 const d7=Array.from({length:7},(_,i)=>addDays(t,i-6)).map(d=>{const l=S.habitLog[d]||{};return S.habits.length&&S.habits.every(x=>l[x.id])});
 const pins=S.notes.filter(n=>n.pinned).concat(S.notes.filter(n=>!n.pinned).sort((a,b)=>b.updated-a.updated)).slice(0,3);
 const rates=fxCache(),usd=rates&&rates.rates.USD?(1/rates.rates.USD):null;const C=2*Math.PI*36,off=C*(1-Math.min(1,fm/goal));
 const d=vd(),np=d&&d.video_id,lastR=S.music.recent[0];
 const fy=forYou()?.sort((a,b)=>(b.date||0)-(a.date||0)),top=fy&&fy.slice(0,3);homeNews=fy||[];
 const runT=S.timers.filter(x=>!x.done).slice(0,2);
 return{
  recap:recapWidget(),
  weather:{cls:'lens wxcard s2 d4 dr2',id:'wxcard',inner:wxInner()},
  today:{cls:'s2 d2 dr2',inner:`<div class="row between"><div class="kicker">Today</div><a class="more-link tap" href="#cal">Calendar ${ic('chevR')}</a></div>
   ${up.length?`<div class="stg">${up.map(b=>`<div class="listrow"><span class="time" style="color:${COLORS[b.color]}">${b.allDay?'All day':b.start}</span><span class="grow ell">${esc(b.title)}</span>${!b.allDay&&b.start<=hm?'<span class="chip a">Now</span>':''}</div>`).join('')}</div>`:EMPTY('○','Wide open.','Nothing on the calendar. Claim an hour for something that matters.',`<a class="btn sm tap" href="#cal">${ic('plus')} Add event</a>`)}`},
  focus:{tag:'a',href:'#focus',cls:'d2 tap',style:'justify-content:space-between',inner:`<div class="kicker">Focus</div><div class="row" style="flex-wrap:nowrap;gap:12px"><svg class="ring2" viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 42 42)"/></svg><div><div class="bignum" data-count="${fm}">${fm}<small>m</small></div><div class="small muted">of ${goal}m today</div></div></div><span class="small acc" style="margin-top:12px">${S.timer?'Session running →':'Start a session →'}</span>`},
  habits:{tag:'a',href:'#habits',cls:'d2 tap',inner:`<div class="kicker">Habits</div>${S.habits.length?`<div class="bignum">${hd}<small>/${S.habits.length}</small></div><div class="small muted" style="margin-bottom:12px">done today</div><div class="dots7">${d7.map(x=>`<i class="${x?'on':''}"></i>`).join('')}</div>`:EMPTY('♡','Tiny wins.','Build a streak, one day at a time.')}`},
  music:{cls:'s2 d2 hmus',inner:np?`<div class="mglow" style="background-image:url(${thumb(np,'hqdefault')})"></div><div class="row between"><div class="kicker">Now playing</div><span class="eq ${playing?'':'paused-eq'}" id="hmEq"><i></i><i></i><i></i></span></div>
   <div class="hmusic"><button class="hart tap" data-np aria-label="Open Now Playing"><img src="${thumb(np,'hqdefault')}" alt=""></button><div class="grow" style="min-width:0"><b class="ell" id="hmT">${esc(cleanT(d.title)||'Loading…')}</b><span class="small muted ell" id="hmA">${esc(cleanA(d.author))}</span><div class="hprog"><i id="hmProg"></i></div>
   <div class="hmc"><button class="ib sm tap" data-mc="prev" aria-label="Previous">${IC.prev}</button><button class="ib sm pp tap" data-mc="toggle" aria-label="Play/Pause">${playing?IC.pause:IC.play}</button><button class="ib sm tap" data-mc="next" aria-label="Next">${IC.next}</button></div></div></div>`
   :lastR?`<div class="kicker">Music</div><div class="hmusic"><button class="hart tap" data-rv="${esc(lastR.id)}" aria-label="Play"><img src="${thumb(lastR.id,'hqdefault')}" alt=""><span class="lplay">${IC.play}</span></button><div class="grow" style="min-width:0"><span class="small muted">Pick up where you left off</span><b class="ell">${esc(cleanT(lastR.t)||'Last track')}</b><span class="small muted ell">${esc(cleanA(lastR.a))}</span><a class="btn sm tap" href="#music" style="margin-top:10px">Library</a></div></div>`
   :`<div class="kicker">Music</div>${EMPTY('♪','Silence is golden.','But a good playlist is platinum.',`<button class="btn sm pri tap" data-mc="toggle">${IC.play} Play the mix</button>`)}`},
  news:{cls:'s2 d4 hnews',style:'min-height:240px',inner:`<div class="row between"><div class="kicker">For you</div><a class="more-link tap" href="#news">All news ${ic('chevR')}</a></div>${top&&top.length?`<button class="nhero tap" data-hn="0">${top[0].img?`<img src="${esc(top[0].img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<span class="sh"></span><span class="tx"><span class="nsrc" style="color:#fff">${esc(top[0].src)} · ${NLAB[top[0].cat]}</span><span class="ht">${esc(top[0].title)}</span></span></button>${top.slice(1).map((x,k)=>`<button class="hnrow tap" data-hn="${k+1}"><span class="nsrc">${esc(x.src)}</span><span class="ell2">${esc(x.title)}</span></button>`).join('')}`:EMPTY('✦','Fresh stories brewing.','Open News to pull the latest from AI, games and film.')}`},
  goals:{cls:'d2',inner:`<div class="row between"><div class="kicker">Goals</div><a class="more-link tap" href="#goals">All ${ic('chevR')}</a></div>${td.length?`<div class="stg">${td.slice(0,4).map(x=>`<div class="listrow"><span class="grow ell" style="${x.done?'color:var(--tx3);text-decoration:line-through':''}">${esc(x.text)}</span>${x.done?'<span class="acc">✓</span>':''}</div>`).join('')}</div>`:EMPTY('✓','A clean slate.','Tap + and add one thing that makes today a win.')}`},
  notes:{cls:'d3',inner:`<div class="row between"><div class="kicker">Notes</div><a class="more-link tap" href="#notes">All ${ic('chevR')}</a></div>${pins.length?`<div class="stg">${pins.map(n=>`<div class="listrow"><span class="grow ell">${n.pinned?'<span class="acc">● </span>':''}${esc(n.text.split('\n')[0])}</span></div>`).join('')}</div>`:EMPTY('✎','Your second brain is empty.','Capture a thought before it flies away.')}`},
  tools:{tag:'a',href:'#tools',cls:'s2 d3 tap',inner:`<div class="row between"><div class="kicker">Tools</div><span class="more-link">Open ${ic('chevR')}</span></div>
   ${runT.length?`<div class="trun">${runT.map(x=>`<span class="chip a" data-tmr="${x.id}">${ic('timer','gi')} <b>${fmtLeft(x)}</b> ${esc(x.label)}</span>`).join('')}</div>`:''}
   <div class="toolrow"><div><div class="bignum" style="font-size:34px">${usd?'₹'+usd.toFixed(2):'₹—'}</div><div class="small muted">1 USD</div></div>${(S.clocks||[]).slice(1,3).map(c=>`<div><div class="bignum" style="font-size:34px" data-tz="${esc(c.tz)}">${tzTime(c.tz)}</div><div class="small muted">${esc(c.name)}</div></div>`).join('')}</div>`}}}
let homeNews=[],homeEditing=false,hDrag=null,hDropAt=0;
function wFrame(id,w){const tag=w.tag||'section';return `<${tag} ${w.href?`href="${w.href}"`:''} ${w.id?`id="${w.id}"`:''} class="glass bt ${w.cls} rv" data-w="${id}" ${w.style?`style="${w.style}"`:''}>${w.inner}<button class="wx" data-hide="${id}" aria-label="Hide ${WNAMES[id]}" tabindex="-1">−</button></${tag}>`}
function trayHTML(){const h=S.home.hidden;return h.length?`<span class="small muted">Hidden:</span>${h.map(id=>`<button class="chip tap" data-show="${id}">${ic('plus','gi')} ${WNAMES[id]}</button>`).join('')}`:'<span class="small muted">Long-press or drag a widget to move it. Tap − to hide one.</span>'}
V.home=()=>{const W=homeWidgets(),ord=homeOrder().filter(id=>!S.home.hidden.includes(id)),articles=homeNews.length,events=blocksFor(today()).length;
 return `<section class="hero desk-hero"><div class="hero-copy px">
  <div class="desk-id"><span>PERSONAL DESK</span><span>01 / HQ</span></div>
  <p class="greet">${greetHTML()}</p><h1 class="hero-title">aarav<span class="cursor-notch">_</span></h1>
  <div class="desk-note">a few things worth<br><i>keeping open.</i><svg viewBox="0 0 220 30" aria-hidden="true"><path d="M5 23C45 7 136 4 208 12M144 24l64-12-13-8"/></svg></div>
  <p class="ctx" id="ctx">${ctxLine()}</p>
  <div class="hero-actions"><a href="#news" class="desk-link tap"><span>03</span> The signal ${ic('chevR')}</a><a href="#music" class="desk-link tap"><span>04</span> The rotation ${ic('chevR')}</a><a href="#vault" class="desk-link tap"><span>06</span> The keepsakes ${ic('chevR')}</a></div>
  </div><div class="desk-stack">
  <svg class="desk-ribbon" viewBox="0 0 620 520" fill="none" aria-hidden="true"><defs><linearGradient id="ribbon-glass" x1="40" y1="70" x2="540" y2="430" gradientUnits="userSpaceOnUse"><stop stop-color="#f0efcc" stop-opacity=".4"/><stop offset=".44" stop-color="#80cfb4" stop-opacity=".08"/><stop offset=".7" stop-color="#93a6f4" stop-opacity=".3"/><stop offset="1" stop-color="#f5caaa" stop-opacity=".08"/></linearGradient><linearGradient id="ribbon-rim" x1="60" y1="20" x2="480" y2="470" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffee" stop-opacity=".85"/><stop offset=".4" stop-color="#b7e4d7" stop-opacity=".08"/><stop offset=".7" stop-color="#c3cffc" stop-opacity=".65"/><stop offset="1" stop-color="#dbe4cf" stop-opacity=".2"/></linearGradient></defs><path d="M85 410C-50 215 203-49 395 79C645 245 387 508 211 358C39 211 234 44 508 212" stroke="url(#ribbon-glass)" stroke-width="65"/><path d="M62 431C-80 220 204-91 415 51C700 239 392 556 189 383C-1 219 224 1 519 181" stroke="url(#ribbon-rim)" stroke-width="1.2"/><path d="M107 389C-18 210 206-8 375 107C591 251 381 462 233 333C86 205 241 88 496 244" stroke="url(#ribbon-rim)" stroke-width="1"/></svg>
  <div class="desk-tab" aria-hidden="true"><span class="live-dot"></span> LOCAL TIME</div>
  <div class="hero-time glass tap"><i class="clock-reflection" aria-hidden="true"></i><div class="clock-label"><span>NOW /</span><span>LIVE</span></div>
  <div class="bigclock" id="bigClock" aria-label="Current time">${heroClock()}</div>
  <div class="hdate"><span>${new Date().toLocaleDateString('en-IN',{weekday:'long'})}</span><b>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</b><span>${esc((S.wx&&S.wx.place)||S.settings.city.name.split(',')[0])}</span></div>
  <div class="desk-scale" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  </div><div class="desk-slip glass"><span class="slip-mark">↗</span><div><span class="slip-caption">ON THE DESK</span><a href="#news" class="tap" id="deskStoryCount">${articles} stories</a><a href="#cal" class="tap">${events} event${events===1?'':'s'}</a></div><span class="slip-code">HQ<br>001</span></div>
  </div></section>
 <div class="home-section"><div><span class="section-number">01—10</span><h2>Open tabs<span>.</span></h2></div><p>Picked up where you left off.</p><a class="more-link tap" href="#more">The drawer ${ic('chevR')}</a></div>
 <div class="bento ${homeEditing?'editing':''}" id="bento">${ord.map(id=>wFrame(id,W[id])).join('')}</div>
 <div class="hfoot"><div class="htray" id="hTray" ${homeEditing?'':'hidden'}>${trayHTML()}</div><button class="btn ghost sm tap" id="homeEditBtn">${homeEditing?'Done':ic('grid')+' Edit widgets'}</button></div>`};

V.home.ptr=()=>Promise.all([loadWeather(true),loadNews('ai'),loadNews('games'),loadNews('movies')]).then(()=>{if(document.body.dataset.view==='home')render()});
V.home.after=()=>{loadWeather();if(!fxCache()||Date.now()-fxCache().at>6*36e5)loadFx();
 const stale=['ai','games','movies'];
 if(stale.length){Promise.all(stale.map(k=>loadNews(k))).then(r=>{if(r.some(Boolean)&&document.body.dataset.view==='home'&&!homeEditing&&!hDrag){const w=document.querySelector('[data-w=news]');if(w){const W=homeWidgets();const count=document.getElementById('deskStoryCount');if(count)count.textContent=homeNews.length+' stories';w.innerHTML=W.news.inner+`<button class="wx" data-hide="news" aria-label="Hide For you" tabindex="-1">−</button>`;FX.refresh()}}})}
 const g=$('#bento');
 g.addEventListener('click',e=>{if(homeEditing||hDrag||Date.now()-hDropAt<400){const hb=e.target.closest('[data-hide]');e.preventDefault();e.stopPropagation();if(hb&&homeEditing)hideWidget(hb.dataset.hide);return}
  const n=e.target.closest('[data-hn]');if(n){openReader(homeNews,+n.dataset.hn,n.querySelector('img'));return}
  const p=e.target.closest('[data-np]');if(p){openNP(p.querySelector('img'));return}
  const m=e.target.closest('[data-mc]');if(m){ctl[m.dataset.mc]();return}
  const tm=e.target.closest('[data-tmr]');if(tm){e.preventDefault();location.hash='#timers'}},true);
 $('#homeEditBtn').onclick=()=>homeEdit(!homeEditing);
 $('#hTray').onclick=e=>{const b=e.target.closest('[data-show]');if(!b)return;S.home.hidden=S.home.hidden.filter(x=>x!==b.dataset.show);const o=S.home.order;o.splice(o.indexOf(b.dataset.show),1);o.push(b.dataset.show);save();render();const el=document.querySelector(`[data-w="${b.dataset.show}"]`);if(el)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'center'}),80)};
 bindHomeDrag(g)};
function homeEdit(on){homeEditing=on;if(document.body.dataset.view!=='home')return;const g=$('#bento');g.classList.toggle('editing',on);document.body.classList.toggle('hediting',on);$('#homeEditBtn').innerHTML=on?'Done':ic('grid')+' Edit widgets';const tr=$('#hTray');tr.hidden=!on;tr.innerHTML=trayHTML();
 if(on){try{navigator.vibrate&&navigator.vibrate(10)}catch(e){}toast('Drag widgets to rearrange')}}
function hideWidget(id){const el=document.querySelector(`[data-w="${id}"]`);if(!S.home.hidden.includes(id))S.home.hidden.push(id);save();
 const kill=()=>{const before=flipRec();el.remove();flipPlay(before);$('#hTray').innerHTML=trayHTML()};
 if(el&&!RMQ.matches)el.animate([{transform:'none',opacity:1},{transform:'scale(.6)',opacity:0}],{duration:260,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).onfinish=kill;else if(el)kill()}
function flipRec(){const m=new Map();document.querySelectorAll('#bento>[data-w]').forEach(e=>m.set(e,e.getBoundingClientRect()));return m}
function flipPlay(m,skip){if(RMQ.matches)return;document.querySelectorAll('#bento>[data-w]').forEach(e=>{if(e===skip)return;const a=m.get(e);if(!a)return;const b=e.getBoundingClientRect(),dx=a.left-b.left,dy=a.top-b.top;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:520,easing:'cubic-bezier(.3,1.25,.45,1)'})})}
function bindHomeDrag(g){let lp=null,sx=0,sy=0,lx=0,ly=0;
 g.addEventListener('pointerdown',e=>{const tile=e.target.closest('#bento>[data-w]');if(!tile||e.button>0||e.target.closest('[data-hide]'))return;sx=lx=e.clientX;sy=ly=e.clientY;const pid=e.pointerId;
  if(homeEditing&&e.pointerType==='mouse'){e.preventDefault();dragStart(tile,e.clientX,e.clientY);return}
  clearTimeout(lp);lp=setTimeout(()=>{lp=null;if(!homeEditing)homeEdit(true);dragStart(tile,lx,ly)},homeEditing?200:520)});
 g.addEventListener('pointermove',e=>{lx=e.clientX;ly=e.clientY;if(lp&&Math.hypot(lx-sx,ly-sy)>9){clearTimeout(lp);lp=null}});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>g.addEventListener(t,()=>{if(lp){clearTimeout(lp);lp=null}}));
 g.addEventListener('contextmenu',e=>{if(e.target.closest('#bento>[data-w]'))e.preventDefault()})}
document.addEventListener('touchmove',e=>{if(hDrag)e.preventDefault()},{passive:false});
function dragStart(tile,x,y){const r=tile.getBoundingClientRect();hDrag={tile,gcx:x-(r.left+r.width/2),gcy:y-(r.top+r.height/2),tx:0,ty:0,x,y,last:0,lastO:null,raf:0};tile.classList.add('lift');document.body.classList.add('hdragging');try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}
 addEventListener('pointermove',dragMove,{passive:true});addEventListener('pointerup',dragEnd);addEventListener('pointercancel',dragEnd);hDrag.raf=requestAnimationFrame(dragAuto)}
function dragPos(){const d=hDrag,t=d.tile,r=t.getBoundingClientRect(),cx=(r.left+r.right)/2-d.tx,cy=(r.top+r.bottom)/2-d.ty;d.tx=d.x-d.gcx-cx;d.ty=d.y-d.gcy-cy;t.style.translate=`${d.tx.toFixed(1)}px ${d.ty.toFixed(1)}px`}
function dragMove(e){if(!hDrag)return;hDrag.x=e.clientX;hDrag.y=e.clientY;dragPos();dragHit()}
function dragHit(){const d=hDrag,now=performance.now();if(now-d.last<90)return;d.last=now;const el=document.elementFromPoint(d.x,d.y),o=el&&el.closest('#bento>[data-w]');if(!o||o===d.tile){d.lastO=null;return}if(o===d.lastO)return;d.lastO=o;
 const g=$('#bento'),k=[...g.children],before=flipRec();if(k.indexOf(d.tile)<k.indexOf(o))o.after(d.tile);else o.before(d.tile);flipPlay(before,d.tile);dragPos();try{navigator.vibrate&&navigator.vibrate(4)}catch(e){}}
function dragAuto(){if(!hDrag)return;const y=hDrag.y,H=innerHeight;let v=0;if(y<110)v=-Math.min(18,(110-y)/5);else if(y>H-150)v=Math.min(18,(y-(H-150))/5);if(v){scrollBy(0,v);dragPos();dragHit()}hDrag.raf=requestAnimationFrame(dragAuto)}
function dragEnd(){const d=hDrag;if(!d)return;d.last=0;dragHit();hDrag=null;hDropAt=Date.now();cancelAnimationFrame(d.raf);removeEventListener('pointermove',dragMove);removeEventListener('pointerup',dragEnd);removeEventListener('pointercancel',dragEnd);
 const t=d.tile;t.classList.remove('lift');document.body.classList.remove('hdragging');if(!RMQ.matches)t.animate([{translate:`${d.tx}px ${d.ty}px`},{translate:'0px 0px'}],{duration:480,easing:'cubic-bezier(.3,1.3,.45,1)'});t.style.translate='';
 const vis=[...$('#bento').children].map(x=>x.dataset.w).filter(Boolean);S.home.order=vis.concat(S.home.order.filter(x=>!vis.includes(x)));save()}
document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('#wxRetry');if(r){S.wxErr=false;$('#wxcard').innerHTML=wxInner();loadWeather(true)}});
setInterval(()=>{const c=document.getElementById('bigClock');if(c){const f=fmtHM(new Date());const s=document.getElementById('hss');if(s)s.textContent=f.s;const hh=c.querySelector('.hh');if(hh.textContent!==f.h||!c.querySelector('.mm').textContent.startsWith(f.m))c.innerHTML=heroClock()}
 const b=document.getElementById('barClock');if(b){const f=fmtHM(new Date());b.textContent=f.h+':'+f.m}
 document.querySelectorAll('[data-tz]').forEach(e=>e.textContent=tzTime(e.dataset.tz))},1000);
function toggleHabit(id,d){const l=S.habitLog[d]||(S.habitLog[d]={});if(l[id])delete l[id];else l[id]=true;save()}
// ---------- GENERIC SHEET ----------
const gs=document.createElement('div');gs.className='sheet lg pillglass';gs.id='gsheet';gs.inert=true;gs.setAttribute('role','dialog');document.body.appendChild(gs);
let sheetOpener=null;
function openSheet(html,mount){window.dispatchEvent(new Event('hq-before-close-sheet'));gs.classList.remove('embed-sheet');gs.inert=false;if(!document.body.classList.contains('qc'))sheetOpener=document.activeElement;gs.innerHTML=html;gs.classList.add('on');$('#scrim').classList.add('on');document.body.classList.add('qc');mount&&mount(gs);FX.refresh()}
function closeSheets(){window.dispatchEvent(new Event('hq-before-close-sheet'));const wasOpen=document.body.classList.contains('qc');gs.inert=true;$('#sheet').inert=true;gs.classList.remove('on');$('#sheet').classList.remove('on');$('#scrim').classList.remove('on');document.body.classList.remove('qc');
 const a=document.activeElement;if(a&&a!==document.body&&(gs.contains(a)||$('#sheet').contains(a)))a.blur();
 if(wasOpen){const o=sheetOpener;sheetOpener=null;if(o&&o!==document.body&&o.isConnected&&!gs.contains(o)&&!$('#sheet').contains(o)&&o.offsetParent!==null)try{o.focus({preventScroll:true})}catch(e){}}}
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
 let sx=null,sy=0;const w=$('#mwrap');w.addEventListener('touchstart',e=>{sx=e.touches.length===1?e.touches[0].clientX:null;sy=e.touches[0].clientY},{passive:true});w.addEventListener('touchcancel',()=>{sx=null},{passive:true});w.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)shiftMonth(dx<0?1:-1);sx=null},{passive:true})};
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
 <section class="menu">${[['convert','fx','Currency','Live rates vs ₹'],['clocks','clock','World clock',S.clocks.length+' cities'],['calc','calc','Calculator',S.calcHist.length+' in history'],['timers','timer','Timers',timerSummary()]].map(([h,i,n,s])=>`<a href="#${h}" class="glass mtile rv tap"><span class="mi">${ic(i)}</span><div><b>${n}</b><span>${s}</span></div></a>`).join('')}</section>`;
// ---------- MORE ----------
V.more=()=>`<section class="phead"><div class="kicker plain">05 / YOUR TOOLS</div><div class="ptitle">the drawer<i>.</i></div></section>
 <section class="menu">${[['focus','focus','Focus',S.timer?'Running now':(S.focus[today()]||0)+' min today'],['goals','goals','Goals',S.todos.filter(x=>x.date===today()&&!x.done).length+' open'],['notes','notes','Notes',S.notes.length+' notes'],['habits','habits','Habits',S.habits.length+' tracked'],['convert','fx','Currency','Live INR rates'],['clocks','clock','World clock',S.clocks.length+' cities'],['calc','calc','Calculator','With history'],['timers','timer','Timers',timerSummary()],['stats','stats','Stats',streak(focusSet())+'-day streak'],['settings','settings','Settings','Theme, data, location']].map(([h,i,n,s])=>`<a href="#${h}" class="glass mtile rv tap"><span class="mi">${ic(i)}</span><div><b>${n}</b><span>${s}</span></div></a>`).join('')}</section>`;

function askNotify(){if(!('Notification' in window)||Notification.permission!=='default')return Promise.resolve();return Notification.requestPermission().catch(()=>{})}
function notify(title,body){try{if(!('Notification' in window)||Notification.permission!=='granted')return;if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:title+body})).catch(()=>{});else new Notification(title,{body,icon:'icons/icon-192.png'})}catch(e){}}
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
 const q=$('#nQ');q.oninput=()=>{noteQ=q.value;const tmp=document.createElement('div');tmp.innerHTML=V.notes();$('#nList').innerHTML=tmp.querySelector('#nList').innerHTML;V.notes.after()};
 document.querySelectorAll('.note[data-id]').forEach(el=>{const n=S.notes.find(x=>x.id===el.dataset.id);
  el.querySelector('[data-pin]').onclick=()=>{n.pinned=!n.pinned;save();render()};
  el.querySelector('[data-edit]').onclick=()=>{editId=n.id;render();$('#eText').focus()};
  el.querySelector('[data-del]').onclick=()=>{{const copy={...n};S.notes=S.notes.filter(x=>x!==n);save();render();window.HQPLUS&&HQPLUS.undo('Note removed',async()=>{if(!S.notes.some(x=>x.id===copy.id))S.notes.push(copy);save();render()})}}});
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
 <section class="glass card"><div class="kicker">Install</div><p class="muted small" style="line-height:1.6">iPhone: open in Safari → Share → <b>Add to Home Screen</b>.<br>Mac: Safari → File → <b>Add to Dock</b>, or Chrome → install icon in the address bar.<br>Local tools and games work offline after the first load. News needs cached content; music and live data need a connection.</p></section>`;
V.settings.after=()=>{
 document.querySelectorAll('#thSeg button').forEach(b=>b.onclick=()=>{S.settings.theme=b.dataset.th;save();applyTheme();render()});
 $('#remM').onchange=e=>{S.settings.remindMin=Math.max(0,Math.min(120,+e.target.value||0));save()};
 $('#cityF').onsubmit=async e=>{e.preventDefault();const n=$('#cityI').value.trim();if(!n)return;try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name='+encodeURIComponent(n));const j=await r.json();const c=j.results&&j.results[0];if(!c)return toast('City not found.');S.settings.city={name:c.name+(c.country?', '+c.country:''),lat:c.latitude,lon:c.longitude};S.wx=null;save();toast('Weather location set to '+S.settings.city.name+'.');render()}catch(err){toast('Couldn\u2019t look up that city. Check your connection.')}};
 $('#exp').onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`hq-backup-${today()}.json`;document.body.appendChild(a);a.click();a.remove();toast('Exported.')};
 $('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(typeof d!=='object'||!d||d.v!==1)throw 0;if(window.HQPLUS){HQPLUS.previewHQ(d);return}S=Object.assign(def(),d);S.settings=Object.assign(defSet(),S.settings);fixState();ensureMusic();save();applyTheme();toast('Imported.');render()}).catch(()=>toast('That file isn\u2019t a valid HQ backup.'))};
 $('#rst').onclick=()=>{if(confirm('Reset ALL HQ data? This cannot be undone.')){localStorage.removeItem(KEY);S=def();ensureMusic();save();window.HQPLUS&&HQPLUS.reset();applyTheme();toast('All data reset.');location.hash='#home';render()}}};

// ---------- TOOLS: stopwatch + timers ----------
const swNow=()=>S.sw.acc+(S.sw.run?Date.now()-S.sw.start:0);
const fmtSW=ms=>{const cs=Math.floor(ms/10)%100,s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,p=n=>String(n).padStart(2,'0');return (h?h+':'+p(m):p(m))+':'+p(x)+'.'+p(cs)};
const tLeft=x=>x.done?0:x.paused?x.left:Math.max(0,x.end-Date.now());
const fmtLeft=x=>{const s=Math.ceil(tLeft(x)/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),p=n=>String(n).padStart(2,'0');return h?`${h}:${p(m)}:${p(s%60)}`:`${p(m)}:${p(s%60)}`};
const fmtDur=sec=>sec>=3600?`${Math.floor(sec/3600)}h ${Math.round(sec%3600/60)}m`:sec>=60?`${Math.floor(sec/60)} min${sec%60?' '+sec%60+'s':''}`:`${sec}s`;
function timerSummary(){const r=S.timers.filter(x=>!x.done).length;return S.sw.run?'Stopwatch running':r?r+' running':'Stopwatch & countdowns'}
function parseDur(v){v=String(v).trim().toLowerCase();if(!v)return 0;let m;
 if((m=v.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)))return m[3]!=null?(+m[1])*3600+(+m[2])*60+(+m[3]):(+m[1])*60+(+m[2]);
 let t=0,hit=false;v.replace(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?|m|min|mins|minutes?|s|sec|secs|seconds?)\b/g,(_,n,u)=>{hit=true;t+=+n*(u[0]==='h'?3600:u[0]==='m'?60:1)});if(hit)return Math.round(t);
 if(/^\d+(\.\d+)?$/.test(v))return Math.round(+v*60);return 0}
function audioCtx(){try{chime.a=chime.a||new (window.AudioContext||window.webkitAudioContext)();if(chime.a.state==='suspended')chime.a.resume()}catch(e){}return chime.a}
function chime(){const A=audioCtx();if(!A)return;const t=A.currentTime;[880,1174.66,1567.98,1174.66,1567.98].forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain(),s=t+i*.16;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.16,s+.02);g.gain.exponentialRampToValueAtTime(.0008,s+.85);o.connect(g).connect(A.destination);o.start(s);o.stop(s+.9)})}
function addTimer(sec,label){if(!(sec>0))return toast('Enter a time like 5, 7:30 or 45s.');sec=Math.min(sec,24*3600);audioCtx();askNotify();
 S.timers.unshift({id:uid(),label:(label||'').trim().slice(0,40)||fmtDur(sec),dur:sec*1000,end:Date.now()+sec*1000,paused:false,left:0,done:false});save();toast(`Timer set · ${fmtDur(sec)}`);if(location.hash==='#timers')tDraw(true)}
function tTick(){let ch=false;S.timers.forEach(x=>{if(!x.done&&!x.paused&&Date.now()>=x.end){x.done=true;x.doneAt=Date.now();ch=true;chime();try{navigator.vibrate&&navigator.vibrate([120,80,120,80,240])}catch(e){}notify('⏱ '+x.label,'Time\u2019s up.');toast('⏱ '+x.label+' · time\u2019s up')}});
 if(ch){save();if(location.hash==='#timers')tDraw(true)}else if(location.hash==='#timers')tDraw(false);
 document.querySelectorAll('[data-tmr]').forEach(c=>{const x=S.timers.find(y=>y.id===c.dataset.tmr);const b=c.querySelector('b');if(x&&b)b.textContent=x.done?'Done':fmtLeft(x)})}
setInterval(tTick,500);
function tCard(x){const C=2*Math.PI*26,p=x.done?1:1-tLeft(x)/x.dur;return `<div class="tcard ${x.done?'done':''} ${x.paused?'paused':''}" data-t="${x.id}"><svg class="tring" viewBox="0 0 60 60" aria-hidden="true"><circle class="bg" cx="30" cy="30" r="26"/><circle class="fg" cx="30" cy="30" r="26" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*p).toFixed(1)}" transform="rotate(-90 30 30)"/></svg>
 <div class="grow" style="min-width:0"><div class="tleft">${x.done?'Done':fmtLeft(x)}</div><div class="small muted ell">${esc(x.label)} · ${fmtDur(Math.round(x.dur/1000))}</div></div>
 ${x.done?`<button class="btn sm tap" data-ta="again">Restart</button><button class="x tap" data-ta="rm" aria-label="Dismiss">✕</button>`:`<button class="ib sm tap" data-ta="pause" aria-label="${x.paused?'Resume':'Pause'}">${x.paused?IC.play:IC.pause}</button><button class="btn sm ghost tap" data-ta="plus">+1m</button><button class="x tap" data-ta="rm" aria-label="Cancel timer">✕</button>`}</div>`}
function tDraw(full){const L=document.getElementById('tList');if(!L)return;
 if(full||L.children.length!==S.timers.length||!S.timers.length){L.innerHTML=S.timers.length?S.timers.map(tCard).join(''):`<p class="small muted" style="margin:6px 0 0">No timers yet. Pick a preset or type a time.</p>`;return}
 S.timers.forEach(x=>{const c=L.querySelector(`[data-t="${x.id}"]`);if(!c)return;const C=2*Math.PI*26;c.querySelector('.tleft').textContent=x.done?'Done':fmtLeft(x);c.querySelector('.fg').setAttribute('stroke-dashoffset',(C*(x.done?1:1-tLeft(x)/x.dur)).toFixed(1))})}
function swDraw(){const d=document.getElementById('swD');if(!d)return;d.textContent=fmtSW(swNow());const t=swNow(),run=S.sw.run;
 $('#swS').textContent=run?'Stop':t?'Resume':'Start';$('#swS').classList.toggle('stop',run);$('#swL').textContent=run||!t?'Lap':'Reset';$('#swL').disabled=!run&&!t;
 const laps=S.sw.laps,ds=laps.map((v,i)=>v-(laps[i-1]||0)),mn=Math.min(...ds),mx=Math.max(...ds);
 $('#swLaps').innerHTML=(run||t?`<div class="lap cur"><span>Lap ${laps.length+1}</span><span id="swCur">${fmtSW(t-(laps[laps.length-1]||0))}</span></div>`:'')+ds.map((v,i)=>({v,i})).reverse().map(({v,i})=>`<div class="lap ${ds.length>2&&v===mn?'best':''} ${ds.length>2&&v===mx?'worst':''}"><span>Lap ${i+1}</span><span>${fmtSW(v)}</span></div>`).join('')}
let swRaf=0;function swLoop(){swRaf=0;const d=document.getElementById('swD');if(!d||!S.sw.run)return;const t=swNow();d.textContent=fmtSW(t);const c=document.getElementById('swCur');if(c)c.textContent=fmtSW(t-(S.sw.laps[S.sw.laps.length-1]||0));swRaf=requestAnimationFrame(swLoop)}
V.timers=()=>`<section class="phead"><div class="kicker">Tools</div><div class="ptitle">Timers<i>.</i></div></section>
 <div class="grid2"><section class="glass card lens swcard"><div class="kicker">Stopwatch</div><div class="swd" id="swD">00:00.00</div>
 <div class="swbtns"><button class="rk tap" id="swL">Lap</button><button class="rk go tap" id="swS">Start</button></div><div class="laps" id="swLaps"></div></section>
 <section class="glass card"><div class="kicker">Countdown</div><div class="tpre">${[[60,'1m'],[180,'3m'],[300,'5m'],[600,'10m'],[900,'15m'],[1500,'25m']].map(([s,l])=>`<button class="chip tap" data-ts="${s}">${l}</button>`).join('')}</div>
 <form id="tF" style="display:grid;gap:10px;margin-top:14px"><div class="row" style="flex-wrap:nowrap"><input type="text" id="tIn" placeholder="Time, e.g. 7:30, 45s, 1h 20m" autocomplete="off"><button class="btn pri tap" style="flex:none">Start</button></div><input type="text" id="tLbl" placeholder="Label (optional), e.g. Tea" maxlength="40" autocomplete="off"></form>
 <div id="tList" class="tlist"></div></section></div>`;
V.timers.after=()=>{swDraw();tDraw(true);if(S.sw.run)swLoop();
 $('#swS').onclick=()=>{const s=S.sw;if(s.run){s.acc+=Date.now()-s.start;s.run=false}else{s.start=Date.now();s.run=true}save();swDraw();if(s.run)swLoop()};
 $('#swL').onclick=()=>{const s=S.sw;if(s.run){s.laps.push(swNow());if(s.laps.length>99)s.laps.shift()}else{S.sw={run:false,start:0,acc:0,laps:[]}}save();swDraw();if(S.sw.run)swLoop()};
 document.querySelectorAll('[data-ts]').forEach(b=>b.onclick=()=>addTimer(+b.dataset.ts,$('#tLbl').value));
 $('#tF').onsubmit=e=>{e.preventDefault();const sec=parseDur($('#tIn').value);if(!sec)return toast('Try a time like 5, 7:30, 45s or 1h 20m.');addTimer(sec,$('#tLbl').value);$('#tIn').value='';$('#tLbl').value=''};
 $('#tList').onclick=e=>{const b=e.target.closest('[data-ta]');if(!b)return;const id=b.closest('[data-t]').dataset.t,x=S.timers.find(y=>y.id===id);if(!x)return;const a=b.dataset.ta;
  if(a==='rm')S.timers=S.timers.filter(y=>y!==x);else if(a==='pause'){if(x.paused){x.end=Date.now()+x.left;x.paused=false}else{x.left=tLeft(x);x.paused=true}}else if(a==='plus'){if(x.paused)x.left+=6e4;else x.end+=6e4;x.dur+=6e4}else if(a==='again'){audioCtx();x.done=false;x.paused=false;x.end=Date.now()+x.dur}
  save();tDraw(true)}};
