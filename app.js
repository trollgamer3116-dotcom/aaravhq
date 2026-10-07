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
const WMO={0:['Clear','☀︎'],1:['Mostly clear','☀︎'],2:['Partly cloudy','⛅︎'],3:['Overcast','☁︎'],45:['Fog','≋'],48:['Fog','≋'],51:['Drizzle','☂︎'],53:['Drizzle','☂︎'],55:['Drizzle','☂︎'],61:['Light rain','☂︎'],63:['Rain','☂︎'],65:['Heavy rain','☂︎'],71:['Snow','❄︎'],73:['Snow','❄︎'],75:['Heavy snow','❄︎'],80:['Showers','☂︎'],81:['Showers','☂︎'],82:['Heavy showers','☂︎'],95:['Thunderstorm','ϟ'],96:['Thunderstorm','ϟ'],99:['Thunderstorm','ϟ']};
const nowHM=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const blocksFor=d=>S.blocks.filter(b=>b.date===d).sort((x,y)=>x.start.localeCompare(y.start));
function habitStreak(id){let d=today(),n=0;if(!(S.habitLog[d]||{})[id])d=addDays(d,-1);while((S.habitLog[d]||{})[id]){n++;d=addDays(d,-1)}return n}
function wxHTML(){const w=S.wx;if(!w)return `<div class="wx muted small" id="wx">Loading weather…</div>`;const c=WMO[w.code]||['—','·'];
 return `<div class="wx" id="wx"><div><span class="ic">${c[1]}</span><b>${Math.round(w.t)}°</b></div><div class="small muted">${c[0]} · H ${Math.round(w.hi)}° L ${Math.round(w.lo)}°</div><div class="small" style="color:var(--tx3)">${esc(w.place)}${w.stale?' · offline':''}</div></div>`}
let wxBusy=false;
function getPos(){return new Promise(res=>{if(!navigator.geolocation)return res(null);let done=false;const t=setTimeout(()=>{done=true;res(null)},6000);navigator.geolocation.getCurrentPosition(p=>{if(done)return;clearTimeout(t);res({lat:p.coords.latitude,lon:p.coords.longitude,name:'Current location'})},()=>{if(done)return;clearTimeout(t);res(null)},{timeout:6000,maximumAge:18e5})})}
async function loadWeather(force){if(wxBusy)return;if(!force&&S.wx&&Date.now()-S.wx.at<15*6e4&&!S.wx.stale)return;wxBusy=true;
 try{const pos=(await getPos())||S.settings.city;const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`);if(!r.ok)throw 0;const j=await r.json();
  S.wx={t:j.current.temperature_2m,code:j.current.weather_code,hi:j.daily.temperature_2m_max[0],lo:j.daily.temperature_2m_min[0],place:pos.name,at:Date.now()};save()}
 catch(e){if(S.wx){S.wx.stale=true}}
 wxBusy=false;const el=document.getElementById('wx');if(el)el.outerHTML=S.wx?wxHTML():`<div class="wx muted small" id="wx">Weather unavailable</div>`}
V.home=()=>{
 const h=istHour();const g=h<5?'Good night':h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night';
 const t=today(),td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length,wk=weekFocus().reduce((a,b)=>a+b.m,0);
 const d=typeof YTP!=='undefined'&&YTP&&YTP.getVideoData?YTP.getVideoData():null,np=d&&d.video_id;
 const bl=blocksFor(t),hm=nowHM(),up=bl.filter(b=>b.end>hm).slice(0,4);
 const hl=S.habitLog[t]||{};const pins=S.notes.filter(n=>n.pinned).slice(0,3);
 return `<section class="glass card"><div class="hero"><div><div class="clock" id="bigClock">${clockTxt()}</div><div class="muted" style="margin-top:10px;font-size:15px">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div></div>${wxHTML()}</div>
 <h1 style="font-size:22px;margin-top:22px;font-weight:500">${g}, Aarav.</h1>
 <div class="stats" style="margin-top:16px"><div class="tile stat"><b>${S.focus[t]||0}m</b><span>Focus today</span></div><div class="tile stat"><b>${dn}/${td.length}</b><span>Goals</span></div><div class="tile stat"><b>${Object.values(hl).filter(Boolean).length}/${S.habits.length}</b><span>Habits</span></div><div class="tile stat"><b>${wk}m</b><span>This week</span></div></div></section>
 <div class="grid2">
 <section class="glass card"><div class="row" style="justify-content:space-between"><div class="kicker">Up next</div><a class="btn sm ghost" href="#plan">Plan ›</a></div>${up.length?up.map(b=>`<div class="listrow"><span class="time">${b.start}–${b.end}</span><span class="grow ell">${esc(b.title)}</span>${b.start<=hm?'<span class="chip a">Now</span>':''}</div>`).join(''):'<p class="muted small" style="margin:0">Nothing scheduled for the rest of today.</p>'}</section>
 <section class="glass card"><div class="row" style="justify-content:space-between"><div class="kicker">Habits</div><a class="btn sm ghost" href="#habits">All ›</a></div>${S.habits.length?S.habits.map(x=>`<div class="listrow"><button class="check ${hl[x.id]?'on':''}" data-h="${x.id}" aria-label="Toggle ${esc(x.name)}"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="grow ell">${esc(x.name)}</span><span class="small acc">${habitStreak(x.id)}d</span></div>`).join(''):'<p class="muted small" style="margin:0">No habits yet. <a href="#habits">Add one</a>.</p>'}</section>
 <section class="glass card"><div class="row" style="justify-content:space-between"><div class="kicker">Today's goals</div><a class="btn sm ghost" href="#goals">All ›</a></div>${td.length?td.slice(0,5).map(x=>`<div class="listrow"><span class="grow ell" style="${x.done?'color:var(--tx3);text-decoration:line-through':''}">${esc(x.text)}</span>${x.done?'<span class="acc">✓</span>':''}</div>`).join(''):'<p class="muted small" style="margin:0">No goals yet. Tap + to capture one.</p>'}
  <div class="row" style="margin-top:14px"><a class="btn pri" href="#focus">Start focus</a></div></section>
 <section class="glass card"><div class="kicker">Now playing</div>${np?`<div class="row" style="flex-wrap:nowrap"><img src="https://i.ytimg.com/vi/${d.video_id}/mqdefault.jpg" alt="" style="width:88px;height:50px;border-radius:10px;object-fit:cover"><div style="min-width:0"><b class="ell" style="display:block;font-weight:500">${esc(d.title)}</b><span class="small muted">${esc(d.author||'')}</span></div></div>`:'<p class="muted small" style="margin:0">Nothing playing.</p>'}
  <div class="row" style="margin-top:14px"><a class="btn" href="#music">Open Music</a></div>
  ${pins.length?`<div class="kicker" style="margin-top:20px">Pinned notes</div>${pins.map(n=>`<div class="listrow"><span class="grow ell">${esc(n.text.split('\n')[0])}</span></div>`).join('')}`:''}</section></div>`};
function clockTxt(){const d=new Date();let h=d.getHours(),m=String(d.getMinutes()).padStart(2,'0');const ap=h<12?'AM':'PM';h=h%12||12;return `${h}:${m}<small>${ap}</small>`}
V.home.after=()=>{loadWeather();document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{toggleHabit(b.dataset.h,today());render()})};
setInterval(()=>{const c=document.getElementById('bigClock');if(c){const t=clockTxt();if(c.innerHTML!==t)c.innerHTML=t}},1000);
function toggleHabit(id,d){const l=S.habitLog[d]||(S.habitLog[d]={});if(l[id])delete l[id];else l[id]=true;save()}
// ---- PLAN ----
let planDay=null;
V.plan=()=>{const t=today();planDay=planDay||t;const bl=blocksFor(planDay),hm=nowHM(),isT=planDay===t;
 const lbl=isT?'Today':planDay===addDays(t,1)?'Tomorrow':planDay===addDays(t,-1)?'Yesterday':new Date(planDay+'T12:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
 const nperm=('Notification' in window)?Notification.permission:'unsupported';
 return `<section class="glass card"><div class="row" style="justify-content:space-between"><div><div class="kicker">Schedule</div><h1>${lbl}</h1></div><div class="row"><button class="btn sm" id="pPrev" aria-label="Previous day">‹</button><button class="btn sm" id="pToday">Today</button><button class="btn sm" id="pNext" aria-label="Next day">›</button></div></div>
 <div id="blocks" style="margin-top:14px">${bl.length?bl.map(b=>`<div class="tile block ${isT&&b.end<=hm?'past':''} ${isT&&b.start<=hm&&b.end>hm?'now':''}"><span class="time">${b.start}–${b.end}</span><span style="flex:1;min-width:0;overflow-wrap:anywhere">${esc(b.title)}</span>${b.remind?'<span class="chip a" title="Reminder on">Reminder</span>':''}<button class="x" data-del="${b.id}" aria-label="Delete">✕</button></div>`).join(''):'<p class="muted">No blocks yet. Add your first time block below.</p>'}</div></section>
 <section class="glass card"><h2>Add a block</h2><form id="bForm" style="display:grid;gap:10px"><input type="text" id="bTitle" placeholder="e.g. Mechanics revision" maxlength="100" required>
 <div class="row" style="flex-wrap:nowrap"><label class="f" style="flex:1">Start<input type="time" id="bStart" required></label><label class="f" style="flex:1">End<input type="time" id="bEnd" required></label></div>
 <label class="row small muted" style="gap:8px"><input type="checkbox" id="bRem"> Remind me ${S.settings.remindMin} min before</label>
 <div class="row"><button class="btn pri">Add block</button></div></form>
 <p class="small muted" style="margin:14px 0 0">${nperm==='unsupported'?'Reminders aren\u2019t supported in this browser.':nperm==='granted'?'Reminders are on. They fire while Aarav HQ is open (or installed and running in the background).':nperm==='denied'?'Notifications are blocked. Enable them in your browser or system settings to get reminders.':'<button class="btn sm" id="nPerm">Enable notifications</button> to get reminders.'}</p></section>`};
V.plan.after=()=>{const t=today();
 $('#pPrev').onclick=()=>{planDay=addDays(planDay,-1);render()};$('#pNext').onclick=()=>{planDay=addDays(planDay,1);render()};$('#pToday').onclick=()=>{planDay=t;render()};
 const bl=blocksFor(planDay),last=bl[bl.length-1];const st=last?last.end:(planDay===t?nowHM().slice(0,3)+'00':'09:00');$('#bStart').value=st;const [H,M]=st.split(':').map(Number);$('#bEnd').value=String(Math.min(23,H+1)).padStart(2,'0')+':'+String(M).padStart(2,'0');
 $('#bForm').onsubmit=e=>{e.preventDefault();const s=$('#bStart').value,en=$('#bEnd').value,ti=$('#bTitle').value.trim();if(!ti||!s||!en)return;if(en<=s)return toast('End time must be after the start time.');
  const rem=$('#bRem').checked;S.blocks.push({id:uid(),date:planDay,start:s,end:en,title:ti,remind:rem});save();if(rem)askNotify();render()};
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.blocks=S.blocks.filter(x=>x.id!==b.dataset.del);save();render()});
 const np=document.getElementById('nPerm');if(np)np.onclick=()=>askNotify().then(render)};
function askNotify(){if(!('Notification' in window)||Notification.permission!=='default')return Promise.resolve();return Notification.requestPermission().catch(()=>{})}
function notify(title,body){try{if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:title+body}));else new Notification(title,{body,icon:'icons/icon-192.png'})}catch(e){}}
function checkReminders(){if(!('Notification' in window)||Notification.permission!=='granted')return;const t=today(),now=Date.now();let ch=false;
 S.blocks.forEach(b=>{if(b.date!==t||!b.remind||b.notified)return;const at=new Date(`${b.date}T${b.start}:00`).getTime()-S.settings.remindMin*6e4;if(now>=at&&now<at+30*6e4){notify(b.title,`Starts at ${b.start}`);b.notified=true;ch=true}});if(ch)save()}
setInterval(checkReminders,20000);setTimeout(checkReminders,2000);
// ---- HABITS ----
V.habits=()=>{const t=today(),days=Array.from({length:7},(_,i)=>addDays(t,i-6));
 return `<section class="glass card"><div class="kicker">Last 7 days</div><h1>Habits</h1>
 <div style="margin-top:16px;overflow-x:auto">${S.habits.length?`<div class="hab head"><span></span>${days.map(d=>`<span>${new Date(d+'T12:00Z').toLocaleDateString('en-IN',{weekday:'narrow',timeZone:'UTC'})}</span>`).join('')}<span>Streak</span></div>`+S.habits.map(x=>`<div class="hab"><span class="n ell">${esc(x.name)}</span>${days.map(d=>`<button class="check ${(S.habitLog[d]||{})[x.id]?'on':''}" data-h="${x.id}" data-d="${d}" aria-label="${esc(x.name)} ${d}"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`).join('')}<span class="sk">${habitStreak(x.id)}d</span></div>`).join(''):'<p class="muted">Track small daily wins: read 20 pages, drink water, revise formulas.</p>'}</div></section>
 <section class="glass card"><h2>Add a habit</h2><form id="hForm" class="row" style="flex-wrap:nowrap"><input type="text" id="hName" placeholder="e.g. Revise formulas" maxlength="60"><button class="btn pri" style="flex:none">Add</button></form>
 ${S.habits.length?`<div style="margin-top:12px">${S.habits.map(x=>`<div class="listrow"><span class="grow ell">${esc(x.name)}</span><span class="small muted">best ${bestHabit(x.id)}d</span><button class="x" data-rm="${x.id}" aria-label="Remove">✕</button></div>`).join('')}</div>`:''}</section>`};
function bestHabit(id){return best(new Set(Object.entries(S.habitLog).filter(([,l])=>l[id]).map(([d])=>d)))}
V.habits.after=()=>{$('#hForm').onsubmit=e=>{e.preventDefault();const n=$('#hName').value.trim();if(!n)return;S.habits.push({id:uid(),name:n});save();render()};
 document.querySelectorAll('.hab [data-h]').forEach(b=>b.onclick=()=>{toggleHabit(b.dataset.h,b.dataset.d);b.classList.toggle('on');if(b.classList.contains('on')){b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),500)}const sk=b.parentElement.querySelector('.sk');sk.textContent=habitStreak(b.dataset.h)+'d'});
 document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{if(!confirm('Remove this habit and its history?'))return;const id=b.dataset.rm;S.habits=S.habits.filter(x=>x.id!==id);Object.values(S.habitLog).forEach(l=>delete l[id]);save();render()})};
// ---- NOTES ----
let noteQ='',editId=null;
V.notes=()=>{const q=noteQ.toLowerCase();const list=S.notes.filter(n=>!q||n.text.toLowerCase().includes(q)).sort((a,b)=>(b.pinned-a.pinned)||(b.updated-a.updated));
 return `<section class="glass card"><div class="row" style="justify-content:space-between"><h1>Notes</h1><span class="chip">${S.notes.length}</span></div>
 <form id="nForm" style="margin-top:14px;display:grid;gap:10px"><textarea id="nText" placeholder="Write a quick note…" rows="3"></textarea><div class="row" style="justify-content:flex-end"><button class="btn pri">Save note</button></div></form></section>
 <section class="glass card"><input type="search" id="nQ" placeholder="Search notes" value="${esc(noteQ)}" autocomplete="off"><div id="nList">${list.length?list.map(n=>n.id===editId?`<div class="tile note"><textarea id="eText" rows="4">${esc(n.text)}</textarea><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn sm ghost" id="eCancel">Cancel</button><button class="btn sm pri" id="eSave">Save</button></div></div>`:`<div class="tile note ${n.pinned?'pinned':''}" data-id="${n.id}"><p>${esc(n.text)}</p><div class="meta"><span>${n.pinned?'Pinned · ':''}${new Date(n.updated).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</span><span class="row" style="gap:4px"><button class="btn sm ghost" data-pin>${n.pinned?'Unpin':'Pin'}</button><button class="btn sm ghost" data-edit>Edit</button><button class="x" data-del aria-label="Delete">✕</button></span></div></div>`).join(''):`<p class="muted small" style="margin:14px 0 0">${q?'No notes match your search.':'No notes yet.'}</p>`}</div></section>`};
V.notes.after=()=>{
 $('#nForm').onsubmit=e=>{e.preventDefault();const v=$('#nText').value.trim();if(!v)return;S.notes.push({id:uid(),text:v,pinned:false,created:Date.now(),updated:Date.now()});save();render()};
 const q=$('#nQ');q.oninput=()=>{noteQ=q.value;const p=q.selectionStart;render();const n=$('#nQ');n.focus();n.setSelectionRange(p,p)};
 document.querySelectorAll('.note[data-id]').forEach(el=>{const n=S.notes.find(x=>x.id===el.dataset.id);
  el.querySelector('[data-pin]').onclick=()=>{n.pinned=!n.pinned;save();render()};
  el.querySelector('[data-edit]').onclick=()=>{editId=n.id;render();$('#eText').focus()};
  el.querySelector('[data-del]').onclick=()=>{if(confirm('Delete this note?')){S.notes=S.notes.filter(x=>x!==n);save();render()}}});
 const es=document.getElementById('eSave');if(es){es.onclick=()=>{const n=S.notes.find(x=>x.id===editId),v=$('#eText').value.trim();if(n&&v){n.text=v;n.updated=Date.now();save()}editId=null;render()};$('#eCancel').onclick=()=>{editId=null;render()}}};
// ---- MORE ----
V.more=()=>`<section class="glass card"><h1>More</h1><div class="menu" style="margin-top:12px">
 ${[['goals','✓','Goals',`${S.todos.filter(x=>x.date===today()&&!x.done).length} open`],['notes','✎','Notes',S.notes.length],['habits','◎','Habits',S.habits.length],['stats','▤','Stats',''],['settings','⚙︎','Settings','']].map(([h,i,n,c])=>`<a href="#${h}"><span class="i">${i}</span>${n}<em>${c} ›</em></a>`).join('')}</div></section>`;
let tick=null,phase='work';
V.focus=()=>{const st=S.settings,w=weekFocus(),mx=Math.max(30,...w.map(x=>x.m)),tot=w.reduce((a,b)=>a+b.m,0);
 return `<section class="glass card"><div class="row" style="justify-content:space-between"><div class="seg" id="seg"><button data-p="work" class="${phase==='work'?'on':''}">Focus</button><button data-p="brk" class="${phase==='brk'?'on':''}">Break</button></div><span class="chip g">${S.sessions} sessions</span></div>
 <div class="timer"><div class="ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#5ff2e6"/><stop offset="1" stop-color="#a58bff"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="fg" cx="60" cy="60" r="52" stroke-dasharray="326.73" stroke-dashoffset="0"/></svg><div class="t"><div><b id="clock">00:00</b><span>${phase==='work'?'Focus':'Break'}</span></div></div></div></div>
 <div class="row" style="justify-content:center"><button class="btn pri" id="go">Start</button><button class="btn danger" id="quit">Stop</button></div><p id="react" class="small muted" style="text-align:center;margin:12px 0 0"></p></section>
 <div class="grid2"><section class="glass card"><h2>This week · ${tot} min</h2><div class="bars">${w.map(x=>`<div class="${x.d===today()?'today':''}"><span>${x.m}</span><i style="height:${Math.max(3,x.m/mx*80)}px"></i><span>${new Date(x.d).toLocaleDateString('en-IN',{weekday:'short',timeZone:'UTC'})}</span></div>`).join('')}</div><p class="small muted">Today: ${S.focus[today()]||0} min</p></section>
 <section class="glass card"><h2>Lengths</h2><div class="row"><label class="f" style="flex:1">Focus (min)<input type="number" id="lw" min="1" max="180" value="${st.work}"></label><label class="f" style="flex:1">Break (min)<input type="number" id="lb" min="1" max="60" value="${st.brk}"></label></div><div class="row" style="margin-top:12px">${[[25,5],[50,10],[90,15]].map(([a,b])=>`<button class="btn preset" data-w="${a}" data-b="${b}">${a}/${b}</button>`).join('')}</div></section></div>`};
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
 return `<section class="glass card"><div class="kicker">Today · ${dn}/${td.length} done</div><h1 style="font-size:32px"><span class="grad">Goals</span></h1>
 <form id="addf" class="row" style="margin-top:16px;flex-wrap:nowrap"><input type="text" id="addt" placeholder="Add a goal for today" maxlength="140" autocomplete="off"><button class="btn pri" style="flex:none">Add</button></form>
 <div id="list">${td.length?td.map(x=>`<div class="todo ${x.done?'done':''}" data-id="${x.id}"><button class="check" aria-label="toggle"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="txt">${esc(x.text)}${x.carried?`<span class="carry">↻ carried ${x.carried}×</span>`:''}</span><button class="x" aria-label="delete">✕</button></div>`).join(''):`<p class="muted" style="margin-top:16px">No goals yet. Unfinished goals carry over to the next day.</p>`}</div></section>`};
function burst(el){const r=el.getBoundingClientRect(),cs=['#5ff2e6','#ffd66b','#ff7cc8','#a58bff','#5dfca8'];for(let i=0;i<14;i++){const b=document.createElement('i');b.className='burst';const a=Math.PI*2*i/14,d=40+Math.random()*30;b.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;background:${cs[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--r:${Math.random()*360}deg`;document.body.appendChild(b);setTimeout(()=>b.remove(),850)}}
V.goals.after=()=>{
 $('#addf').onsubmit=e=>{e.preventDefault();const v=$('#addt').value.trim();if(!v)return;S.todos.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:v,done:false,date:today()});save();render();$('#addt').focus()};
 document.querySelectorAll('.todo').forEach(el=>{const x=S.todos.find(y=>y.id===el.dataset.id);
  el.querySelector('.check').onclick=e=>{x.done=!x.done;x.doneOn=x.done?today():null;save();el.classList.toggle('done',x.done);if(x.done){el.classList.add('pop');burst(e.currentTarget)}$('.kicker').textContent=`Today · ${S.todos.filter(y=>y.date===today()&&y.done).length}/${S.todos.filter(y=>y.date===today()).length} done`};
  el.querySelector('.x').onclick=()=>{S.todos=S.todos.filter(y=>y!==x);save();render()}})};
V.stats=()=>{const fs=focusSet(),t=today(),fm=Object.values(S.focus).reduce((x,y)=>x+y,0),gd=S.todos.filter(x=>x.done).length;
 const lvl=m=>m<=0?0:m<25?1:m<60?2:m<120?3:4;const cells=[];for(let d=addDays(t,-((dnum(t)+4)%7)-7*17);d<=t;d=addDays(d,1))cells.push(`<i class="l${lvl(S.focus[d]||0)}" title="${d}: ${S.focus[d]||0} min"></i>`);
 return `<section class="glass card"><h1 style="font-size:32px"><span class="grad">Stats</span></h1><div class="stats" style="margin-top:16px">
 <div class="tile stat"><b>${streak(fs)}</b><span>Focus streak · best ${best(fs)}</span></div><div class="tile stat"><b>${(fm/60).toFixed(1)}h</b><span>Total focus</span></div>
 <div class="tile stat"><b>${S.sessions}</b><span>Sessions completed</span></div><div class="tile stat"><b>${gd}</b><span>Goals completed</span></div></div></section>
 <section class="glass card"><h2>Focus heatmap · last 18 weeks</h2><div class="heat">${cells.join('')}</div><p class="small muted">Less <i class="hk"></i><i class="hk l1"></i><i class="hk l2"></i><i class="hk l3"></i><i class="hk l4"></i> More (25 / 60 / 120+ min)</p></section>`};
V.settings=()=>`<section class="glass card"><h1 style="font-size:32px">Settings</h1><p class="muted">All data is stored on this device (localStorage).</p>
 <div class="row" style="margin-top:16px"><button class="btn pri" id="exp">Export JSON</button><label class="btn" style="cursor:pointer">Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn danger" id="rst">Reset everything</button></div></section>
 <section class="glass card"><h2>Appearance</h2><div class="seg" id="thSeg">${['system','light','dark'].map(x=>`<button data-th="${x}" class="${S.settings.theme===x?'on':''}">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div></section>
 <section class="glass card"><h2>Weather location</h2><p class="small muted" style="margin:0 0 10px">Used when location access is unavailable. Current: <b>${esc(S.settings.city.name)}</b></p><form id="cityF" class="row" style="flex-wrap:nowrap"><input type="text" id="cityI" placeholder="City name" value="${esc(S.settings.city.name)}"><button class="btn pri" style="flex:none">Save</button></form></section>
 <section class="glass card"><h2>Reminders</h2><label class="f">Remind before a block (minutes)<input type="number" id="remM" min="0" max="120" value="${S.settings.remindMin}"></label></section>
 <section class="glass card"><h2>Install</h2><p class="muted small" style="line-height:1.6">iPhone: open in Safari → Share → <b>Add to Home Screen</b>.<br>Mac: Safari → File → <b>Add to Dock</b>, or Chrome → install icon in the address bar.<br>Everything except music and live weather works offline after the first load.</p></section>`;
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
 const nt=document.getElementById('nowT');if(nt&&d)nt.textContent=d.title||'';}
function placeYT(){const w=$('#ytWrap'),slot=document.getElementById('vidslot');if(!slot){w.classList.add('off');w.style.cssText='';return}
 const r=slot.getBoundingClientRect();w.classList.remove('off');w.style.cssText=`left:${r.left+scrollX}px;top:${r.top+scrollY}px;width:${r.width}px;height:${r.height}px`}
addEventListener('resize',placeYT);
const ctl={toggle(){if(!ytReady){playItem(curItem());return}playing?YTP.pauseVideo():YTP.playVideo()},next(){if(!ytReady)return;const it=curItem();if(it.type==='playlist'||YTP.getPlaylist&&YTP.getPlaylist())YTP.nextVideo();else toast('This is a single video, so there\u2019s no next track.')},prev(){if(!ytReady)return;if(YTP.getPlaylist&&YTP.getPlaylist()&&YTP.getPlaylistIndex()>0)YTP.previousVideo();else YTP.seekTo(0,true)}};
$('#mPlay').onclick=ctl.toggle;$('#mNext').onclick=ctl.next;$('#mPrev').onclick=ctl.prev;
setInterval(()=>{if(ytReady)updMini()},2000);
async function fetchTitle(it){try{const url=it.type==='video'?'https://www.youtube.com/watch?v='+it.id:'https://www.youtube.com/playlist?list='+it.id;const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url));if(!r.ok)return;const j=await r.json();if(j.title){it.title=j.title;it.thumb=j.thumbnail_url;save();if(location.hash==='#music')render()}}catch(e){}}
V.music=()=>{const it=curItem();return `<section class="glass card"><div class="row" style="justify-content:space-between"><div><div class="kicker">Now playing</div><h1 style="font-size:32px"><span class="grad">Music</span></h1></div><span class="chip a">${it.type==='playlist'?'Playlist':'Video'}</span></div>
 <div id="vidslot" class="vidslot" style="margin-top:14px">${ytReady?'':'Tap play to start.'}</div>
 <p class="small muted" id="nowT" style="margin:10px 0 0">${esc(it.title)}</p>
 <div class="row" style="margin-top:12px"><button class="btn" id="bPrev" aria-label="Previous">${IC.prev}</button><button class="btn pri" id="bigPlay">${playing?IC.pause+' Pause':IC.play+' Play'}</button><button class="btn" id="bNext" aria-label="Next">${IC.next}</button></div>
 <div id="ytErr" class="err" ${ytErr?'':'hidden'}>${ytErr?errHTML():''}</div></section>
 <section class="glass card"><h2>Add to library</h2><form id="addyt" class="row" style="flex-wrap:nowrap"><input type="text" id="ytUrl" placeholder="Paste a YouTube / YT Music video or playlist link" autocomplete="off"><button class="btn pri" style="flex:none">Add</button></form>
 <div class="lib">${S.music.lib.map(x=>`<div class="tile ${x.id===it.id?'on':''}" data-id="${esc(x.id)}"><img src="${esc(x.thumb||(x.type==='video'?thumb(x.id):'icons/icon-192.png'))}" alt="" loading="lazy"><div class="lt"><b>${esc(x.title)}</b><span>${x.type==='playlist'?'Playlist':'Video'}${x.def?' · default':''}</span></div><button class="btn play sm" aria-label="Play">${IC.play}</button>${x.def?'':'<button class="x" aria-label="remove">✕</button>'}</div>`).join('')}</div>
 </section>`};
V.music.after=()=>{placeYT();requestAnimationFrame(placeYT);setTimeout(placeYT,400);setTimeout(placeYT,700);
 $('#bigPlay').onclick=ctl.toggle;$('#bNext').onclick=ctl.next;$('#bPrev').onclick=ctl.prev;
 $('#addyt').onsubmit=e=>{e.preventDefault();const p=parseYT($('#ytUrl').value);if(!p)return toast('That doesn\u2019t look like a YouTube link.');
  if(S.music.lib.some(x=>x.id===p.id&&x.type===p.type)){toast('Already in the library.');return}
  const it={type:p.type,id:p.id,title:p.type==='video'?'Video '+p.id:'Playlist '+p.id,added:Date.now()};S.music.lib.push(it);save();fetchTitle(it);toast('Added to library.');render()};
 document.querySelectorAll('.lib .tile').forEach(el=>{const x=S.music.lib.find(y=>y.id===el.dataset.id);el.querySelector('.play').onclick=()=>playItem(x);const rm=el.querySelector('.x');if(rm)rm.onclick=()=>{S.music.lib=S.music.lib.filter(y=>y!==x);if(S.music.cur===x.id)S.music.cur=S.music.lib[0].id;save();render()}});
 loadYTAPI()};
function updatePill(){const n=streak(focusSet());$('#streakPill').textContent=n?n+'-day focus streak':'No streak yet'}
const mq=matchMedia('(prefers-color-scheme: light)');
function applyTheme(){const t=S.settings.theme,eff=t==='system'?(mq.matches?'light':'dark'):t;document.documentElement.dataset.theme=eff;$('#themeBtn').textContent=t==='system'?'◐':eff==='light'?'☀︎':'☾';$('#themeBtn').title='Theme: '+t}
mq.addEventListener&&mq.addEventListener('change',()=>S.settings.theme==='system'&&applyTheme());
$('#themeBtn').onclick=()=>{const o=['system','light','dark'];S.settings.theme=o[(o.indexOf(S.settings.theme)+1)%3];save();applyTheme();toast('Theme: '+S.settings.theme[0].toUpperCase()+S.settings.theme.slice(1));if(location.hash==='#settings')render()};
applyTheme();
let qcKind='goal';
function qc(open){$('#sheet').classList.toggle('on',open);$('#scrim').classList.toggle('on',open);if(open)setTimeout(()=>$('#qcText').focus(),80)}
$('#qcBtn').onclick=()=>qc(true);$('#scrim').onclick=()=>qc(false);$('#qcCancel').onclick=()=>qc(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')qc(false)});
document.querySelectorAll('#qcSeg button').forEach(b=>b.onclick=()=>{qcKind=b.dataset.k;document.querySelectorAll('#qcSeg button').forEach(x=>x.classList.toggle('on',x===b))});
$('#qcForm').onsubmit=e=>{e.preventDefault();const v=$('#qcText').value.trim();if(!v)return;if(qcKind==='goal')S.todos.push({id:uid(),text:v.slice(0,140),done:false,date:today()});else S.notes.push({id:uid(),text:v,pinned:false,created:Date.now(),updated:Date.now()});save();$('#qcText').value='';qc(false);toast(qcKind==='goal'?'Goal added to today.':'Note saved.');render()};
const TABOF={goals:'more',notes:'more',habits:'more',stats:'more',settings:'more'};
function render(){const t=(location.hash||'#home').slice(1);const v=V[t]?t:'home';const el=$('#view');el.classList.remove('enter');el.innerHTML=V[v]();void el.offsetWidth;el.classList.add('enter');document.querySelectorAll('#dock a').forEach(a=>a.classList.toggle('on',a.dataset.t===(TABOF[v]||v)));if(v!=='music')placeYT();V[v].after&&V[v].after();updatePill()}
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0})});
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('paused',document.hidden));
if(S.timer)loop();
if(!S.wx||Date.now()-S.wx.at>15*6e4)loadWeather();
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('SW',e)));
})();
