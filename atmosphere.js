/* HQ · an atmosphere that evolves with time, navigation and the current record. */
(()=>{'use strict';
const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),started=Date.now();
const scenes=[
 {name:'Tidal',colors:['#41bfc9','#5593f2','#92d6c0','#929deb']},
 {name:'Apricot',colors:['#f2a168','#e2bd64','#ea96af','#95bbcc']},
 {name:'Iris',colors:['#a099ec','#dd91bf','#719bdc','#80c9cf']},
 {name:'Canopy',colors:['#73c9a3','#c9d376','#5eacc1','#96a6e0']},
 {name:'Afterglow',colors:['#d18daf','#f1b27b','#be9bdc','#729ebd']},
 {name:'Blue hour',colors:['#739ee4','#8fcad7','#af9cde','#d6b4b0']}
];
let offset=Math.floor(Date.now()/60000)%scenes.length,track=null,trackColors=null,artToken=0,layerIndex=0,lastLight=0;
const lights=[0,1].map(()=>{const el=document.createElement('div');el.className='current-light';document.querySelector('.bg').appendChild(el);return el});
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const hex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const blend=(a,b,t)=>hex(rgb(a).map((v,i)=>v+(rgb(b)[i]-v)*t));
function palette(base,now=Date.now()){
 const light=root.dataset.theme==='light',mode=S.settings.atmosphere||'flow',phase=reduce.matches?offset:offset+Math.max(0,now-started)/65000;
 const fixed=scenes.findIndex(s=>s.name.toLowerCase()===mode),i=fixed>=0?fixed:Math.floor(phase)%scenes.length,j=fixed>=0?i:(i+1)%scenes.length,t=fixed>=0?0:phase%1;
 const colors=scenes[i].colors.map((c,k)=>blend(c,scenes[j].colors[k],t*t*(3-2*t)));
 const musical=playing&&trackColors;root.classList.toggle('music-atmosphere',!!musical);
 colors.forEach((c,k)=>{let color=blend(base[k],c,.78);if(musical)color=blend(color,trackColors[k%trackColors.length],.58);root.style.setProperty('--a'+(k+1),light?blend(color,'#ffffff',.35):color);root.style.setProperty('--b'+(k+1),light?blend(colors[(k+1)%4],'#ffffff',.35):colors[(k+1)%4])});
 const tone=musical?blend(colors[0],trackColors[0],.7):colors[0];root.style.setProperty('--tone',tone);root.style.setProperty('--tone2',colors[2]);
 if(now-lastLight>11000){lastLight=now;const next=lights[layerIndex];next.style.background=`radial-gradient(ellipse at 18% 28%,${tone}55,transparent 62%),radial-gradient(ellipse at 82% 76%,${colors[2]}44,transparent 58%)`;next.classList.add('on');lights[1-layerIndex].classList.remove('on');layerIndex=1-layerIndex}
 root.style.setProperty('--ember',blend(tone,light?'#103b35':'#e9f5da',light?.65:.5));root.style.setProperty('--ember2',blend(colors[2],light?'#24483c':'#e9f5da',light?.55:.3));
 root.dataset.atmosphere=musical?'record':scenes[i].name.toLowerCase().replace(' ','-');
 const label=document.getElementById('moodName');if(label)label.textContent=musical?'Record light':scenes[i].name;
}
function music(id){if(!id||id===track)return;track=id;const token=++artToken;
 const hash=[...id].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);trackColors=scenes[hash%scenes.length].colors.slice();
 artPalette(id).then(p=>{if(token!==artToken||!p)return;trackColors=p.cols.map(c=>{const v=c.match(/[\d.]+/g).map(Number),h=v[0],s=v[1]/100,l=v[2]/100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return (l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255};return hex([f(0),f(8),f(4)])});refresh()});refresh();
}
function refresh(){if(typeof bgPalette==='function')bgPalette()}
function panel(){openSheet(`<div class="row between"><div><div class="kicker">LIGHT / IN MOTION</div><h2>Set the atmosphere.</h2></div><button class="iconbtn tap" id="moodClose" aria-label="Close atmosphere">×</button></div><p class="muted small">Flow moves through six colour worlds. Music brings in the colours of the current record.</p><div class="mood-options">${['flow',...scenes.map(s=>s.name.toLowerCase())].map((m,i)=>`<button class="mood-choice tap ${(S.settings.atmosphere||'flow')===m?'on':''}" data-mood="${m}" aria-pressed="${(S.settings.atmosphere||'flow')===m}"><i style="--swatch:${i?scenes[i-1].colors[0]:'#a6bbbf'}"></i>${i?scenes[i-1].name:'Flow'}</button>`).join('')}</div><div class="row between" style="margin-top:20px"><span class="small muted">${reduce.matches?'Reduced motion follows your device setting.':'Slow colour shifts. Always moving.'}</span><button class="btn sm tap" id="moodShuffle">New current ↗</button></div>`,sh=>{sh.querySelector('#moodClose').onclick=closeSheets;sh.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{S.settings.atmosphere=b.dataset.mood;save();refresh();sh.querySelectorAll('[data-mood]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))})});sh.querySelector('#moodShuffle').onclick=()=>{offset=(offset+1)%scenes.length;S.settings.atmosphere='flow';save();refresh();sh.querySelectorAll('[data-mood]').forEach(x=>{x.classList.toggle('on',x.dataset.mood==='flow');x.setAttribute('aria-pressed',String(x.dataset.mood==='flow'))})}})}
window.ATM={palette,music,refresh,panel};
document.getElementById('moodBtn').onclick=panel;
setInterval(()=>{if(!document.hidden&&!reduce.matches)refresh()},12000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
