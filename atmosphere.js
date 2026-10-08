/* HQ · colour follows touch, scroll, navigation and the current record. */
(()=>{'use strict';
const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[
 {name:'Tidal',colors:['#23d9d1','#458dff','#81e7b2','#a595ff']},
 {name:'Apricot',colors:['#ff965c','#ffd365','#ff91b9','#72cddd']},
 {name:'Iris',colors:['#b491ff','#fb82cb','#649dff','#71e2db']},
 {name:'Canopy',colors:['#56dfa1','#d5e765','#41c4cc','#95aaff']},
 {name:'Afterglow',colors:['#f080b6','#ffbb69','#c493ff','#63b9db']},
 {name:'Blue hour',colors:['#5c91ff','#77d5ed','#ae8dff','#efb5c2']}
];
let offset=0,scrollMix=0,interaction=0,scrollTimer=0,scrollBand=0,track=null,trackColors=null,artToken=0,lastLight=-1,lastSignature=null;
const lights=[0,1].map(()=>{const el=document.createElement('div');el.className='current-light';document.querySelector('.bg').appendChild(el);return el});
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const hex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const blend=(a,b,t)=>hex(rgb(a).map((v,i)=>v+(rgb(b)[i]-v)*t));
function palette(base,now=Date.now()){
 const light=root.dataset.theme==='light',mode=S.settings.atmosphere||'flow',phase=offset+scrollMix;
 const fixed=scenes.findIndex(s=>s.name.toLowerCase()===mode),i=fixed>=0?fixed:Math.floor(phase)%scenes.length,j=fixed>=0?i:(i+1)%scenes.length,t=fixed>=0?0:phase%1;
 const colors=scenes[i].colors.map((c,k)=>blend(c,scenes[j].colors[k],t*t*(3-2*t)));
 const musical=playing&&trackColors;
 const tone=musical?blend(colors[0],trackColors[0],.7):colors[0];
 root.dataset.atmosphere=musical?'record':scenes[i].name.toLowerCase().replace(' ','-');
 const label=document.getElementById('moodName');if(label)label.textContent=musical?'Record light':scenes[i].name;
 const button=document.getElementById('moodBtn');if(button)button.title=fixed>=0?scenes[i].name+' · pinned':'Touch & flow · use the spectrum or explore another space';
 document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.scene===i)));
 const signature=JSON.stringify([light,base,colors,musical?trackColors:null]);
 if(signature===lastSignature)return;lastSignature=signature;
 root.classList.toggle('music-atmosphere',!!musical);
 colors.forEach((c,k)=>{let color=blend(base[k],c,.78);if(musical)color=blend(color,trackColors[k%trackColors.length],.58);root.style.setProperty('--a'+(k+1),light?blend(color,'#ffffff',.35):color);root.style.setProperty('--b'+(k+1),light?blend(colors[(k+1)%4],'#ffffff',.35):colors[(k+1)%4])});
 root.style.setProperty('--tone',tone);root.style.setProperty('--tone2',colors[2]);
 // Paint only the incoming layer; the transition itself uses composited opacity.
 const incoming=(lastLight+1)%2;
 lights[incoming].style.background=`radial-gradient(ellipse at 12% 20%,${tone}${light?'60':'80'},transparent 62%),radial-gradient(ellipse at 88% 78%,${colors[2]}${light?'50':'73'},transparent 60%)`;
 lights[incoming].classList.add('on');if(lastLight>=0)lights[lastLight].classList.remove('on');lastLight=incoming;
 root.style.setProperty('--ember',blend(tone,light?'#103b35':'#edf2ff',light?.65:.38));root.style.setProperty('--ember2',blend(colors[2],light?'#24483c':'#edf2ff',light?.55:.28));

}
function music(id){if(!id||id===track)return;track=id;const token=++artToken;
 const hash=[...id].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);trackColors=scenes[hash%scenes.length].colors.slice();
 artPalette(id).then(p=>{if(token!==artToken||!p)return;trackColors=p.cols.map(c=>{const v=c.match(/[\d.]+/g).map(Number),h=v[0],s=v[1]/100,l=v[2]/100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return (l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255};return hex([f(0),f(8),f(4)])});refresh()});refresh();
}
function refresh(){if(typeof bgPalette==='function')bgPalette()}
function panel(){openSheet(`<div class="row between"><div><div class="kicker">LIGHT / IN MOTION</div><h2>Set the atmosphere.</h2></div><button class="iconbtn tap" id="moodClose" aria-label="Close atmosphere">×</button></div><p class="muted small">Choose Touch & flow for colours you can change with the home spectrum. Exploring a new section or finishing a longer scroll shifts the light too. A named colour world pins the palette until you change it. Music adds the colours of your record.</p><div class="mood-options">${['flow',...scenes.map(s=>s.name.toLowerCase())].map((m,i)=>`<button class="mood-choice tap ${(S.settings.atmosphere||'flow')===m?'on':''}" data-mood="${m}" aria-pressed="${(S.settings.atmosphere||'flow')===m}"><i style="--swatch:${i?scenes[i-1].colors[0]:'#a6bbbf'}"></i>${i?scenes[i-1].name:'Touch & flow'}</button>`).join('')}</div><div class="row between" style="margin-top:20px"><span class="small muted">${reduce.matches?'Reduced motion follows your device setting.':'Move the light yourself. No timed palette cycling.'}</span><button class="btn sm tap" id="moodShuffle">Next colour world ↗</button></div>`,sh=>{sh.querySelector('#moodClose').onclick=closeSheets;sh.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{S.settings.atmosphere=b.dataset.mood;save();refresh();sh.querySelectorAll('[data-mood]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))})});sh.querySelector('#moodShuffle').onclick=()=>{offset=(offset+1)%scenes.length;S.settings.atmosphere='flow';save();refresh();sh.querySelectorAll('[data-mood]').forEach(x=>{x.classList.toggle('on',x.dataset.mood==='flow');x.setAttribute('aria-pressed',String(x.dataset.mood==='flow'))})}})}
window.ATM={palette,music,refresh,panel};
document.getElementById('moodBtn').onclick=panel;
// No idle colour timer: all palette changes originate in an interaction.
const routes=['home','cal','news','music','more','vault','browse','routines','play','notes','focus','goals','habits','convert','clocks','calc','timers','stats','settings'];
function routeLight(paint=true){clearTimeout(scrollTimer);const page=(location.hash||'#home').slice(1);offset=Math.max(0,routes.indexOf(page))%scenes.length;scrollMix=0;scrollBand=0;if(paint)refresh()}
addEventListener('hashchange',()=>routeLight());
// A long scroll changes the world once, after the gesture. No colour writes per frame.
addEventListener('scroll',()=>{clearTimeout(scrollTimer);if(document.hidden||(S.settings.atmosphere||'flow')!=='flow')return;
 scrollTimer=setTimeout(()=>{const band=Math.floor(Math.max(0,scrollY)/800);if(band===scrollBand)return;scrollBand=band;scrollMix=band;refresh()},220)
},{passive:true});
document.addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(!b)return;clearTimeout(scrollTimer);offset=+b.dataset.scene;scrollMix=0;scrollBand=Math.floor(Math.max(0,scrollY)/800);S.settings.atmosphere='flow';save();refresh()});
document.addEventListener('pointerdown',e=>{
 if(reduce.matches||e.target.closest('input,textarea,select'))return;
 const control=e.target.closest('button,a,.tap');if(!control||control.disabled)return;
 const card=control.closest('.glass,.lg');if(!card)return;
 // Local coloured caustic: no inherited variables or outline repaints across the page.
 interaction=(interaction+1)%scenes.length;
 card.querySelector('.touch-caustic')?.remove();const glow=document.createElement('i');glow.className='touch-caustic';glow.setAttribute('aria-hidden','true');
 glow.style.background=scenes[interaction].colors[0];card.appendChild(glow);setTimeout(()=>glow.remove(),650);
},{passive:true});
routeLight(false);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
