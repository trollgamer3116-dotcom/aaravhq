/* HQ · Music: YouTube player, Now Playing, queue, library, recents, Media Session */
'use strict';
const DEF_PL={type:'playlist',id:'PLEeH0PskYedM',title:'HQ Mix',def:true,src:'https://music.youtube.com/playlist?list=PLEeH0PskYedM&si=8hRrfRZ36VhHETo9'};
function ensureMusic(){if(!S.music||!Array.isArray(S.music.lib))S.music={lib:[],cur:DEF_PL.id};const m=S.music;if(!m.lib.some(x=>x.def))m.lib.unshift(Object.assign({},DEF_PL));m.lib.forEach(x=>{if(x.def&&/aarav/i.test(x.title||''))x.title=DEF_PL.title});if(!Array.isArray(m.recent))m.recent=[];if(m.vol==null)m.vol=80;if(!m.repeat)m.repeat='off';m.shuffle=!!m.shuffle;if(!m.log)m.log={}}
ensureMusic();
function parseYT(str){let u;try{u=new URL(str.trim())}catch(e){const m=str.trim();if(/^[\w-]{11}$/.test(m))return{type:'video',id:m};if(/^(PL|RD|OL|UU|FL|LL)[\w-]{8,}$/.test(m))return{type:'playlist',id:m};return null}
 if(!/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(u.hostname))return null;
 const list=u.searchParams.get('list');let v=u.searchParams.get('v');
 if(!v&&u.hostname.endsWith('youtu.be'))v=u.pathname.slice(1).split('/')[0];
 const m=u.pathname.match(/\/(shorts|embed|live|v)\/([\w-]{11})/);if(!v&&m)v=m[2];
 if(v&&/^[\w-]{11}$/.test(v))return{type:'video',id:v,list:list||null};
 if(list&&/^[\w-]+$/.test(list))return{type:'playlist',id:list};return null}
const sv=(p,f)=>`<svg viewBox="0 0 24 24" class="gi${f?' f':''}" aria-hidden="true">${p}</svg>`;
const IC={prev:sv('<path d="M6 5v14M19 5 9 12l10 7z"/>'),next:sv('<path d="M18 5v14M5 5l10 7-10 7z"/>'),play:sv('<path d="M7 4.5v15l12.5-7.5z"/>',1),pause:sv('<rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/>',1),
 shuffle:sv('<path d="M3 7h3.5c4 0 6 10 10 10H21M3 17h3.5c1.6 0 2.8-1.6 3.9-3.6M13.6 9.6C14.7 8 15.6 7 17 7h4M18 4l3 3-3 3M18 14l3 3-3 3"/>'),rep:sv('<path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20M17 3l3 3-3 3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4M7 21l-3-3 3-3"/>'),rep1:sv('<path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20M17 3l3 3-3 3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4M7 21l-3-3 3-3M11.5 10.5l1.5-1v5"/>'),
 volLo:sv('<path d="M4 9.5h3l4.5-4v13L7 14.5H4z"/><path d="M15 9.5a3.5 3.5 0 0 1 0 5"/>'),volHi:sv('<path d="M4 9.5h3l4.5-4v13L7 14.5H4z"/><path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10"/>'),
 video:sv('<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>'),art:sv('<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="12" cy="12" r="3.2"/>'),queue:sv('<path d="M4 6h12M4 11h12M4 16h7M16 14v6l4.5-3z"/>'),chevD:sv('<path d="m5 9 7 7 7-7"/>'),expand:sv('<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>')};
const thumb=(id,q='mqdefault')=>id?`https://i.ytimg.com/vi/${id}/${q}.jpg`:'icons/icon-192.png';
const cleanT=t=>String(t||'').replace(/\s*[\(\[](official\s+(music\s+)?video|official\s+audio|official\s+lyric\s+video|lyric\s+video|lyrics?|audio|visuali[sz]er|hd|4k|remastered\s*\d*)[\)\]]/ig,'').trim();
const cleanA=a=>String(a||'').replace(/\s+-\s+Topic$/,'').replace(/VEVO$/,'').trim();
const fmtT=s=>{s=Math.max(0,Math.floor(s||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${x}`:`${m}:${x}`};
const YKEY='aaravhq:yt';let YM;try{YM=JSON.parse(localStorage.getItem(YKEY)||'{}')}catch(e){YM={}}
function ymSave(){const ks=Object.keys(YM);if(ks.length>500)ks.slice(0,ks.length-500).forEach(k=>delete YM[k]);try{localStorage.setItem(YKEY,JSON.stringify(YM))}catch(e){}}
const ymBusy={};
function ytMeta(id){if(YM[id])return Promise.resolve(YM[id]);if(ymBusy[id])return ymBusy[id];return ymBusy[id]=(async()=>{try{const r=await tfetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id),8000);if(!r.ok)throw 0;const j=await r.json();YM[id]={t:j.title,a:cleanA(j.author_name)};ymSave();return YM[id]}catch(e){return null}finally{delete ymBusy[id]}})()}
let YTP=null,ytReady=false,ytLoading=false,ytErr='',pendingLoad=null,playing=false,ytState=-1,curVid=null,plApplied=null,npOpen=false;
const POS={t:0,d:0,at:0};
const vd=()=>YTP&&YTP.getVideoData?YTP.getVideoData():null;
const posNow=()=>Math.min(POS.d||1e9,POS.t+(playing?(performance.now()-POS.at)/1000:0));
const ERRS={2:'That link has an invalid ID.',5:'This video can\u2019t play in the embedded player.',100:'That video was removed or made private.',101:'The owner doesn\u2019t allow this video to play outside YouTube.',150:'The owner doesn\u2019t allow this video to play outside YouTube.'};
function friendlyErr(msg){ytErr=msg;const e=document.getElementById('ytErr');if(e){e.innerHTML=errHTML();e.hidden=false}toast('🎧 '+msg.split('.')[0]+'.')}
const errHTML=()=>`${esc(ytErr)}<br><span class="small muted">If it\u2019s the default playlist, its ID (PLEeH0PskYedM) looks shorter than normal, so the link may have been cut off. Paste the full playlist link from YouTube Music (Share → Copy link) below, or pick something else from the library.</span>`;
function loadYTAPI(){if(ytLoading||window.YT&&YT.Player)return;ytLoading=true;window.onYouTubeIframeAPIReady=initYT;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{ytLoading=false;friendlyErr('Couldn\u2019t reach YouTube. Music needs an internet connection.')};document.head.appendChild(s)}
function curItem(){ensureMusic();return S.music.lib.find(x=>x.id===S.music.cur)||S.music.lib[0]}
function initYT(){const it=curItem();const pv={playsinline:1,rel:0,modestbranding:1,origin:location.origin};
 if(it.type==='playlist'){pv.listType='playlist';pv.list=it.id}
 const opt={width:'100%',height:'100%',playerVars:pv};if(it.type==='video')opt.videoId=it.id;
 YTP=new YT.Player('ytPlayer',Object.assign(opt,{events:{
  onReady:()=>{ytReady=true;try{YTP.setVolume(S.music.vol)}catch(e){}msInit();if(pendingLoad){const p=pendingLoad;pendingLoad=null;playItem(p,true)}else checkPlaylist(it);updMini();mPaint()},
  onStateChange:e=>{ytState=e.data;playing=e.data===1;if(e.data===1||e.data===-1||e.data===5){ytErr='';const x=document.getElementById('ytErr');if(x&&e.data===1)x.hidden=true}
   if(e.data===1&&plApplied!==S.music.cur){plApplied=S.music.cur;try{if(YTP.getPlaylist()){YTP.setShuffle(S.music.shuffle);YTP.setLoop(S.music.repeat==='all')}}catch(_){}}
   POS.t=YTP.getCurrentTime?YTP.getCurrentTime()||0:0;POS.at=performance.now();trackCheck();updMini();npSync();msState();if(playing)vizKick()},
  onError:e=>{friendlyErr(ERRS[e.data]||('The player hit an error (code '+e.data+').'))}}}));
 placeYT()}
function checkPlaylist(it){if(it.type!=='playlist')return;setTimeout(()=>{if(!YTP||!YTP.getPlaylist)return;const pl=YTP.getPlaylist();if(curItem().id===it.id&&(!pl||!pl.length))friendlyErr('I couldn\u2019t load this playlist. It may be private, deleted, or the ID is incomplete.')},4500)}
function mPaint(){const v=document.getElementById('vidslot');if(v&&ytReady)v.innerHTML=''}
function playItem(it,auto){if(!it.only){S.music.cur=it.id;save()}ytErr='';plApplied=null;const x=document.getElementById('ytErr');if(x)x.hidden=true;
 if(!ytReady){pendingLoad=it;loadYTAPI();return}
 if(it.type==='playlist')YTP.loadPlaylist({list:it.id,listType:'playlist',index:0});else YTP.loadVideoById(it.id);
 checkPlaylist(it);updMini();if(location.hash==='#music')render()}
function playVid(id){if(!ytReady){const it=curItem();pendingLoad={type:'video',id,title:'',only:true};loadYTAPI();return}const pl=YTP.getPlaylist&&YTP.getPlaylist();const j=pl?pl.indexOf(id):-1;if(j>=0)YTP.playVideoAt(j);else YTP.loadVideoById(id)}
function trackCheck(){const d=vd();if(!d||!d.video_id||d.video_id===curVid)return;curVid=d.video_id;onTrack(d)}
function onTrack(d){const id=d.video_id,m=S.music;if(d.title&&!YM[id]){YM[id]={t:d.title,a:cleanA(d.author)};ymSave()}
 m.recent=[{id,t:d.title||(YM[id]&&YM[id].t)||'',a:d.author||(YM[id]&&YM[id].a)||'',at:Date.now(),from:m.cur}].concat(m.recent.filter(x=>x.id!==id)).slice(0,24);
 const t=today();m.log[t]=(m.log[t]||0)+1;Object.keys(m.log).sort().slice(0,-30).forEach(k=>delete m.log[k]);
 const it=curItem();if(it&&it.type==='playlist'&&!it.thumb)it.thumb=thumb(id,'hqdefault');save();
 ytMeta(id);
 msMeta();npTrack(id);
 if(location.hash==='#music'){const q=document.getElementById('mQ');if(q){q.innerHTML=queueHTML(6);qFill(q)}const a=document.getElementById('mArt');if(a)a.innerHTML=`<img src="${thumb(id,'hqdefault')}" alt="">`;const rc=document.getElementById('mRec');if(rc)rc.innerHTML=recentHTML()}}
// ---------- tick: position, progress, repeat-one, media session ----------
let lastMetaT='';
function mTick(){if(!ytReady||!YTP.getCurrentTime)return;const d=vd();POS.t=YTP.getCurrentTime()||0;POS.d=YTP.getDuration()||0;POS.at=performance.now();trackCheck();
 if(S.music.repeat==='one'&&POS.d>0&&POS.t>=POS.d-.7&&playing)YTP.seekTo(0,true);
 const r=S.music.recent[0];if(d&&d.title&&r&&r.id===d.video_id&&!r.t){r.t=d.title;r.a=d.author;save()}
 if(d&&d.title&&d.title!==lastMetaT){lastMetaT=d.title;msMeta();updMini();npMeta()}
 const p=POS.d?posNow()/POS.d:0;const mp=document.getElementById('miniProg');if(mp)mp.style.transform=`scaleX(${p.toFixed(4)})`;
 const pg=document.getElementById('mProg');if(pg){pg.firstElementChild.style.transform=`scaleX(${p.toFixed(4)})`;$('#mCur').textContent=fmtT(POS.t);$('#mDur').textContent=fmtT(POS.d)}
 const hp=document.getElementById('hmProg');if(hp)hp.style.transform=`scaleX(${p.toFixed(4)})`;
 msPos()}
setInterval(mTick,500);
// ---------- Media Session (lock screen / Control Center where the browser allows) ----------
function msInit(){if(!('mediaSession' in navigator))return;const H={play:()=>YTP&&YTP.playVideo(),pause:()=>YTP&&YTP.pauseVideo(),previoustrack:()=>ctl.prev(),nexttrack:()=>ctl.next(),seekto:e=>YTP&&YTP.seekTo(e.seekTime,true),seekbackward:e=>YTP&&YTP.seekTo(Math.max(0,posNow()-(e.seekOffset||10)),true),seekforward:e=>YTP&&YTP.seekTo(posNow()+(e.seekOffset||10),true),stop:()=>YTP&&YTP.pauseVideo()};
 for(const k in H){try{navigator.mediaSession.setActionHandler(k,H[k])}catch(e){}}}
function msMeta(){if(!('mediaSession' in navigator)||!window.MediaMetadata)return;const d=vd();if(!d||!d.video_id)return;const it=curItem();
 try{navigator.mediaSession.metadata=new MediaMetadata({title:cleanT(d.title||(YM[d.video_id]||{}).t||'HQ'),artist:cleanA(d.author||(YM[d.video_id]||{}).a||''),album:it?it.title:'HQ',artwork:[{src:thumb(d.video_id,'hqdefault'),sizes:'480x360',type:'image/jpeg'},{src:thumb(d.video_id,'maxresdefault'),sizes:'1280x720',type:'image/jpeg'}]})}catch(e){}}
function msState(){if('mediaSession' in navigator)try{navigator.mediaSession.playbackState=playing?'playing':'paused'}catch(e){}}
let msLast=0;function msPos(){if(!('mediaSession' in navigator)||!navigator.mediaSession.setPositionState||!POS.d)return;const n=Date.now();if(n-msLast<4000)return;msLast=n;try{navigator.mediaSession.setPositionState({duration:POS.d,position:Math.min(POS.t,POS.d),playbackRate:1})}catch(e){}}
// ---------- mini player ----------
let lastPP=null;
function setPP(){if(lastPP===playing)return;lastPP=playing;['mPlay','bigPlay','npPlay'].map(id=>document.getElementById(id)).concat([...document.querySelectorAll('.hmc [data-mc=toggle]')]).forEach(b=>{if(!b)return;b.innerHTML=playing?IC.pause:IC.play;b.setAttribute('aria-label',playing?'Pause':'Play');const s=b.firstElementChild;if(s&&!RMQ.matches)s.animate([{transform:'scale(.4) rotate(-40deg)',opacity:0},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.34,1.56,.5,1)'})})}
function updMini(){if(window.ATM&&!document.hidden){if(curVid)ATM.music(curVid);ATM.refresh()}const cq=document.getElementById('compactQ');if(cq&&gs.classList.contains('on')&&cq.dataset.track!==curVid){cq.dataset.track=curVid||'';cq.innerHTML=queueHTML(8);qFill(cq)}const m=$('#mini');if(!m)return;const d=vd(),it=curItem();const show=!!(ytReady&&d&&d.video_id);m.classList.toggle('hidden',!show);document.body.classList.toggle('hasmini',show);
 if(show){const t=cleanT(d.title)||(YM[d.video_id]&&cleanT(YM[d.video_id].t))||'Loading…';if($('#miniTitle').textContent!==t)$('#miniTitle').textContent=t;const sub=(d.author?cleanA(d.author)+' · ':'')+(it?it.title:'');if($('#miniSub').textContent!==sub)$('#miniSub').textContent=sub;const th=thumb(d.video_id);const image=$('#miniThumb');if(image.dataset.track!==d.video_id){image.dataset.track=d.video_id;image.onerror=()=>{image.onerror=null;image.src='icons/icon-192.png'};image.src=th}}
 lastPP=lastPP===playing&&!document.querySelector('#bigPlay:empty,#mPlay:empty')?lastPP:null;setPP();m.classList.toggle('playing',playing);
 const eq=document.getElementById('mEq');if(eq)eq.classList.toggle('paused-eq',!playing);
 const gl=document.getElementById('mGlow');if(gl&&d&&d.video_id){const u=`url(${thumb(d.video_id,'hqdefault')})`;if(gl.dataset.u!==u){gl.dataset.u=u;gl.style.backgroundImage=u}}
 const nt=document.getElementById('nowT');if(nt&&d&&d.title){nt.textContent=cleanT(d.title);const na=document.getElementById('nowA');if(na)na.textContent=cleanA(d.author)}
 document.querySelectorAll('.lcard').forEach(c=>{const on=c.dataset.id===S.music.cur;c.classList.toggle('on',on);const lp=c.querySelector('.lplay');if(lp)lp.innerHTML=on&&playing?'<span class="eq"><i></i><i></i><i></i></span>':IC.play})}
let ytAnchor=null;const ytGeometryObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>placeYT()):null;
function placeYT(){const w=$('#ytWrap');const nv=npOpen&&S.music.npVideo?document.getElementById('npVid'):null;const slot=nv||document.getElementById('vidslot');
 if(slot!==ytAnchor){if(ytGeometryObserver){ytGeometryObserver.disconnect();if(slot){ytGeometryObserver.observe(slot);ytGeometryObserver.observe(document.getElementById('view'))}}ytAnchor=slot}
 if(!slot){w.classList.add('off');w.classList.remove('fixed');w.style.cssText='';return}
 const r=slot.getBoundingClientRect();w.classList.remove('off');
 if(nv){w.classList.add('fixed');w.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`}
 else{w.classList.remove('fixed');w.style.cssText=`left:${r.left+scrollX}px;top:${r.top+scrollY}px;width:${r.width}px;height:${r.height}px`}}
addEventListener('resize',placeYT);
// Reveal transforms change the anchor after initial measurement.
['transitionend','animationend'].forEach(type=>document.getElementById('view').addEventListener(type,e=>{if(ytAnchor&&(e.target.contains(ytAnchor)||e.target===ytAnchor))placeYT()}));
const ctl={toggle(){if(!ytReady){playItem(curItem());return}playing?YTP.pauseVideo():YTP.playVideo()},
 next(){if(!ytReady)return;const pl=YTP.getPlaylist&&YTP.getPlaylist();if(pl&&pl.length)YTP.nextVideo();else toast('This is a single video, so there\u2019s no next track.')},
 prev(){if(!ytReady)return;if(posNow()>3||!(YTP.getPlaylist&&YTP.getPlaylist()&&YTP.getPlaylistIndex()>0))YTP.seekTo(0,true);else YTP.previousVideo()},
 shuffle(){S.music.shuffle=!S.music.shuffle;save();try{if(ytReady&&YTP.getPlaylist())YTP.setShuffle(S.music.shuffle)}catch(e){}mSync();toast(S.music.shuffle?'Shuffle on':'Shuffle off');setTimeout(()=>{npQueue();const q=document.getElementById('mQ');if(q){q.innerHTML=queueHTML(6);qFill(q)}},400)},
 repeat(){const o=['off','all','one'];S.music.repeat=o[(o.indexOf(S.music.repeat)+1)%3];save();try{if(ytReady)YTP.setLoop(S.music.repeat==='all')}catch(e){}mSync();toast({off:'Repeat off',all:'Repeat all',one:'Repeat this song'}[S.music.repeat])}};
function mSync(){['bShuf','npShuf'].forEach(i=>{const b=document.getElementById(i);if(b)b.classList.toggle('on',S.music.shuffle)});['bRep','npRep'].forEach(i=>{const b=document.getElementById(i);if(b){b.classList.toggle('on',S.music.repeat!=='off');b.innerHTML=S.music.repeat==='one'?IC.rep1:IC.rep;b.setAttribute('aria-label','Repeat: '+S.music.repeat)}})}
$('#mPlay').onclick=ctl.toggle;$('#mNext').onclick=ctl.next;$('#mPrev').onclick=ctl.prev;
setInterval(()=>{if(ytReady)updMini()},2000);
(function miniGestures(){const c=$('#mCont');let x0=0,y0=0,dx=0,dy=0,act=false,t0=0;
 c.addEventListener('pointerdown',e=>{act=true;x0=e.clientX;y0=e.clientY;dx=dy=0;t0=Date.now();try{c.setPointerCapture(e.pointerId)}catch(_){}c.style.transition='none'});
 c.addEventListener('pointermove',e=>{if(!act)return;dx=e.clientX-x0;dy=e.clientY-y0;if(Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy))c.style.transform=`translate3d(${dx*.75}px,0,0)`});
 c.addEventListener('pointerup',()=>{if(!act)return;act=false;c.style.transition='';const v=Math.abs(dx)/Math.max(1,Date.now()-t0);
  if(Math.abs(dx)>70||(v>.5&&Math.abs(dx)>30)){const dir=dx<0?1:-1,pl=ytReady&&YTP.getPlaylist&&YTP.getPlaylist();
   if(!pl||!pl.length){c.style.transform='';toast('This is a single video, so there\u2019s no next track.');return}
   c.animate([{transform:`translate3d(${dx*.75}px,0,0)`,opacity:1},{transform:`translate3d(${-dir*140}px,0,0)`,opacity:0}],{duration:170,easing:'ease-in',fill:'forwards'}).onfinish=()=>{dir>0?ctl.next():ctl.prev();c.style.transform='';c.getAnimations().forEach(a=>a.cancel());c.animate([{transform:`translate3d(${dir*140}px,0,0)`,opacity:0},{transform:'none',opacity:1}],{duration:560,easing:'cubic-bezier(.2,.9,.25,1.06)'})};
   try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}}
  else{c.style.transform='';if(dy<-28)openCompactQueue();else if(Math.abs(dx)<8&&Math.abs(dy)<8)openNP($('#miniThumb'))}});
 c.addEventListener('pointercancel',()=>{act=false;c.style.transition='';c.style.transform=''})})();
function openCompactQueue(){openSheet(`<div class="row between"><div><div class="kicker">THE ROTATION / UP NEXT</div><h2>Keep the record going.</h2></div><button class="iconbtn tap" id="cqClose" aria-label="Close queue">×</button></div><div id="compactQ" class="compact-queue">${queueHTML(8)}</div>`,sh=>{sh.querySelector('#cqClose').onclick=closeSheets;const q=sh.querySelector('#compactQ');q.dataset.track=curVid||'';qFill(q)})}
$('#mQueueBtn').onclick=openCompactQueue;
// ---------- album palette (ambient colors) ----------
const palCache={};
function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return[h*360,s,l]}
function artPalette(id){if(palCache[id])return Promise.resolve(palCache[id]);return new Promise(res=>{const im=new Image();im.crossOrigin='anonymous';
 im.onload=()=>{try{const W=40,H=30,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,W,H);const d=x.getImageData(0,0,W,H).data,bins={};
  for(let i=0;i<d.length;i+=4){const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(l<.07||l>.96)continue;const k=Math.round(h/24)+'_'+(s>.25?1:0)+'_'+Math.round(l*3);const w=.2+s*2+(l>.2&&l<.75?.4:0);const o=bins[k]||(bins[k]={h:0,s:0,l:0,w:0,hx:0,hy:0});o.hx+=Math.cos(h*Math.PI/180)*w;o.hy+=Math.sin(h*Math.PI/180)*w;o.s+=s*w;o.l+=l*w;o.w+=w}
  const arr=Object.values(bins).map(o=>({h:(Math.atan2(o.hy,o.hx)*180/Math.PI+360)%360,s:o.s/o.w,l:o.l/o.w,w:o.w})).sort((a,b)=>b.w-a.w),pick=[];
  for(const c of arr){if(pick.every(p=>Math.min(Math.abs(p.h-c.h),360-Math.abs(p.h-c.h))>28||Math.abs(p.l-c.l)>.3))pick.push(c);if(pick.length===3)break}
  if(!pick.length)pick.push({h:12,s:.9,l:.55});while(pick.length<3){const b=pick[0];pick.push({h:(b.h+(pick.length===1?40:-40)+360)%360,s:b.s,l:b.l})}
  const grey=pick[0].s<.12;const cols=pick.map(p=>`hsl(${p.h.toFixed(0)} ${(grey?8:Math.max(45,Math.min(92,p.s*100+12))).toFixed(0)}% ${Math.max(34,Math.min(62,p.l*100)).toFixed(0)}%)`);
  palCache[id]={cols,im};res(palCache[id])}catch(e){res(null)}};im.onerror=()=>res(null);im.src=thumb(id,'mqdefault')})}
// ---------- Now Playing ----------
function bestArt(id,box){const tries=['maxresdefault','sddefault','hqdefault'];let k=0;const im=new Image();im.alt='';im.decoding='async';
 const next=()=>{if(k>=tries.length)return;im.src=thumb(id,tries[k++])};im.onerror=next;im.onload=()=>{if(im.naturalWidth<=120&&k<tries.length){next();return}
  [...box.children].forEach(o=>{o.classList.add('old');setTimeout(()=>o.remove(),700)});im.classList.add('in');box.appendChild(im)};next()}
function npAmbArt(id){const u=thumb(id,'hqdefault');['npAmbA','npAmbB'].forEach(k=>{const im=document.getElementById(k);if(im&&im.dataset.u!==u){im.dataset.u=u;im.classList.remove('on');im.onload=()=>im.classList.add('on');im.onerror=()=>im.classList.remove('on');im.src=u}})}
function npTrack(id){if(!npOpen)return;npMeta();bestArt(id,$('#npArtIn'));npAmbArt(id);artPalette(id).then(p=>{if(!p||vd().video_id!==id)return;const np=$('#np');p.cols.forEach((c,i)=>np.style.setProperty('--c'+(i+1),c));
 const cv=$('#npAmb'),x=cv.getContext('2d');x.drawImage(p.im,0,0,cv.width,cv.height)});npQueue();VIZ.bpm=96+(parseInt(hid(id),36)%34)}
function npMeta(){if(!npOpen)return;const d=vd(),id=d&&d.video_id,m=id&&YM[id];$('#npT').textContent=cleanT(d&&d.title||(m&&m.t)||'Nothing playing');$('#npA').textContent=cleanA(d&&d.author||(m&&m.a)||'Press play to start the mix');$('#npFrom').textContent=curItem().title}
function npSync(){const np=$('#np');np.classList.toggle('playing',playing);setPP();mSync()}
function npPaint(){const d=vd(),id=d&&d.video_id;npMeta();npSync();if(id){if(!$('#npArtIn').children.length||$('#npArtIn').dataset.id!==id){$('#npArtIn').dataset.id=id;npTrack(id)}}else{$('#npArtIn').innerHTML='<div class="np-ph">♪</div>'}
 $('#npMode').innerHTML=S.music.npVideo?IC.art:IC.video;$('#npMode').setAttribute('aria-label',S.music.npVideo?'Show artwork':'Show video');$('#np').classList.toggle('vid',!!S.music.npVideo);
 $('#npVolRow').hidden=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);volS.set(S.music.vol/100)}
function npQueue(){const q=document.getElementById('npQ');if(!q||!npOpen)return;const pl=ytReady&&YTP.getPlaylist?YTP.getPlaylist():null;
 if(!pl||!pl.length){q.innerHTML=`<p class="small" style="opacity:.7;margin:0">${ytReady?'Single video — nothing queued after this.':'Press play to load the queue.'}</p>`;return}
 const idx=YTP.getPlaylistIndex(),rows=[];for(let k=0;k<Math.min(pl.length,40);k++){const j=(idx+k)%pl.length;if(k&&j===idx)break;rows.push(qRow(pl[j],j,k===0))}q.innerHTML=rows.join('');qFill(q)}
const qRow=(id,j,cur)=>{const m=YM[id];return `<button class="qrow tap ${cur?'cur':''}" data-qi="${j}" data-vid="${id}"><img src="${thumb(id,'default')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='icons/icon-192.png'"><span class="qt"><b class="ell">${m?esc(cleanT(m.t)):'Track '+(j+1)}</b><span class="ell">${m?esc(m.a):'&nbsp;'}</span></span>${cur?`<span class="eq ${playing?'':'paused-eq'}"><i></i><i></i><i></i></span>`:`<span class="qn">${j+1}</span>`}</button>`};
function qFill(box){box.querySelectorAll('.qrow').forEach(r=>{const id=r.dataset.vid;if(YM[id])return;ytMeta(id).then(m=>{if(!m||!r.isConnected)return;r.querySelector('.qt').innerHTML=`<b class="ell">${esc(cleanT(m.t))}</b><span class="ell">${esc(m.a)}</span>`})})}
function queueHTML(n){const pl=ytReady&&YTP.getPlaylist?YTP.getPlaylist():null;if(!pl||!pl.length)return `<p class="small muted" style="margin:0">${ytReady?'This is a single video. Add a playlist to see what\u2019s next.':'Press play to load the queue.'}</p>`;
 const idx=YTP.getPlaylistIndex(),L=[];for(let k=1;k<=Math.min(n,pl.length-1);k++)L.push((idx+k)%pl.length);return L.map(j=>qRow(pl[j],j,false)).join('')||'<p class="small muted" style="margin:0">That\u2019s the end of the playlist.</p>'}
document.addEventListener('click',e=>{const q=e.target.closest('[data-qi]');if(q&&ytReady){YTP.playVideoAt(+q.dataset.qi);q.classList.add('pick');return}const r=e.target.closest('[data-rv]');if(r){playVid(r.dataset.rv);toast('Playing '+(r.querySelector('b')||{}).textContent)}});
function slider(el,o){let drag=false;const fill=el.querySelector('.sf'),knob=el.querySelector('.sk'),tr=el.querySelector('.st');
 const set=p=>{p=Math.max(0,Math.min(1,p||0));fill.style.transform=`scaleX(${p.toFixed(4)})`;knob.style.translate=`${(p*tr.clientWidth).toFixed(1)}px 0`;el.setAttribute('aria-valuenow',Math.round(p*100))};
 const at=e=>{const r=tr.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))};
 el.addEventListener('pointerdown',e=>{drag=true;try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('drag');const p=at(e);set(p);o.move&&o.move(p)});
 el.addEventListener('pointermove',e=>{if(!drag)return;const p=at(e);set(p);o.move&&o.move(p)});
 el.addEventListener('pointerup',e=>{if(!drag)return;drag=false;el.classList.remove('drag');o.done(at(e))});
 el.addEventListener('pointercancel',()=>{drag=false;el.classList.remove('drag')});
 el.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const p=Math.max(0,Math.min(1,o.get()+(e.key==='ArrowRight'?.04:-.04)));set(p);o.done(p)}});
 return{set,drag:()=>drag}}
const scrub=slider($('#npScrub'),{get:()=>POS.d?posNow()/POS.d:0,move:p=>{$('#npCur').textContent=fmtT(p*POS.d);$('#npDur').textContent='-'+fmtT(POS.d-p*POS.d)},done:p=>{if(ytReady&&POS.d){YTP.seekTo(p*POS.d,true);POS.t=p*POS.d;POS.at=performance.now()}}});
const volS=slider($('#npVol'),{get:()=>S.music.vol/100,move:p=>{S.music.vol=Math.round(p*100);try{YTP&&YTP.setVolume(S.music.vol);if(YTP&&YTP.isMuted()&&p>0)YTP.unMute()}catch(e){}},done:p=>{S.music.vol=Math.round(p*100);try{YTP&&YTP.setVolume(S.music.vol)}catch(e){}save()}});
const VIZ={e:0,bars:null,bpm:112,raf:0,last:''};
function vizKick(){if(npOpen&&!VIZ.raf)VIZ.raf=requestAnimationFrame(npFrame)}
function npFrame(ts){VIZ.raf=0;if(!npOpen||document.hidden)return;
 if(!scrub.drag()&&POS.d){const p=posNow()/POS.d;scrub.set(p);const s=Math.floor(posNow());if(s+'|'+POS.d!==VIZ.last){VIZ.last=s+'|'+POS.d;$('#npCur').textContent=fmtT(s);$('#npDur').textContent='-'+fmtT(POS.d-s)}}
 const cv=$('#npViz'),W=cv.clientWidth,H=cv.clientHeight;if(W){const dpr=Math.min(2,devicePixelRatio||1);if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);
  VIZ.e+=((playing&&!RMQ.matches?1:0)-VIZ.e)*.05;const N=Math.max(24,Math.min(56,Math.floor(W/7)));if(!VIZ.bars||VIZ.bars.length!==N)VIZ.bars=new Float32Array(N);
  const t=ts/1000,beat=Math.pow(Math.max(0,Math.sin(t*Math.PI*VIZ.bpm/60)),10),bw=W/N,cs=getComputedStyle($('#np'));
  const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,cs.getPropertyValue('--c1').trim()||'#ff5b3a');g.addColorStop(.5,'#fff');g.addColorStop(1,cs.getPropertyValue('--c2').trim()||'#ff9a5c');x.fillStyle=g;
  for(let i=0;i<N;i++){const f=i/N,env=.35+.65*Math.sin(Math.PI*Math.min(1,f*1.05+.03)),n=.5+.5*Math.sin(t*(1.6+f*3.3)+i*1.37)*Math.sin(t*(.8+f*1.9)+i*.71);
   const tg=VIZ.e*(.12+.6*n*env+.4*beat*Math.max(0,1-f*1.6));VIZ.bars[i]+=(tg-VIZ.bars[i])*(tg>VIZ.bars[i]?.32:.1);
   const h=Math.max(3,VIZ.bars[i]*H*.92),w=Math.max(2,bw*.46),xx=i*bw+(bw-w)/2;x.globalAlpha=.28+.72*Math.min(1,VIZ.bars[i]*1.4);x.beginPath();if(x.roundRect)x.roundRect(xx,(H-h)/2,w,h,w/2);else x.rect(xx,(H-h)/2,w,h);x.fill()}x.globalAlpha=1}
 if(playing||VIZ.e>.01||scrub.drag())VIZ.raf=requestAnimationFrame(npFrame)}
let npTok=0;
let npOpener=null;
function openNP(src){if(npOpen)return;npOpener=document.activeElement;const np=$('#np');npOpen=true;npTok++;np.classList.remove('closing');$('#npArt').getAnimations().forEach(x=>x.cancel());np.classList.add('on');np.setAttribute('aria-hidden','false');document.body.classList.add('npo');$('#npIn').scrollTop=0;npPaint();npQueue();
 const art=$('#npArt');if(src&&!RMQ.matches&&!S.music.npVideo&&src.getBoundingClientRect().width&&art.getBoundingClientRect().width){const a=src.getBoundingClientRect();const b=art.getBoundingClientRect();const s=a.width/b.width;
  art.animate([{transform:`translate3d(${a.left-b.left}px,${a.top-b.top}px,0) scale(${s})`,borderRadius:`${(14/s).toFixed(1)}px`},{transform:'none',borderRadius:'26px'}],{duration:640,easing:'cubic-bezier(.2,.9,.22,1.04)'});src.style.visibility='hidden';setTimeout(()=>src.style.visibility='',660)}
 history.pushState({np:1},'');npPushed=true;vizKick();setTimeout(placeYT,30);setTimeout(()=>{if(npOpen)$('#npClose').focus({preventScroll:true})},60)}
let npPushed=false;
function closeNP(fromPop){if(!npOpen)return;npOpen=false;const np=$('#np'),art=$('#npArt'),m=$('#miniThumb'),inn=$('#npIn');placeYT();const tok=npTok;
 const done=()=>{if(tok!==npTok)return;npTok++;np.classList.remove('on','closing');np.setAttribute('aria-hidden','true');document.body.classList.remove('npo');inn.style.transform='';inn.style.transition='';np.style.removeProperty('--drag');const opener=npOpener;npOpener=null;if(opener&&opener.isConnected)opener.focus({preventScroll:true});art.getAnimations().forEach(a=>a.cancel());m.style.visibility=''};
 if(!RMQ.matches&&m&&!$('#mini').classList.contains('hidden')&&!S.music.npVideo){const a=art.getBoundingClientRect(),b=m.getBoundingClientRect(),s=b.width/a.width;np.classList.add('closing');m.style.visibility='hidden';
  art.animate([{transform:'none',borderRadius:'26px'},{transform:`translate3d(${b.left-a.left}px,${b.top-a.top}px,0) scale(${s})`,borderRadius:`${(14/s).toFixed(1)}px`}],{duration:480,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards'}).onfinish=done;setTimeout(done,700)}
 else{np.classList.add('closing');setTimeout(done,320)}
 if(npPushed){npPushed=false;if(!fromPop)history.back()}}
addEventListener('popstate',()=>{if(npOpen)closeNP(true)});
(function bindNP(){$('#npPrev').innerHTML=IC.prev;$('#npNext').innerHTML=IC.next;$('#npShuf').innerHTML=IC.shuffle;$('#npPlay').innerHTML=IC.play;mSync();$('#npClose').onclick=()=>closeNP();$('#npPlay').onclick=ctl.toggle;$('#npNext').onclick=ctl.next;$('#npPrev').onclick=ctl.prev;$('#npShuf').onclick=ctl.shuffle;$('#npRep').onclick=ctl.repeat;
 $('#npMode').onclick=()=>{S.music.npVideo=!S.music.npVideo;save();npPaint();placeYT();setTimeout(placeYT,320)};
 $('#npQbtn').onclick=()=>{const q=document.querySelector('.np-q');$('#npIn').scrollTo({top:q.offsetTop-70,behavior:'smooth'})};
 const inn=$('#npIn');let raf=0;inn.addEventListener('scroll',()=>{if(S.music.npVideo&&!raf)raf=requestAnimationFrame(()=>{raf=0;placeYT()})},{passive:true});
 document.addEventListener('keydown',e=>{if(!npOpen||e.target.matches('input,textarea'))return;if(e.key==='Escape'){e.stopImmediatePropagation();closeNP()}else if(e.key===' '){e.preventDefault();ctl.toggle()}else if(e.key==='ArrowRight'&&!e.target.closest('[role=slider]'))ctl.next();else if(e.key==='ArrowLeft'&&!e.target.closest('[role=slider]'))ctl.prev()},true);
 let y0=0,dy=0,on=false,t0=0;const top=$('.np-top'),stage=$('.np-stage');
 [top,stage].forEach(el=>{el.addEventListener('touchcancel',()=>{on=false;dy=0;inn.style.transform='';inn.style.transition='';$('#np').style.removeProperty('--drag')},{passive:true});el.addEventListener('touchstart',e=>{on=false;if(e.touches.length!==1||e.target.closest('button,input,[role=slider]')||inn.scrollTop>2||S.music.npVideo&&el===stage)return;on=true;y0=e.touches[0].clientY;dy=0;t0=Date.now()},{passive:true});
  el.addEventListener('touchmove',e=>{if(!on)return;dy=e.touches[0].clientY-y0;if(dy>0){e.preventDefault();inn.style.transition='none';inn.style.transform=`translate3d(0,${dy*.6}px,0)`;$('#np').style.setProperty('--drag',Math.min(1,dy/400))}},{passive:false});
  el.addEventListener('touchend',()=>{if(!on)return;on=false;$('#np').style.removeProperty('--drag');if(dy>120||dy/Math.max(1,Date.now()-t0)>.8)closeNP();else{inn.style.transition='transform .5s cubic-bezier(.34,1.45,.5,1)';inn.style.transform=''}},{passive:true})})})();
// ---------- Music tab ----------
async function fetchTitle(it){try{const url=it.type==='video'?'https://www.youtube.com/watch?v='+it.id:'https://www.youtube.com/playlist?list='+it.id;const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url));if(!r.ok)return;const j=await r.json();if(j.title){it.title=j.title;it.thumb=j.thumbnail_url;save();if(location.hash==='#music')render()}}catch(e){}}
function recentHTML(){const r=S.music.recent;if(!r.length)return EMPTY('◷','Nothing yet.','Songs you play will collect here, newest first.');
 return `<div class="rscroll">${r.slice(0,16).map(x=>`<button class="rcard tap" data-rv="${esc(x.id)}"><span class="ra"><img src="${thumb(x.id,'hqdefault')}" alt="" loading="lazy"></span><b class="ell">${esc(cleanT(x.t)||'Track')}</b><span class="ell">${esc(cleanA(x.a))}${x.a?' · ':''}${ago(x.at)}</span></button>`).join('')}</div>`}
function libHTML(){const cur=curItem();return S.music.lib.map(x=>{const on=x.id===cur.id,art=x.thumb||(x.type==='video'?thumb(x.id,'hqdefault'):'');
 return `<div class="lcard ${on?'on':''}" data-id="${esc(x.id)}"><button class="la tap" data-play aria-label="Play ${esc(x.title)}">${art?`<img src="${esc(art)}" alt="" loading="lazy">`:'<span class="genart">H</span>'}<span class="lplay">${on&&playing?'<span class="eq"><i></i><i></i><i></i></span>':IC.play}</span></button><b class="ell">${esc(x.title)}</b><span class="small muted">${x.type==='playlist'?'Playlist':'Video'}${x.def?' · default':''}</span>${x.def?'':'<button class="x lx tap" aria-label="Remove">✕</button>'}</div>`}).join('')}
V.music=()=>{const it=curItem(),d=vd(),id=d&&d.video_id,m=id&&YM[id];
 return `<section class="phead"><div class="row between" style="align-items:flex-end"><div><div class="kicker plain">04 / MUSIC</div><div class="ptitle">the rotation<i>.</i></div></div><button class="btn sm tap" id="mOpenNP">${IC.expand} Now Playing</button></div></section>
 <section class="glass card lens mcard" style="overflow:hidden"><div class="mglow" id="mGlow"></div>
  <div class="row between"><span class="chip a">${it.type==='playlist'?'Playlist':'Video'} · ${esc(it.title.length>26?it.title.slice(0,25)+'…':it.title)}</span><span class="eq ${playing?'':'paused-eq'}" id="mEq"><i></i><i></i><i></i></span></div>
  <div id="vidslot" class="vidslot" style="margin-top:14px">${ytReady?'':'<div><div class="vinyl" style="margin:0 auto 12px"></div>Press play — the mix is queued.</div>'}</div>
  <div class="mnow"><button class="mart tap" id="mArt" aria-label="Open Now Playing">${id?`<img src="${thumb(id,'hqdefault')}" alt="">`:'<span>♪</span>'}</button><div class="grow" style="min-width:0"><b class="ell" id="nowT" style="display:block">${esc(d&&d.title?cleanT(d.title):m?cleanT(m.t):'Ready when you are')}</b><span class="small muted ell" id="nowA" style="display:block">${esc(d&&d.author?cleanA(d.author):'Tap play to start')}</span></div></div>
  <div class="mprog2" id="mProg"><i></i></div><div class="row between small muted mtimes"><span id="mCur">0:00</span><span id="mDur">0:00</span></div>
  <div class="mctl"><button class="ib tap ${S.music.shuffle?'on':''}" id="bShuf" aria-label="Shuffle">${IC.shuffle}</button><button class="ib tap" id="bPrev" aria-label="Previous">${IC.prev}</button><button class="ppbig tap" id="bigPlay" aria-label="${playing?'Pause':'Play'}">${playing?IC.pause:IC.play}</button><button class="ib tap" id="bNext" aria-label="Next">${IC.next}</button><button class="ib tap ${S.music.repeat!=='off'?'on':''}" id="bRep" aria-label="Repeat">${S.music.repeat==='one'?IC.rep1:IC.rep}</button></div>
  <div id="ytErr" class="err" ${ytErr?'':'hidden'}>${ytErr?errHTML():''}</div></section>
 <section class="glass card"><div class="row between"><div class="kicker">Up next</div><button class="more-link tap" id="mQall" style="background:none;border:0;cursor:pointer">See all ${ic('chevR')}</button></div><div class="qlist stg" id="mQ">${queueHTML(6)}</div></section>
 <section class="glass card"><div class="kicker">Recently played</div><div id="mRec">${recentHTML()}</div></section>
 <section class="glass card"><div class="kicker">Library</div><form id="addyt" class="row" style="flex-wrap:nowrap"><input type="text" id="ytUrl" placeholder="Paste a YouTube or YT Music link" autocomplete="off"><button class="btn pri tap" style="flex:none">Add</button></form>
 <div class="libgrid stg">${libHTML()}</div></section>`};
V.music.after=()=>{placeYT();requestAnimationFrame(placeYT);setTimeout(placeYT,400);setTimeout(placeYT,800);lastPP=null;setPP();
 $('#bigPlay').onclick=ctl.toggle;$('#bNext').onclick=ctl.next;$('#bPrev').onclick=ctl.prev;$('#bShuf').onclick=ctl.shuffle;$('#bRep').onclick=ctl.repeat;
 $('#mOpenNP').onclick=()=>openNP($('#mArt img'));$('#mArt').onclick=()=>openNP($('#mArt img'));$('#mQall').onclick=()=>{openNP($('#mArt img'));setTimeout(()=>$('#npQbtn').click(),700)};
 qFill($('#mQ'));if(curVid)updMini();
 $('#addyt').onsubmit=e=>{e.preventDefault();const p=parseYT($('#ytUrl').value);if(!p)return toast('That doesn\u2019t look like a YouTube link.');
  if(S.music.lib.some(x=>x.id===p.id&&x.type===p.type)){toast('Already in the library.');return}
  const it={type:p.type,id:p.id,title:p.type==='video'?'Video '+p.id:'Playlist '+p.id,added:Date.now()};S.music.lib.push(it);save();fetchTitle(it);toast('Added to library.');render()};
 document.querySelectorAll('.lcard').forEach(el=>{const x=S.music.lib.find(y=>y.id===el.dataset.id);el.querySelector('[data-play]').onclick=()=>{if(x.id===S.music.cur&&ytReady&&curVid)ctl.toggle();else playItem(x)};const rm=el.querySelector('.lx');if(rm)rm.onclick=()=>{S.music.lib=S.music.lib.filter(y=>y!==x);if(S.music.cur===x.id)S.music.cur=S.music.lib[0].id;save();render()}});
 loadYTAPI()};
