/* HQ · FX: liquid glass refraction maps, reactive light, scroll choreography, taps */
(()=>{'use strict';
const root=document.documentElement,RM=matchMedia('(prefers-reduced-motion: reduce)');
const MOBILE=matchMedia('(pointer: coarse)').matches||matchMedia('(max-width: 760px)').matches||/iPhone|iPad|iPod/.test(navigator.userAgent);
root.classList.toggle('mobile-fx',MOBILE);
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
const ENABLE_REFRACTION=false; // SVG backdrop displacement is too expensive for everyday scrolling.
if(ENABLE_REFRACTION&&isChromium&&!RM.matches){try{
 const set=(id,url)=>{const e=document.getElementById(id);e.setAttribute('href',url);e.setAttributeNS('http://www.w3.org/1999/xlink','href',url)};
 set('map-pill',makeMap(360,64,22,2.2));set('map-card',makeMap(220,160,26,2.6));root.classList.add('lgsvg')}catch(e){}}
// --- reactive light: pointer, touch, tilt and scroll steer one virtual light source
const L={x:innerWidth*.3,y:-80,tx:innerWidth*.3,ty:-80};let vis=new Set(),tracked=new Set(),reveals=new Set(),raf=0;
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)),{rootMargin:'80px'});
let scrolling=false,scrollT=0;
function frame(){raf=0;if(scrolling||document.hidden||MOBILE||RM.matches)return;L.x+=(L.tx-L.x)*.18;L.y+=(L.ty-L.y)*.18;
 // read every rect first, then write: no layout thrash
 const els=[...vis].filter(el=>{if(el.isConnected)return true;vis.delete(el);tracked.delete(el);io.unobserve(el);return false}),rs=els.map(el=>el.getBoundingClientRect());
 els.forEach((el,k)=>{el.style.setProperty('--mx',(L.x-rs[k].left).toFixed(0)+'px');el.style.setProperty('--my',(L.y-rs[k].top).toFixed(0)+'px')});
 if(Math.abs(L.tx-L.x)>.5||Math.abs(L.ty-L.y)>.5)kick()}
const kick=()=>{if(!raf&&!scrolling&&!MOBILE&&!RM.matches&&!document.hidden)raf=requestAnimationFrame(frame)};
addEventListener('pointermove',e=>{L.tx=e.clientX;L.ty=e.clientY;kick()},{passive:true});
addEventListener('pointerdown',e=>{L.tx=e.clientX;L.ty=e.clientY;kick()},{passive:true});
let tiltOn=false;
document.addEventListener('visibilitychange',()=>{root.classList.toggle('fx-hidden',document.hidden);if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}else kick()});
// --- scroll: header morph, hero parallax, light drift
const top=document.getElementById('top');let lastY=-1,sraf=0;
function onScroll(){sraf=0;const y=scrollY;if(y===lastY)return;lastY=y;top.classList.toggle('scrolled',y>36);
 if(!RM.matches&&!MOBILE){const px=document.querySelector('.hero .px');if(px&&y<900){px.style.transform=`translate3d(0,${(y*.38).toFixed(1)}px,0)`;px.style.opacity=Math.max(0,1-y/520).toFixed(3)}}
 if(!tiltOn&&matchMedia('(hover:none)').matches){L.tx=innerWidth*(.3+.4*Math.sin(y/600));L.ty=-60+((y/4)%200)}kick()}
// the specular light freezes while scrolling and catches up once scrolling stops
addEventListener('scroll',()=>{if(!scrolling){scrolling=true;root.classList.add('scrolling')}clearTimeout(scrollT);scrollT=setTimeout(()=>{scrolling=false;root.classList.remove('scrolling');kick()},160);if(!sraf)sraf=requestAnimationFrame(onScroll)},{passive:true});
// --- reveal on scroll
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const el=e.target;const d=+(el.dataset.d||0);setTimeout(()=>{if(el.isConnected){el.classList.add('in');countUp(el)}},d);rio.unobserve(el);reveals.delete(el)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
// --- taps: light ripple + haptic tick
document.addEventListener('pointerdown',e=>{const t=e.target.closest('.tap,.btn,.key,.cd,.check,.iconbtn,.sw,.seg button,.mini button,.rbtn,.nbtn');if(!t)return;
 if(navigator.vibrate&&e.pointerType==='touch')try{navigator.vibrate(6)}catch(_){}
 if(RM.matches)return;const r=t.getBoundingClientRect();const host=getComputedStyle(t).position==='static'?null:t;if(!host)return;
 const s=document.createElement('span');s.className='rip';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';if(getComputedStyle(t).overflow!=='hidden')t.style.overflow='hidden';t.appendChild(s);setTimeout(()=>s.remove(),720)},{passive:true});
// --- segmented-control knob (stretches as it travels) + liquid dock blob
let pressure=null;
function releasePressure(){if(!pressure)return;pressure.el.classList.remove('liquid-pressed');pressure=null}
document.addEventListener('pointerdown',e=>{releasePressure();if(RM.matches||e.button>0)return;const el=e.target.closest('.tap,.btn,.iconbtn,.seg button,.news-layout button,.dock a');if(!el||el.closest('.editing'))return;const r=el.getBoundingClientRect();el.style.setProperty('--press-x',((e.clientX-r.left)/r.width*100)+'%');el.style.setProperty('--press-y',((e.clientY-r.top)/r.height*100)+'%');el.classList.add('liquid-pressed');pressure={el,x:e.clientX,y:e.clientY}},{passive:true});
document.addEventListener('pointermove',e=>{if(pressure&&Math.hypot(e.clientX-pressure.x,e.clientY-pressure.y)>12)releasePressure()},{passive:true});
['pointerup','pointercancel','scroll'].forEach(type=>document.addEventListener(type,releasePressure,{passive:true}));
addEventListener('blur',releasePressure);
function seg(){document.querySelectorAll('.seg').forEach(g=>{let k=g.querySelector('.knob');if(!k){k=document.createElement('span');k.className='knob';g.prepend(k)}const on=g.querySelector('button.on');if(!on){k.style.opacity=0;return}
 const x=on.offsetLeft-4,w=on.offsetWidth,px=+(k.dataset.x||x);k.style.opacity=1;k.style.width=w+'px';k.style.transform=`translateX(${x}px)`;k.style.left='4px';
 if(k.dataset.x&&Math.abs(px-x)>2&&!RM.matches&&k.animate)k.animate([{scale:'1 1'},{scale:'1.14 .9',offset:.35},{scale:'.98 1.03',offset:.75},{scale:'1 1'}],{duration:520,easing:'ease-out'});k.dataset.x=x})}
let dockPrev=null;
function dock(){const a=document.querySelector('#dock a.on'),b=document.getElementById('dockBlob');if(!a||!b)return;const nx=a.offsetLeft,nw=a.offsetWidth;
 if(dockPrev&&Math.abs(dockPrev.x-nx)>1&&!RM.matches&&b.animate){const ox=dockPrev.x,ow=dockPrev.w,dir=nx>ox?1:-1,mx=dir>0?ox:nx,mw=dir>0?nx+nw-ox:ox+ow-nx;
  b.animate([{transform:`translateX(${ox}px) scale(1,1)`,width:ow+'px'},{transform:`translateX(${mx}px) scale(1,.8)`,width:mw+'px',offset:.42},{transform:`translateX(${nx+dir*4}px) scale(1,1.05)`,width:nw+'px',offset:.78},{transform:`translateX(${nx}px) scale(1,1)`,width:nw+'px'}],{duration:660,easing:'cubic-bezier(.3,.7,.25,1)'});
  const ic=a.querySelector('svg');if(ic)ic.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-6px) scale(1.2)',offset:.4},{transform:'translateY(-1px) scale(1.08)'}],{duration:620,easing:'cubic-bezier(.34,1.56,.5,1)'})}
 b.style.width=nw+'px';b.style.transform=`translateX(${nx}px)`;dockPrev={x:nx,w:nw}}
addEventListener('resize',()=>{seg();dockPrev=null;dock()});
// --- count-up numbers when a tile reveals
function countUp(root){if(RM.matches)return;root.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.count,t=el.firstChild;if(!to||!t||t.nodeType!==3)return;const t0=performance.now();const f=n=>{const p=Math.min(1,(n-t0)/900),e=1-Math.pow(1-p,3);t.nodeValue=String(Math.round(to*e));if(p<1)requestAnimationFrame(f)};t.nodeValue='0';requestAnimationFrame(f)})}
// --- pull to refresh: a glass droplet that stretches, snaps, spins and pops
const ptr=document.getElementById('ptr'),view=document.getElementById('view');let P=null;
const ptrOK=()=>{const v=document.body.dataset.view;return typeof V!=='undefined'&&V[v]&&V[v].ptr&&!document.body.matches('.qc,.reading,.npo,.spot,.hdragging,.hediting')};
function ptrSet(d){const s=125*(1-Math.exp(-d/150)),k=Math.min(1,s/78);P.armedNow=s>=78;
 if(P.armedNow!==P.armed){P.armed=P.armedNow;ptr.classList.toggle('armed',P.armed);if(P.armed){try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}if(!RM.matches)ptr.firstElementChild.animate([{scale:'1.25 .8'},{scale:'.92 1.08'},{scale:'1 1'}],{duration:420,easing:'cubic-bezier(.34,1.56,.5,1)'})}}
 ptr.style.transform=`translate3d(-50%,${(s-46).toFixed(1)}px,0)`;ptr.style.opacity=Math.min(1,k*1.6).toFixed(2);ptr.style.setProperty('--k',k.toFixed(3));view.style.transform=`translate3d(0,${(s*.42).toFixed(1)}px,0)`}
function ptrReset(){ptr.classList.remove('pull','armed','spin','pop');ptr.style.transform='';ptr.style.opacity='';view.style.transition='transform .55s cubic-bezier(.34,1.45,.5,1)';view.style.transform='';setTimeout(()=>{view.style.transition=''},560)}
addEventListener('touchstart',e=>{if(e.touches.length!==1||scrollY>1||!ptr||P&&P.busy||!ptrOK())return;P={y0:e.touches[0].clientY,x0:e.touches[0].clientX,on:false,armed:false}},{passive:true});
addEventListener('touchmove',e=>{if(!P||P.busy)return;const y=e.touches[0].clientY,x=e.touches[0].clientX;
 if(!P.on){const dy=y-P.y0,dx=x-P.x0;if(dy>6&&dy>Math.abs(dx)*1.3&&scrollY<=1){P.on=true;P.y0=y;ptr.classList.add('pull');view.style.transition='none'}else if(Math.abs(dy)>6||Math.abs(dx)>6){P=null}return}
 if(e.cancelable)e.preventDefault();ptrSet(Math.max(0,y-P.y0))},{passive:false});
addEventListener('touchend',()=>{if(!P||P.busy)return;if(!P.on){P=null;return}
 if(!P.armed){P=null;ptrReset();return}P.busy=true;ptr.classList.add('spin');ptr.style.transform='translate3d(-50%,40px,0)';view.style.transition='transform .45s cubic-bezier(.34,1.45,.5,1)';view.style.transform='translate3d(0,44px,0)';
 const v=document.body.dataset.view,t0=Date.now();Promise.resolve().then(()=>V[v].ptr()).catch(()=>{}).then(()=>new Promise(r=>setTimeout(r,Math.max(0,700-(Date.now()-t0))))).then(()=>{ptr.classList.add('pop');setTimeout(()=>{P=null;ptrReset()},260)})},{passive:true});
// --- sheets: grabber + drag down to dismiss (phones)
function grabbers(){document.querySelectorAll('.sheet').forEach(sh=>{if(!sh.querySelector(':scope>.grab')){const g=document.createElement('span');g.className='grab';g.setAttribute('aria-hidden','true');sh.prepend(g)}})}
(function sheetDrag(){let sh=null,y0=0,dy=0,t0=0;
 document.addEventListener('touchstart',e=>{const s=e.target.closest('.sheet.on');if(!s||innerWidth>=640||e.target.closest('input,textarea,select,button:not(.grab),label,.swatches'))return;const r=s.getBoundingClientRect();if(e.touches[0].clientY-r.top>70)return;sh=s;y0=e.touches[0].clientY;dy=0;t0=Date.now()},{passive:true});
 document.addEventListener('touchmove',e=>{if(!sh)return;dy=Math.max(0,e.touches[0].clientY-y0);if(dy>0&&e.cancelable)e.preventDefault();sh.style.transition='none';sh.style.transform=`translate(-50%,${dy}px)`},{passive:false});
 document.addEventListener('touchend',()=>{if(!sh)return;const s=sh;sh=null;s.style.transition='';const fast=dy/Math.max(1,Date.now()-t0)>.6;s.style.transform='';if(dy>110||fast&&dy>30)closeSheets()},{passive:true})})();
function refresh(){for(const el of tracked){if(!el.isConnected){io.unobserve(el);tracked.delete(el);vis.delete(el)}}for(const el of reveals){if(!el.isConnected){rio.unobserve(el);reveals.delete(el)}}
 if(!MOBILE&&!RM.matches)document.querySelectorAll('.glass,.lg').forEach(el=>{if(!tracked.has(el)){tracked.add(el);io.observe(el)}});
 let i=0;document.querySelectorAll('#view .glass:not(.rv), #view .nfeat:not(.rv)').forEach(el=>el.classList.add('rv'));
 document.querySelectorAll('#view .rv:not(.in)').forEach(el=>{if(RM.matches){el.classList.add('in');return}const r=el.getBoundingClientRect();if(MOBILE&&r.top<innerHeight){el.classList.add('in');return}el.dataset.d=r.top<innerHeight?Math.min(i++*70,420):0;reveals.add(el);rio.observe(el)});
 document.querySelectorAll('#view .stg:not(.in)').forEach(el=>{[...el.children].forEach((c,k)=>c.style.setProperty('--i',Math.min(k,12)));if(RM.matches||MOBILE)el.classList.add('in');else{reveals.add(el);rio.observe(el)}});
 grabbers();seg();dock();lastY=-1;onScroll();kick()}
window.FX={refresh,seg,dock};
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{seg();dock()});
refresh();
})();
