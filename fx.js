/* Aarav HQ · FX: liquid glass refraction maps, reactive light, scroll choreography, taps */
(()=>{'use strict';
const root=document.documentElement,RM=matchMedia('(prefers-reduced-motion: reduce)');
const UA=navigator.userAgent,isChromium=/Chrome\/|Chromium\//.test(UA)&&!/iPhone|iPad|iPod|CriOS|FxiOS|Firefox/.test(UA);
// --- displacement maps (R = x shift, G = y shift, neutral 128). Edges bend inward like a lens rim.
function makeMap(w,h,band,power){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),im=x.createImageData(w,h),d=im.data,r=Math.min(w,h)/2;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  // signed distance to a rounded rect (radius = half height => pill / card corner)
  const px=i+.5-w/2,py=j+.5-h/2,qx=Math.abs(px)-(w/2-r),qy=Math.abs(py)-(h/2-r);
  const ox=Math.max(qx,0),oy=Math.max(qy,0),dist=Math.hypot(ox,oy)+Math.min(Math.max(qx,qy),0)-r; // <0 inside
  const e=Math.max(0,Math.min(1,1+dist/band));const s=Math.pow(e,power);
  let nx,ny;if(qx>0&&qy>0){const l=Math.hypot(ox,oy)||1;nx=ox/l*Math.sign(px);ny=oy/l*Math.sign(py)}else if(qx>qy){nx=Math.sign(px);ny=0}else{nx=0;ny=Math.sign(py)}
  const k=(j*w+i)*4;d[k]=128-nx*s*127;d[k+1]=128-ny*s*127;d[k+2]=128;d[k+3]=255}
 x.putImageData(im,0,0);return c.toDataURL()}
if(isChromium&&!RM.matches){try{
 const set=(id,url)=>{const e=document.getElementById(id);e.setAttribute('href',url);e.setAttributeNS('http://www.w3.org/1999/xlink','href',url)};
 set('map-pill',makeMap(360,64,22,2.2));set('map-card',makeMap(220,160,26,2.6));root.classList.add('lgsvg')}catch(e){}}
// --- reactive light: pointer, touch, tilt and scroll steer one virtual light source
const L={x:innerWidth*.3,y:-80,tx:innerWidth*.3,ty:-80};let vis=new Set(),raf=0;
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)),{rootMargin:'80px'});
function frame(){raf=0;L.x+=(L.tx-L.x)*.18;L.y+=(L.ty-L.y)*.18;
 vis.forEach(el=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',(L.x-r.left).toFixed(0)+'px');el.style.setProperty('--my',(L.y-r.top).toFixed(0)+'px')});
 if(Math.abs(L.tx-L.x)>.5||Math.abs(L.ty-L.y)>.5)kick()}
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
addEventListener('pointermove',e=>{L.tx=e.clientX;L.ty=e.clientY;kick()},{passive:true});
addEventListener('pointerdown',e=>{L.tx=e.clientX;L.ty=e.clientY;kick()},{passive:true});
let tiltOn=false;function onTilt(e){if(e.gamma==null)return;tiltOn=true;L.tx=innerWidth*(.5+Math.max(-1,Math.min(1,e.gamma/35))*.6);L.ty=innerHeight*(.25+Math.max(-1,Math.min(1,(e.beta-45)/40))*.5);kick()}
addEventListener('deviceorientation',onTilt,{passive:true});
addEventListener('click',function ask(){if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){DeviceOrientationEvent.requestPermission().catch(()=>{});}removeEventListener('click',ask)},{once:true});
// --- scroll: header morph, hero parallax, light drift
const top=document.getElementById('top');let lastY=-1,sraf=0;
function onScroll(){sraf=0;const y=scrollY;if(y===lastY)return;lastY=y;top.classList.toggle('scrolled',y>36);
 if(!RM.matches){const px=document.querySelector('.hero .px');if(px&&y<900){px.style.transform=`translate3d(0,${(y*.38).toFixed(1)}px,0) scale(${(1-y/3000).toFixed(4)})`;px.style.opacity=Math.max(0,1-y/520).toFixed(3)}}
 if(!tiltOn&&matchMedia('(hover:none)').matches){L.tx=innerWidth*(.3+.4*Math.sin(y/600));L.ty=-60+((y/4)%200)}kick()}
addEventListener('scroll',()=>{if(!sraf)sraf=requestAnimationFrame(onScroll)},{passive:true});
// --- reveal on scroll
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const el=e.target;const d=+(el.dataset.d||0);setTimeout(()=>el.classList.add('in'),d);rio.unobserve(el)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
// --- taps: light ripple + haptic tick
document.addEventListener('pointerdown',e=>{const t=e.target.closest('.tap,.btn,.key,.cd,.check,.iconbtn,.sw,.seg button,.mini button');if(!t)return;
 if(navigator.vibrate&&e.pointerType==='touch')try{navigator.vibrate(6)}catch(_){}
 if(RM.matches)return;const r=t.getBoundingClientRect();const host=getComputedStyle(t).position==='static'?null:t;if(!host)return;
 const s=document.createElement('span');s.className='rip';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';if(getComputedStyle(t).overflow!=='hidden')t.style.overflow='hidden';t.appendChild(s);setTimeout(()=>s.remove(),720)},{passive:true});
// --- segmented-control knob + dock blob
function seg(){document.querySelectorAll('.seg').forEach(g=>{let k=g.querySelector('.knob');if(!k){k=document.createElement('span');k.className='knob';g.prepend(k)}const on=g.querySelector('button.on');if(!on){k.style.opacity=0;return}k.style.opacity=1;k.style.width=on.offsetWidth+'px';k.style.transform=`translateX(${on.offsetLeft-4}px)`;k.style.left='4px'})}
function dock(){const a=document.querySelector('#dock a.on'),b=document.getElementById('dockBlob');if(!a||!b)return;b.style.width=a.offsetWidth+'px';b.style.transform=`translateX(${a.offsetLeft}px)`}
addEventListener('resize',()=>{seg();dock()});
function refresh(){document.querySelectorAll('.glass,.lg').forEach(el=>io.observe(el));
 let i=0;document.querySelectorAll('#view .glass:not(.rv), #view .nfeat:not(.rv)').forEach(el=>el.classList.add('rv'));
 document.querySelectorAll('#view .rv:not(.in)').forEach(el=>{if(RM.matches){el.classList.add('in');return}const r=el.getBoundingClientRect();el.dataset.d=r.top<innerHeight?Math.min(i++*70,420):0;rio.observe(el)});
 seg();dock();lastY=-1;onScroll();kick()}
window.FX={refresh,seg};
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{seg();dock()});
refresh();
})();
