(()=>{
'use strict';
const KEY='aaravhq:v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=window.PROBLEMS, C=window.CREW;
const LORE=[...LORE_CANON.map(x=>({...x,canon:true})),...LORE_GAGS.map(([w,b],i)=>({t:'Gag #'+(i+1)+' · '+C[w].n,b,w}))];
// ---- IST dates ----
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'});
const today=()=>fmt.format(new Date());
const dnum=d=>Math.floor(Date.parse(d+'T00:00:00Z')/864e5);
const addDays=(d,n)=>new Date((dnum(d)+n)*864e5).toISOString().slice(0,10);
const istHour=()=>+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',hour12:false}).format(new Date())%24;
// ---- state ----
const def=()=>({v:1,daily:{},practice:{n:0,c:0},srs:{},focus:{},sessions:0,quits:0,todos:[],settings:{work:25,brk:5},timer:null,loreSeen:{},hints:0,created:today()});
let S;try{S=Object.assign(def(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=def()}
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
// carry over todos
(function carry(){const t=today();let n=0;S.todos.forEach(x=>{if(!x.done&&x.date<t){x.date=t;x.carried=(x.carried||0)+1;n++}});S.todos=S.todos.filter(x=>!(x.done&&x.date<addDays(t,-60)));save();if(n)setTimeout(()=>toast(`📦 Carried over ${n} unfinished goal${n>1?'s':''}. Vegeta: "Pathetic. Finish them."`),600)})();
// ---- helpers ----
const dailyProblem=(d=today())=>P[((dnum(d)*37)%P.length+P.length)%P.length];
const dailyLore=(d=today())=>LORE[((dnum(d)*5)%LORE.length+LORE.length)%LORE.length];
const byId=id=>P.find(p=>p.id===id);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),3400)}
const say=(w,txt)=>`<div class="quote fade"><div class="ava" style="color:${C[w].c}">${C[w].e}</div><div><div class="who" style="color:${C[w].c}">${C[w].n}</div><p>${esc(txt)}</p></div></div>`;
const pick=a=>a[Math.floor(Math.random()*a.length)];
function activeDays(){const s=new Set();Object.keys(S.daily).forEach(d=>s.add(d));Object.entries(S.focus).forEach(([d,m])=>m>0&&s.add(d));S.todos.forEach(x=>x.done&&x.doneOn&&s.add(x.doneOn));return s}
function streak(set){let d=today(),n=0;if(!set.has(d))d=addDays(d,-1);while(set.has(d)){n++;d=addDays(d,-1)}return n}
function best(set){const a=[...set].sort();let b=0,c=0,p=null;a.forEach(d=>{c=(p&&addDays(p,1)===d)?c+1:1;b=Math.max(b,c);p=d});return b}
const solveSet=()=>new Set(Object.keys(S.daily));
function acc(){const ds=Object.values(S.daily);const n=ds.length+S.practice.n,c=ds.filter(x=>x.correct).length+S.practice.c;return{n,c,p:n?Math.round(100*c/n):0}}
const dueReviews=()=>Object.entries(S.srs).filter(([,v])=>v.due<=today()).map(([id])=>byId(id)).filter(Boolean);
function weekFocus(){const t=today();return Array.from({length:7},(_,i)=>{const d=addDays(t,i-6);return{d,m:S.focus[d]||0}})}
const checkAnswer=(p,v)=>p.type==='mcq'?v===p.ans:Math.abs(parseFloat(v)-p.ans)<=p.tol;
function srsUpdate(p,ok){const t=today(),cur=S.srs[p.id];if(!ok){S.srs[p.id]={due:addDays(t,1),iv:1}}else if(cur){const iv=cur.iv*2;if(iv>8)delete S.srs[p.id];else S.srs[p.id]={due:addDays(t,iv),iv}}}
// ---- views ----
const V={};
V.home=()=>{
 const h=istHour();const g=h<5?['Still up','Night owl mode. Respect, but sleep is a performance-enhancing drug.']:h<12?['Good morning','Fresh brain, fresh physics.']:h<17?['Good afternoon','Peak focus window. Allegedly.']:h<21?['Good evening','Golden hour for problem sets.']:['Good night','One problem, then bed. Grand Priest\u2019s orders.'];
 const t=today(),dp=S.daily[t],td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length,a=acc();
 const L=LINES[(dnum(t)+Math.floor(Date.now()/12e4))%LINES.length];
 return `<section class="glass card"><div class="kicker">${new Date().toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata',weekday:'long',day:'numeric',month:'long'})} · IST</div>
 <h1>${g[0]}, <span class="serif grad">Aarav</span>.</h1><p class="muted" style="margin:10px 0 18px">${g[1]}</p>
 <div class="stats"><div class="tile stat"><b>🔥 ${streak(activeDays())}</b><span>Day streak</span></div><div class="tile stat"><b>⚛️ ${streak(solveSet())}</b><span>Solve streak</span></div><div class="tile stat"><b>${S.focus[t]||0}<small style="font-size:14px">m</small></b><span>Focused today</span></div><div class="tile stat"><b>${a.p}%</b><span>Accuracy (${a.c}/${a.n})</span></div></div></section>
 <section class="glass card" id="crewLine"><div class="kicker">Gang HQ says</div>${say(L[0],L[1])}<div class="row" style="margin-top:14px"><button class="btn" id="nextLine">Another one</button></div></section>
 <div class="grid2">
 <section class="glass card"><div class="kicker">Today's summary</div>
  <div class="row" style="justify-content:space-between"><span>⚛️ Daily problem</span><span class="chip ${dp?(dp.correct?'a':'g'):''}">${dp?(dp.correct?'Solved ✓':'Attempted'):'Pending'}</span></div>
  <div class="row" style="justify-content:space-between;margin-top:10px"><span>✅ Goals</span><span class="chip">${dn}/${td.length}</span></div>
  <div class="row" style="justify-content:space-between;margin-top:10px"><span>🔁 Reviews due</span><span class="chip">${dueReviews().length}</span></div>
  <div class="row" style="justify-content:space-between;margin-top:10px"><span>⏱️ Sessions total</span><span class="chip">${S.sessions}</span></div>
  <div class="row" style="margin-top:16px"><a class="btn pri" href="#problem" style="text-decoration:none">${dp?'Practice more':'Solve today\u2019s problem'}</a><a class="btn" href="#focus" style="text-decoration:none">Start focus</a></div></section>
 <section class="glass card"><div class="kicker">Today's lore drop</div><h3 class="serif" style="font-size:22px;margin-bottom:8px">${esc(dailyLore().t)}</h3><p class="muted" style="margin:0;line-height:1.5">${esc(dailyLore().b.slice(0,140))}…</p><div class="row" style="margin-top:14px"><a class="btn" href="#lore" style="text-decoration:none">Read it</a></div></section>
 </div>`};
V.home.after=()=>{$('#nextLine').onclick=()=>{const L=pick(LINES);$('#crewLine .quote').outerHTML=say(L[0],L[1])}};
// problem
let cur=null,mode='daily',sel=null,hintN=0,answered=false;
function setProblem(p,m){cur=p;mode=m;sel=null;hintN=0;answered=false}
V.problem=()=>{
 const t=today();if(!cur){setProblem(dailyProblem(),'daily')}
 const p=cur,done=mode==='daily'&&S.daily[t];if(done)answered=true;
 const due=dueReviews();
 const lbl={daily:'Daily problem',practice:'Practice',review:'Spaced review'}[mode];
 return `<section class="glass card"><div class="row" style="justify-content:space-between"><div class="row"><span class="chip g">${lbl}</span><span class="chip a">${p.t}</span><span class="chip">${p.type==='mcq'?'MCQ':'Numerical'}</span></div><span class="small muted">Accuracy ${acc().p}% · 🔁 ${due.length} due</span></div>
 <div class="q">${esc(p.q)}</div>
 ${p.type==='mcq'?`<div class="opts">${p.opts.map((o,i)=>`<button class="opt" data-i="${i}">${'ABCD'[i]}. ${esc(o)}</button>`).join('')}</div>`:`<input type="number" step="any" inputmode="decimal" id="numAns" placeholder="Your answer (number)">`}
 <div class="row" style="margin-top:14px"><button class="btn pri" id="submit">Submit</button><button class="btn" id="hint">Hint (${2-hintN} left)</button><button class="btn" id="reveal">Show solution</button></div>
 <div id="hints"></div><div id="result"></div></section>
 <section class="glass card"><h2>Keep going</h2><div class="row"><button class="btn gold" id="more">🎲 Practice more</button><button class="btn" id="rev" ${due.length?'':'disabled style="opacity:.5"'}>🔁 Review missed (${due.length})</button><button class="btn" id="back">📅 Today's problem</button></div><p class="small muted" style="margin-top:12px">Missed problems come back tomorrow, then after 2, 4 and 8 days each time you get them right. Bank: ${P.length} original problems.</p></section>`};
function showResult(ok,given){const p=cur;answered=true;
 if(p.type==='mcq')document.querySelectorAll('.opt').forEach(b=>{const i=+b.dataset.i;if(i===p.ans)b.classList.add('right');else if(i===given)b.classList.add('wrong')});
 const ans=p.type==='mcq'?`${'ABCD'[p.ans]}. ${p.opts[p.ans]}`:p.ans;
 const react=ok?pick([['zeno',':D :D :D'],['gp','Splendid, Aarav. As expected.'],['bulma','Okay, that was actually kinda genius.'],['tony','Not bad. I\u2019d have been faster, but not bad.']]):pick([['vegeta','Wrong. Again. Saiyans don\u2019t lose to a free-body diagram.'],['vados','What a creative interpretation of physics.'],['kusu','That is okay! Mistakes are how brains get big and strong.'],['gp','A minor detour. The universe forgives you. I insist.']]);
 $('#result').innerHTML=`<div class="verdict ${ok?'ok':'bad'}">${ok?'✓ Correct!':'✗ Not quite.'} Answer: ${esc(ans)}</div>${say(react[0],react[1])}<div class="tile sol"><b>Solution</b><ol>${p.s.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
}
V.problem.after=()=>{
 const p=cur,t=today();
 document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.i;document.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel',x===b))});
 const renderHints=()=>{$('#hints').innerHTML=p.h.slice(0,hintN).map((h,i)=>`<div class="tile hint fade">💡 <b>Hint ${i+1}:</b> ${esc(h)}</div>`).join('');$('#hint').textContent=`Hint (${2-hintN} left)`};
 renderHints();
 $('#hint').onclick=()=>{if(hintN<2){hintN++;S.hints++;save();renderHints()}else toast('Bulma: "Out of hints. Use your brain, it\u2019s right there."')};
 $('#submit').onclick=()=>{if(answered)return toast('Already answered. Hit Practice more.');
  const v=p.type==='mcq'?sel:$('#numAns').value.trim();if(v===null||v===''||(p.type==='num'&&isNaN(parseFloat(v))))return toast('Vados: "Answering would help, darling."');
  const ok=checkAnswer(p,v);
  if(mode==='daily'){S.daily[t]={id:p.id,correct:ok,hints:hintN}}else{S.practice.n++;if(ok)S.practice.c++}
  srsUpdate(p,ok);save();showResult(ok,p.type==='mcq'?v:null);updatePill()};
 $('#reveal').onclick=()=>{if(!answered){if(mode==='daily'&&!S.daily[t])S.daily[t]={id:p.id,correct:false,revealed:true};else if(mode!=='daily')S.practice.n++;srsUpdate(p,false);save()}showResult(false,null)};
 $('#more').onclick=()=>{let q;do q=pick(P);while(P.length>1&&q.id===p.id);setProblem(q,'practice');render()};
 $('#rev').onclick=()=>{const d=dueReviews();if(d.length){setProblem(d[0],'review');render()}};
 $('#back').onclick=()=>{setProblem(dailyProblem(),'daily');render()};
 if(mode==='daily'&&S.daily[t]){const r=S.daily[t];showResult(r.correct,null)}
};
// focus
let tick=null,phase='work';
const START=[['tony','Focus mode engaged. JARVIS, block the memes.'],['vegeta','Finally. Don\u2019t embarrass me.'],['gp','I have paused the multiverse for you. Take your time.'],['kusu','Yay! I will be very quiet like a little mouse while you study.'],['zeno',':D']];
const DONE=[['zeno',':D (they clapped. the palace shook.)'],['vegeta','...Acceptable. Do another.'],['bulma','Look at you, being productive. Gross. Proud of you.'],['gp','Magnificent, Aarav. Hohoho.'],['vados','How diligent. Almost suspicious.']];
const QUIT=[['vegeta','You QUIT? A low-class warrior would have finished. Pathetic.'],['vegeta','No. Absolutely not. Get back in there, Kakarot-brain.'],['vegeta','I trained in 450x gravity and you can\u2019t do 25 minutes? Unbelievable.'],['marcarita','Hehe, quitter. I\u2019m telling everyone.'],['vegeta','Pride, Aarav. Where is your Saiyan pride?']];
V.focus=()=>{const st=S.settings,w=weekFocus(),mx=Math.max(30,...w.map(x=>x.m)),tot=w.reduce((a,b)=>a+b.m,0);
 return `<section class="glass card"><div class="row" style="justify-content:space-between"><div class="seg" id="seg"><button data-p="work" class="${phase==='work'?'on':''}">Focus</button><button data-p="brk" class="${phase==='brk'?'on':''}">Break</button></div><span class="chip g">${S.sessions} sessions</span></div>
 <div class="timer"><div class="ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#5ff2e6"/><stop offset="1" stop-color="#a58bff"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="fg" cx="60" cy="60" r="52" stroke-dasharray="326.73" stroke-dashoffset="0"/></svg><div class="t"><div><b id="clock">00:00</b><span id="plabel">${phase==='work'?'Focus':'Break'}</span></div></div></div></div>
 <div class="row" style="justify-content:center"><button class="btn pri" id="go">Start</button><button class="btn danger" id="quit">Quit</button></div>
 <div id="react" style="margin-top:16px"></div></section>
 <div class="grid2"><section class="glass card"><h2>This week · ${tot} min</h2><div class="bars">${w.map(x=>`<div class="${x.d===today()?'today':''}"><span>${x.m}</span><i style="height:${Math.max(3,x.m/mx*80)}px"></i><span>${new Date(x.d).toLocaleDateString('en-IN',{weekday:'short',timeZone:'UTC'})}</span></div>`).join('')}</div><p class="small muted">Today: ${S.focus[today()]||0} min</p></section>
 <section class="glass card"><h2>Lengths</h2><div class="row"><label class="f" style="flex:1">Focus (min)<input type="number" id="lw" min="1" max="180" value="${st.work}"></label><label class="f" style="flex:1">Break (min)<input type="number" id="lb" min="1" max="60" value="${st.brk}"></label></div><div class="row" style="margin-top:12px">${[[25,5],[50,10],[90,15]].map(([a,b])=>`<button class="btn preset" data-w="${a}" data-b="${b}">${a}/${b}</button>`).join('')}</div></section></div>`};
function tmLeft(){const T=S.timer;return T?Math.max(0,Math.round((T.end-Date.now())/1000)):(phase==='work'?S.settings.work:S.settings.brk)*60}
function drawClock(){const c=$('#clock');if(!c)return;const l=tmLeft(),tot=S.timer?S.timer.len*60:(phase==='work'?S.settings.work:S.settings.brk)*60;c.textContent=String(Math.floor(l/60)).padStart(2,'0')+':'+String(l%60).padStart(2,'0');$('#fg').style.strokeDashoffset=(326.73*(1-l/tot)).toFixed(2);$('#go').textContent=S.timer?'Running…':'Start';document.title=S.timer?c.textContent+' · Aarav HQ':'Aarav HQ'}
function finish(){const T=S.timer;S.timer=null;if(T.phase==='work'){const d=today();S.focus[d]=(S.focus[d]||0)+T.len;S.sessions++;phase='brk'}else phase='work';save();const r=pick(DONE);toast(`${C[r[0]].e} ${C[r[0]].n}: ${r[1]}`);try{navigator.vibrate&&navigator.vibrate([80,60,80])}catch(e){}if(location.hash==='#focus')render();updatePill()}
function loop(){clearInterval(tick);tick=setInterval(()=>{if(S.timer&&Date.now()>=S.timer.end)finish();drawClock()},1000)}
V.focus.after=()=>{if(S.timer)phase=S.timer.phase;drawClock();loop();
 document.querySelectorAll('#seg button').forEach(b=>b.onclick=()=>{if(S.timer)return toast('Quit the current timer first.');phase=b.dataset.p;render()});
 $('#go').onclick=()=>{if(S.timer)return;const len=phase==='work'?S.settings.work:S.settings.brk;S.timer={phase,len,start:Date.now(),end:Date.now()+len*6e4};save();drawClock();const r=phase==='work'?pick(START):['kusu','Break time! Please drink some water and look at a tree.'];$('#react').innerHTML=say(r[0],r[1])};
 $('#quit').onclick=()=>{if(!S.timer)return toast('Nothing to quit. Vegeta is disappointed anyway.');const T=S.timer,el=Math.floor((Date.now()-T.start)/6e4);S.timer=null;if(T.phase==='work'){if(el>0){const d=today();S.focus[d]=(S.focus[d]||0)+el}S.quits++}save();const r=T.phase==='work'?pick(QUIT):['vados','Skipping your break? How very\u2026 Vegeta of you.'];render();$('#react').innerHTML=say(r[0],r[1])};
 const upd=()=>{S.settings.work=Math.min(180,Math.max(1,+$('#lw').value||25));S.settings.brk=Math.min(60,Math.max(1,+$('#lb').value||5));save();drawClock()};
 $('#lw').onchange=upd;$('#lb').onchange=upd;
 document.querySelectorAll('.preset').forEach(b=>b.onclick=()=>{$('#lw').value=b.dataset.w;$('#lb').value=b.dataset.b;upd();toast('Tony: "Preset loaded. You\u2019re welcome."')});
 if(S.timer)$('#react').innerHTML=say('gp','Your session continues. I am watching over it.');};
// goals
V.goals=()=>{const t=today(),td=S.todos.filter(x=>x.date===t),dn=td.filter(x=>x.done).length;
 return `<section class="glass card"><div class="kicker">Today · ${dn}/${td.length} done</div><h1 style="font-size:32px">Goals <span class="serif grad">& todos</span></h1>
 <form id="addf" class="row" style="margin-top:16px;flex-wrap:nowrap"><input type="text" id="addt" placeholder="e.g. 20 rotational mechanics PYQs" maxlength="140" autocomplete="off"><button class="btn pri" style="flex:none">Add</button></form>
 <div id="list">${td.length?td.map(x=>`<div class="todo ${x.done?'done':''}" data-id="${x.id}"><button class="check" aria-label="toggle"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="txt">${esc(x.text)}${x.carried?`<span class="carry">↻ carried ${x.carried}×</span>`:''}</span><button class="x" aria-label="delete">✕</button></div>`).join(''):`<p class="muted" style="margin-top:16px">No goals yet. Marcarita says: "Add one or I'll add 'clean your room'."</p>`}</div></section>
 <section class="glass card">${td.length&&dn===td.length?say('zeno',':D (all goals done. everyone else: Silence.)'):say('kusu','Unfinished goals will gently carry over to tomorrow, like a little backpack.')}</section>`};
function burst(el){const r=el.getBoundingClientRect(),cs=['#5ff2e6','#ffd66b','#ff7cc8','#a58bff','#5dfca8'];for(let i=0;i<14;i++){const b=document.createElement('i');b.className='burst';const a=Math.PI*2*i/14,d=40+Math.random()*30;b.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;background:${cs[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--r:${Math.random()*360}deg`;document.body.appendChild(b);setTimeout(()=>b.remove(),850)}}
V.goals.after=()=>{
 $('#addf').onsubmit=e=>{e.preventDefault();const v=$('#addt').value.trim();if(!v)return;S.todos.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:v,done:false,date:today()});save();render();$('#addt').focus()};
 document.querySelectorAll('.todo').forEach(el=>{const x=S.todos.find(y=>y.id===el.dataset.id);
  el.querySelector('.check').onclick=e=>{x.done=!x.done;x.doneOn=x.done?today():null;save();el.classList.toggle('done',x.done);if(x.done){el.classList.add('pop');burst(e.currentTarget);const t=today(),td=S.todos.filter(y=>y.date===t);if(td.every(y=>y.done))setTimeout(()=>{toast('👾 The Zenos: ":D"  (all goals cleared!)');render()},650)}updatePill()};
  el.querySelector('.x').onclick=()=>{S.todos=S.todos.filter(y=>y!==x);save();render()}})};
// lore
V.lore=()=>{const t=today(),L=dailyLore();S.loreSeen[t]=1;save();
 const past=Array.from({length:6},(_,i)=>addDays(t,-(i+1))).map(d=>[d,dailyLore(d)]);
 return `<section class="glass card lore"><div class="row"><span class="chip g">Daily Lore Drop</span>${L.canon?'<span class="chip a">★ Official Canon</span>':''}</div><h3>${esc(L.t)}</h3><p>${esc(L.b)}</p></section>
 <section class="glass card archive"><h2>The Canon</h2>${LORE_CANON.map(x=>`<details class="tile"><summary><b>${esc(x.t)}</b></summary><p style="margin:8px 0 0">${esc(x.b)}</p></details>`).join('')}</section>
 <section class="glass card archive"><h2>Previously on Gang HQ</h2>${past.map(([d,x])=>`<div class="tile"><span class="small muted">${d}</span><br><b>${esc(x.t)}</b><br>${esc(x.b)}</div>`).join('')}<div class="row" style="margin-top:12px"><button class="btn" id="rnd">🎲 Random lore</button></div><div id="rl"></div></section>`};
V.lore.after=()=>{$('#rnd').onclick=()=>{const x=pick(LORE);$('#rl').innerHTML=`<div class="tile fade"><b>${esc(x.t)}</b><br>${esc(x.b)}</div>`}};
// stats
function achievements(){const a=acc(),act=activeDays(),fm=Object.values(S.focus).reduce((x,y)=>x+y,0),td=S.todos.filter(x=>x.done).length,ss=solveSet(),sr=Object.keys(S.srs).length;
 return [
 ['⚛️','Newton Who?','Solve your first problem',a.c>=1],['🎯','Sniper Elite','10 correct answers',a.c>=10],['🧠','Galaxy Brain','50 correct answers',a.c>=50],
 ['🔥','Kamehame-Habit','3-day solve streak',best(ss)>=3],['🌌','Ultra Instinct','7-day solve streak',best(ss)>=7],['👑','Omni King Energy','30-day activity streak',best(act)>=30],
 ['⏱️','Hyperbolic Time Chamber','First focus session',S.sessions>=1],['🏋️','450x Gravity','300 focus minutes',fm>=300],['🧘','Grand Priest Mode','1000 focus minutes',fm>=1000],
 ['✅','Todo Destroyer','Complete 10 goals',td>=10],['📜','Lore Goblin','Read 5 lore drops',Object.keys(S.loreSeen).length>=5],['🚪','Vegeta Is Disappointed','Quit a session early',S.quits>=1],
 ['💡','Hint Merchant','Use 10 hints',S.hints>=10],['🎲','Grind Arc','Do 20 practice problems',S.practice.n>=20],['🔁','Redemption Arc','Clear a review from the queue',S.cleared>=1],['😇','Zeno Approved','Accuracy ≥ 80% over 20+',a.n>=20&&a.p>=80]]}
V.stats=()=>{const act=activeDays(),ss=solveSet(),a=acc(),fm=Object.values(S.focus).reduce((x,y)=>x+y,0),t=today();
 const score=d=>(S.daily[d]?(S.daily[d].correct?2:1):0)+Math.min(2,Math.floor((S.focus[d]||0)/25))+(S.todos.some(x=>x.doneOn===d)?1:0);
 const start=addDays(t,-7*18+1-((dnum(t)+4)%7)+6);const cells=[];for(let d=addDays(t,-((dnum(t)+4)%7)-7*17);d<=t;d=addDays(d,1)){const s=score(d);cells.push(`<i class="l${Math.min(4,s)}" title="${d}: ${s}"></i>`)}
 const ac=achievements();
 return `<section class="glass card"><h1 style="font-size:32px">Power <span class="serif grad">Level</span></h1><div class="stats" style="margin-top:16px">
 <div class="tile stat"><b>${streak(act)}</b><span>Current streak · best ${best(act)}</span></div><div class="tile stat"><b>${streak(ss)}</b><span>Solve streak · best ${best(ss)}</span></div>
 <div class="tile stat"><b>${a.p}%</b><span>Accuracy · ${a.c}/${a.n}</span></div><div class="tile stat"><b>${(fm/60).toFixed(1)}h</b><span>Total focus · ${S.sessions} sessions</span></div></div></section>
 <section class="glass card"><h2>Heatmap · last 18 weeks</h2><div class="heat">${cells.join('')}</div><p class="small muted">Brighter = more physics, focus and goals that day. Gold = absolute unit.</p></section>
 <section class="glass card"><h2>Achievements · ${ac.filter(x=>x[3]).length}/${ac.length}</h2><div class="ach">${ac.map(([e,n,d,u])=>`<div class="tile ${u?'':'lock'}"><div class="e">${e}</div><b>${n}</b><span>${d}</span></div>`).join('')}</div></section>`};
// settings
V.settings=()=>`<section class="glass card"><h1 style="font-size:32px">Settings</h1><p class="muted">All data lives on this device (localStorage). Back it up, Bulma-style.</p>
 <div class="row" style="margin-top:16px"><button class="btn pri" id="exp">⬇️ Export JSON</button><label class="btn" style="cursor:pointer">⬆️ Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn danger" id="rst">🗑️ Reset everything</button></div></section>
 <section class="glass card"><h2>Install Aarav HQ</h2><p class="muted small" style="line-height:1.6">iPhone: open in Safari → Share → <b>Add to Home Screen</b>.<br>Mac: Safari → File → <b>Add to Dock</b>, or Chrome → install icon in the address bar.<br>Works offline after first load.</p>${say('vados','Do make backups. It would be terribly sad to lose everything. For you, I mean.')}</section>`;
V.settings.after=()=>{
 $('#exp').onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`aaravhq-${today()}.json`;document.body.appendChild(a);a.click();a.remove();toast('Exported. Tony: "Stored safer than my suits."')};
 $('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(typeof d!=='object'||!d||d.v!==1)throw 0;S=Object.assign(def(),d);save();toast('Imported! Grand Priest approves.');render()}).catch(()=>toast('Bulma: "That is not a valid backup, genius."'))};
 $('#rst').onclick=()=>{if(confirm('Reset ALL Aarav HQ data? This cannot be undone.')){localStorage.removeItem(KEY);S=def();save();cur=null;toast('Reset. Vegeta: "A fresh start. Don\u2019t waste it."');location.hash='#home';render()}}};
// review-clear tracking
const _srs=srsUpdate;srsUpdate=function(p,ok){const had=!!S.srs[p.id];_srs(p,ok);if(had&&ok&&!S.srs[p.id])S.cleared=(S.cleared||0)+1};
// ---- router ----
function updatePill(){$('#streakPill').textContent='🔥 '+streak(activeDays())}
function render(){const t=(location.hash||'#home').slice(1);const v=V[t]?t:'home';const el=$('#view');el.classList.remove('enter');el.innerHTML=V[v]();void el.offsetWidth;el.classList.add('enter');document.querySelectorAll('#dock a').forEach(a=>a.classList.toggle('on',a.dataset.t===v));V[v].after&&V[v].after();if(v!=='focus'&&!S.timer)clearInterval(tick);updatePill()}
window.addEventListener('hashchange',()=>{if(location.hash==='#problem'&&mode!=='daily'){}render();window.scrollTo({top:0})});
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('paused',document.hidden));
if(S.timer)loop();
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(r=>{window.__swReg=r}).catch(e=>console.warn('SW',e)));
})();
