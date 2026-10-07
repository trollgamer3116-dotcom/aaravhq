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
const def=()=>({v:1,focus:{},sessions:0,todos:[],settings:{work:25,brk:5},timer:null,created:today()});
let S;try{S=Object.assign(def(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=def()}
['daily','practice','srs','loreSeen','hints','quits','cleared'].forEach(k=>delete S[k]);
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
(function carry(){const t=today();let n=0;S.todos.forEach(x=>{if(!x.done&&x.date<t){x.date=t;x.carried=(x.carried||0)+1;n++}});S.todos=S.todos.filter(x=>!(x.done&&x.date<addDays(t,-60)));save();if(n)setTimeout(()=>toast(`Carried over ${n} unfinished goal${n>1?'s':''} from earlier.`),600)})();
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),3000)}
const focusSet=()=>new Set(Object.entries(S.focus).filter(([,m])=>m>0).map(([d])=>d));
function streak(set){let d=today(),n=0;if(!set.has(d))d=addDays(d,-1);while(set.has(d)){n++;d=addDays(d,-1)}return n}
function best(set){const a=[...set].sort();let b=0,c=0,p=null;a.forEach(d=>{c=(p&&addDays(p,1)===d)?c+1:1;b=Math.max(b,c);p=d});return b}
function weekFocus(){const t=today();return Array.from({length:7},(_,i)=>{const d=addDays(t,i-6);return{d,m:S.focus[d]||0}})}
const V={};
V.home=()=>{
 const h=istHour();const g=h<5?'Still up':h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night';
 const t=today(),td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length,wk=weekFocus().reduce((a,b)=>a+b.m,0);
 const d=typeof YTP!=='undefined'&&YTP&&YTP.getVideoData?YTP.getVideoData():null,np=d&&d.video_id;
 return `<section class="glass card"><div class="kicker">${new Date().toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata',weekday:'long',day:'numeric',month:'long'})} · IST</div>
 <h1>${g}, <span class="serif grad">Aarav</span>.</h1>
 <div class="stats" style="margin-top:18px"><div class="tile stat"><b>${S.focus[t]||0}<small style="font-size:14px">m</small></b><span>Focused today</span></div><div class="tile stat"><b>${dn}/${td.length}</b><span>Goals done</span></div><div class="tile stat"><b>${streak(focusSet())}</b><span>Focus streak (days)</span></div><div class="tile stat"><b>${wk}<small style="font-size:14px">m</small></b><span>This week</span></div></div></section>
 <div class="grid2">
 <section class="glass card"><div class="kicker">Today's goals</div>${td.length?td.slice(0,5).map(x=>`<div class="row" style="justify-content:space-between;margin-top:8px"><span style="${x.done?'opacity:.5;text-decoration:line-through':''}">${esc(x.text)}</span><span>${x.done?'✓':''}</span></div>`).join(''):'<p class="muted" style="margin:0">No goals yet.</p>'}
  <div class="row" style="margin-top:16px"><a class="btn pri" href="#focus">Start focus</a><a class="btn" href="#goals">Goals</a></div></section>
 <section class="glass card"><div class="kicker">Now playing</div>${np?`<div class="row" style="flex-wrap:nowrap"><img src="https://i.ytimg.com/vi/${d.video_id}/mqdefault.jpg" alt="" style="width:96px;height:54px;border-radius:12px;object-fit:cover"><div style="min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.title)}</b><span class="small muted">${esc(d.author||'')}</span></div></div>`:'<p class="muted" style="margin:0">Nothing playing.</p>'}
  <div class="row" style="margin-top:16px"><a class="btn" href="#music">Open music</a></div></section></div>`};
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
 <section class="glass card"><h2>Install</h2><p class="muted small" style="line-height:1.6">iPhone: open in Safari → Share → <b>Add to Home Screen</b>.<br>Mac: Safari → File → <b>Add to Dock</b>, or Chrome → install icon in the address bar.<br>Everything except music works offline after first load.</p></section>`;
V.settings.after=()=>{
 $('#exp').onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`aaravhq-${today()}.json`;document.body.appendChild(a);a.click();a.remove();toast('Exported.')};
 $('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(typeof d!=='object'||!d||d.v!==1)throw 0;S=Object.assign(def(),d);save();toast('Imported.');render()}).catch(()=>toast('That file isn\u2019t a valid Aarav HQ backup.'))};
 $('#rst').onclick=()=>{if(confirm('Reset ALL Aarav HQ data? This cannot be undone.')){localStorage.removeItem(KEY);S=def();save();toast('All data reset.');location.hash='#home';render()}}};
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
 $('#mPlay').textContent=playing?'⏸':'▶';const bp=document.getElementById('bigPlay');if(bp)bp.textContent=playing?'⏸ Pause':'▶ Play';
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
 <div class="row" style="margin-top:12px"><button class="btn" id="bPrev">⏮</button><button class="btn pri" id="bigPlay">${playing?'⏸ Pause':'▶ Play'}</button><button class="btn" id="bNext">⏭</button></div>
 <div id="ytErr" class="err" ${ytErr?'':'hidden'}>${ytErr?errHTML():''}</div></section>
 <section class="glass card"><h2>Add to library</h2><form id="addyt" class="row" style="flex-wrap:nowrap"><input type="text" id="ytUrl" placeholder="Paste a YouTube / YT Music video or playlist link" autocomplete="off"><button class="btn pri" style="flex:none">Add</button></form>
 <div class="lib">${S.music.lib.map(x=>`<div class="tile ${x.id===it.id?'on':''}" data-id="${esc(x.id)}"><img src="${esc(x.thumb||(x.type==='video'?thumb(x.id):'icons/icon-192.png'))}" alt="" loading="lazy"><div class="lt"><b>${esc(x.title)}</b><span>${x.type==='playlist'?'Playlist':'Video'}${x.def?' · default':''}</span></div><button class="btn play" style="padding:8px 12px">▶</button>${x.def?'':'<button class="x" aria-label="remove">✕</button>'}</div>`).join('')}</div>
 </section>`};
V.music.after=()=>{placeYT();requestAnimationFrame(placeYT);setTimeout(placeYT,400);setTimeout(placeYT,700);
 $('#bigPlay').onclick=ctl.toggle;$('#bNext').onclick=ctl.next;$('#bPrev').onclick=ctl.prev;
 $('#addyt').onsubmit=e=>{e.preventDefault();const p=parseYT($('#ytUrl').value);if(!p)return toast('That doesn\u2019t look like a YouTube link.');
  if(S.music.lib.some(x=>x.id===p.id&&x.type===p.type)){toast('Already in the library.');return}
  const it={type:p.type,id:p.id,title:p.type==='video'?'Video '+p.id:'Playlist '+p.id,added:Date.now()};S.music.lib.push(it);save();fetchTitle(it);toast('Added to library.');render()};
 document.querySelectorAll('.lib .tile').forEach(el=>{const x=S.music.lib.find(y=>y.id===el.dataset.id);el.querySelector('.play').onclick=()=>playItem(x);const rm=el.querySelector('.x');if(rm)rm.onclick=()=>{S.music.lib=S.music.lib.filter(y=>y!==x);if(S.music.cur===x.id)S.music.cur=S.music.lib[0].id;save();render()}});
 loadYTAPI()};
function updatePill(){$('#streakPill').textContent='🔥 '+streak(focusSet())}
function render(){const t=(location.hash||'#home').slice(1);const v=V[t]?t:'home';const el=$('#view');el.classList.remove('enter');el.innerHTML=V[v]();void el.offsetWidth;el.classList.add('enter');document.querySelectorAll('#dock a').forEach(a=>a.classList.toggle('on',a.dataset.t===v));if(v!=='music')placeYT();V[v].after&&V[v].after();updatePill()}
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0})});
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('paused',document.hidden));
if(S.timer)loop();
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('SW',e)));
})();
