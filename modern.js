(()=>{
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

// aurora background
const au=document.createElement("div");au.className="aurora";au.setAttribute("aria-hidden","true");au.innerHTML="<i></i><i></i><i></i>";document.body.prepend(au);

// glass nav on scroll
const nav=$(".nav");const onS=()=>nav&&nav.classList.toggle("scrolled",scrollY>30);addEventListener("scroll",onS,{passive:true});onS();
// Give the birthday portrait its full screen: hide the fixed header only while
// the cutout chapter occupies the viewport, then restore it automatically.
const portraitScene=$(".vi");
if(nav&&portraitScene&&"IntersectionObserver" in window){
 const portraitNavObserver=new IntersectionObserver(([entry])=>{
  nav.classList.toggle("nav-portrait-hidden",entry.isIntersecting);
 },{rootMargin:"-10% 0px -10% 0px",threshold:0});
 portraitNavObserver.observe(portraitScene);
}

// Keep the complete hero headline visible on every device. Animated word wrappers
// could remain paused/transparent after iOS Safari restores a page from cache.
// The typography and gentle entrance styling are handled by CSS instead.

// magnetic buttons + ripple
if(fine&&!reduce)$$(".primary,.world-invite,.cake-spin,.cake-cut-launch").forEach(b=>{
 b.addEventListener("pointermove",e=>{const r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.22)+"px "+((e.clientY-r.top-r.height/2)*.3)+"px"});
 b.addEventListener("pointerleave",()=>b.style.translate="0 0")});
document.addEventListener("pointerdown",e=>{const b=e.target.closest&&e.target.closest(".primary,.world-invite,.cake-spin,.cake-cut-launch,.quiz-choice,.quiz-pop-button");if(!b)return;
 const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)/3,s=document.createElement("span");s.className="ripple";
 s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.append(s);setTimeout(()=>s.remove(),700)});

// 3D tilt + light follow on cards (inner elements only, so existing reveal/3D transforms are untouched)
if(fine&&!reduce)$$(".film-visual,.quiz-stage,.cake-showcase .cake-stage").forEach(el=>{
 el.classList.add("tilt");if(getComputedStyle(el).position==="static")el.style.position="relative";
 el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  el.style.transform=`perspective(900px) rotateX(${(.5-y)*10}deg) rotateY(${(x-.5)*12}deg) scale(1.02)`;el.style.setProperty("--mx",x*100+"%");el.style.setProperty("--my",y*100+"%")});
 el.addEventListener("pointerleave",()=>el.style.transform="")});

// cursor glow + sparkle trail
if(fine&&!reduce){const g=document.createElement("div");g.className="glow-cursor";document.body.append(g);let tx=0,ty=0,cx=0,cy=0,last=0;
 addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY;g.style.opacity=1;const n=performance.now();if(n-last>70){last=n;
  const s=document.createElement("span");s.className="sparkle";s.textContent=["✦","✿","♡","✧"][Math.random()*4|0];s.style.left=tx+"px";s.style.top=ty+"px";
  s.style.setProperty("--dx",(Math.random()*50-25)+"px");s.style.setProperty("--dy",(Math.random()*50+10)+"px");document.body.append(s);setTimeout(()=>s.remove(),900)}});
 let cursorFrame=0;
 const follow=()=>{cursorFrame=0;if(document.hidden)return;
  cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;g.style.transform=`translate(${cx}px,${cy}px)`;
  if(Math.abs(tx-cx)>.25||Math.abs(ty-cy)>.25)cursorFrame=requestAnimationFrame(follow);
 };
 const scheduleCursor=()=>{if(!cursorFrame&&!document.hidden)cursorFrame=requestAnimationFrame(follow)};
 addEventListener("pointermove",scheduleCursor,{passive:true});
 document.addEventListener("visibilitychange",scheduleCursor);}

// Hero pointer easing is owned by experience.js. Do not write the same
// transform from two competing listeners (caused desktop parallax jitter).

// falling golden petals (canvas, pauses when tab hidden)
if(!reduce&&!navigator.connection?.saveData){const c=document.createElement("canvas");c.id="petals";c.setAttribute("aria-hidden","true");document.body.append(c);const x=c.getContext("2d");
 let W,H,dpr=1,resizeFrame=0;
 const rs=()=>{W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,W<750?1.25:1.75);c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);x.setTransform(dpr,0,0,dpr,0,0)};
 rs();addEventListener("resize",()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;rs()})},{passive:true});
 const N=innerWidth<700?12:28,cols=["#ffd24a","#ffe9a8","#ffb5d2","#fff6cf"];
 const mk=(top)=>({x:Math.random()*W,y:top?-20:Math.random()*H,r:4+Math.random()*7,vy:.35+Math.random()*.9,sw:Math.random()*Math.PI*2,sp:.01+Math.random()*.02,rot:Math.random()*6,vr:(Math.random()-.5)*.03,c:cols[Math.random()*cols.length|0],a:.35+Math.random()*.5});
 const P=Array.from({length:N},()=>mk(false));
 let raf=0,lastPaint=0;
 const mobilePetals=()=>innerWidth<750;
 function tick(time){
  raf=0;
  if(document.hidden)return;
  // Mobile: ~24fps with a capped canvas resolution; desktop: ~30fps.
  const interval=mobilePetals()?42:33;
  if(time-lastPaint<interval){raf=requestAnimationFrame(tick);return}
  const step=lastPaint?Math.min(3,(time-lastPaint)/16.7):1;
  lastPaint=time;
  x.clearRect(0,0,W,H);P.forEach((p,i)=>{p.y+=p.vy*step;p.sw+=p.sp*step;p.x+=Math.sin(p.sw)*.7*step;p.rot+=p.vr*step;if(p.y>H+20)P[i]=mk(true);
  x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=p.a;x.fillStyle=p.c;x.beginPath();x.ellipse(0,0,p.r,p.r*.55,0,0,6.283);x.fill();x.restore()});
  raf=requestAnimationFrame(tick);
 }
 const start=()=>{if(!raf&&!document.hidden){lastPaint=0;raf=requestAnimationFrame(tick)}};
 document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()});
 start()}
})();
// Rockstar-style layered scroll scene
(()=>{const t=document.querySelector(".vi-track");if(!t)return;
const $=s=>t.querySelector(s),sub=$(".vi-subject"),l1=$(".l1"),l2=$(".l2"),sun=$(".vi-sun"),sky2=$(".vi-sky2"),cap=$(".vi-cap"),hint=$(".vi-hint");
const cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const G=["✿","❀","✦","♡","✻","❁"];
const mk=(box,n,near)=>{const L=[];for(let i=0;i<n;i++){const s=document.createElement("span");s.textContent=G[i%G.length];const sz=near?26+Math.random()*50:14+Math.random()*26;
 s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*110}%;font-size:${sz}px;opacity:${near?.9:.55}`;box.append(s);L.push({s,k:(near?1.3:.4)+Math.random()*(near?1.2:.5),r:Math.random()*40-20})}return L};
const far=mk($(".vi-far"),innerWidth<750?9:14,false),near=mk($(".vi-near"),innerWidth<750?6:9,true);
if(rm)return;let mx=0,my=0,tick=false;
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;req()});
function upd(){tick=false;const r=t.getBoundingClientRect();
 // Avoid 3D transforms and expensive image effects when the cutout is offscreen.
 if(r.bottom<-innerHeight||r.top>innerHeight*2)return;
 const p=cl(-r.top/Math.max(1,r.height-innerHeight)),m=innerWidth<750;
 const intro=ez(cl(p/.18)),z=ez(cl((p-.08)/.8)),late=ez(cl((p-.7)/.3));
 // her: rises in, then zooms toward the camera
 // Keep the cutout head fully inside the visible viewport during the zoom.
 const visibleHeight=window.visualViewport?.height||innerHeight;
 const maximumZoom=m?1.20:1.14;
 const safeZoom=Math.max(1,Math.min(maximumZoom,(visibleHeight-Math.max(20,visibleHeight*.05))/Math.max(1,sub.offsetHeight)));
 sub.style.transform=`perspective(1400px) translate3d(${mx*-16}px,${(1-intro)*34+my*-6}vh,0) rotateY(${mx*14+Math.sin(p*3.1416)*-9}deg) rotateX(${my*-6}deg) scale(${1+z*(safeZoom-1)})`;
 if(!m)sub.style.filter=`blur(${(1-intro)*10}px) drop-shadow(0 30px 50px rgba(120,50,0,.35))`;
 // giant type behind her slides apart in opposite directions and grows
 const sp=(m?60:34);l1.style.transform=`translate3d(${(.5-p)*sp*1.0+mx*30}vw,0,0) scale(${1+z*.12})`;l2.style.transform=`translate3d(${(p-.5)*sp*1.0+mx*-30}vw,0,0) scale(${1+z*.12})`;
 l1.style.opacity=l2.style.opacity=intro;
 // sun rises, sky turns from morning gold to sunset
 sun.style.transform=`translate3d(${mx*40}px,${(1-intro)*40-z*18}vh,0) scale(${.6+z*.7})`;sky2.style.opacity=ez(cl((p-.35)/.55));
 // flowers at different depths
 far.forEach(o=>o.s.style.transform=`translate3d(${mx*-30*o.k}px,${-p*70*o.k}vh,0) rotate(${o.r+p*180*o.k}deg)`);
 near.forEach(o=>o.s.style.transform=`translate3d(${mx*-90*o.k}px,${-p*170*o.k}vh,0) rotate(${o.r+p*260*o.k}deg)`);
 cap.style.opacity=late;cap.style.transform=`translate(-50%,${(1-late)*30}px)`;hint.style.opacity=1-cl(p/.1)}
function req(){if(!tick){tick=true;requestAnimationFrame(upd)}}
addEventListener("scroll",req,{passive:true});addEventListener("resize",req);upd()})();

// Pinned kinetic words
(()=>{const t=document.querySelector(".kw-track");if(!t||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
const W=[...t.querySelectorAll(".kw-words b")],bg=t.querySelector(".kw-bg"),end=t.querySelector(".kw-end"),n=W.length;
const cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v);let tick=false;
function upd(){tick=false;const r=t.getBoundingClientRect();
 if(r.bottom<-innerHeight||r.top>innerHeight*2)return;
 const p=cl(-r.top/Math.max(1,r.height-innerHeight)),s=p*n*.98,m=innerWidth<750;
 W.forEach((w,i)=>{const k=s-i,e=ez(cl(k/.32)),x=i===n-1?0:ez(cl((k-.7)/.3));
  w.style.opacity=e*(1-x);w.style.transform=`translate3d(0,${(1-e)*9-x*5}vh,0) scale(${.55+.45*e+.7*x})`;if(!m)w.style.filter=`blur(${(1-e)*14+x*18}px)`});
 if(!m)bg.style.filter=`blur(30px) hue-rotate(${s*38}deg)`;bg.style.transform=`scale(${.8+p*.5})`;end.style.opacity=cl((s-(n-1)-.45)/.4)}
const req=()=>{if(!tick){tick=true;requestAnimationFrame(upd)}};addEventListener("scroll",req,{passive:true});addEventListener("resize",req);upd()})();

// Scroll-linked text highlight, heading scale-ins, film parallax + unmask, marquee velocity skew
(()=>{if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
const cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v),$$=s=>[...document.querySelectorAll(s)];
const paras=$$(".final-inner>p:not(.small),.closing-letter p,.section-head p").map(el=>{const words=el.textContent.trim().split(/\s+/);el.textContent="";
 const sp=words.map((w,i)=>{const s=document.createElement("span");s.className="sw";s.textContent=w;el.append(s);if(i<words.length-1)el.append(" ");return s});return{el,sp}});
const heads=$$(".section-head h2,.final-inner h2"),films=$$(".film-card"),quiz=document.querySelector(".birthday-quiz-card"),mq=document.querySelector(".marquee");
let last=scrollY,v=0,tick=false;
function frame(){tick=false;const H=innerHeight,m=innerWidth<750;
 paras.forEach(({el,sp})=>{const r=el.getBoundingClientRect();if(r.bottom<-50||r.top>H)return;const q=cl((H*.9-r.top)/(H*.42)),N=sp.length;sp.forEach((s,i)=>s.style.opacity=.18+.82*cl((q*(N+4)-i)/4))});
 heads.forEach(h=>{const r=h.getBoundingClientRect();if(r.bottom<-50||r.top>H)return;const q=ez(cl((H-r.top)/(H*.55)));h.style.scale=.82+.18*q;h.style.translate=`0 ${(1-q)*50}px`});
 films.forEach((c,i)=>{const r=c.getBoundingClientRect();if(r.bottom<-100||r.top>H+100)return;const off=(r.top+r.height/2-H/2)/H;c.style.translate=`0 ${off*(i%2?-1:1)*(m?18:80)}px`;
  const vis=c.querySelector(".film-visual"),q=ez(cl((H*.95-r.top)/(H*.5)));if(vis&&!m)vis.style.clipPath=`inset(${(1-q)*14}% ${(1-q)*10}% round ${36-q*14}px)`});
 if(quiz&&!m){const r=quiz.getBoundingClientRect();if(r.bottom>0&&r.top<H){const q=ez(cl((H-r.top)/(H*.6)));quiz.style.scale=.88+.12*q}}
 const dy=scrollY-last;last=scrollY;v+=(dy-v)*.18;if(mq)mq.style.transform=`skewX(${Math.max(-7,Math.min(7,-v*.18))}deg)`;
 if(Math.abs(v)>.05||Math.abs(dy)>0)req()}
function req(){if(!tick){tick=true;requestAnimationFrame(frame)}}
addEventListener("scroll",req,{passive:true});addEventListener("resize",req);frame()})();

// ===== FINAL POLISH =====
(()=>{
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
const cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v),$=s=>document.querySelector(s);
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
// splash
const sp=document.createElement("div");sp.id="splash";sp.className="splash";sp.setAttribute("aria-hidden","true");
sp.innerHTML='<div class="splash-in"><div class="splash-heart">'+HEART+'</div><p>some bonds stay golden</p><small>TAP TO ENTER</small><span class="splash-bar"><i></i></span></div>';
if(!rm)document.body.prepend(sp);
const done=()=>{if(done.d)return;done.d=1;document.documentElement.classList.remove("lock");document.body.classList.add("loaded");sp.classList.add("out");setTimeout(()=>sp.remove(),1300)};
if(rm){document.body.classList.add("loaded")}else{document.documentElement.classList.add("lock");setTimeout(done,2700);sp.addEventListener("click",done)}
// hearts: burst + rain
const cols=["#ff4d79","#ff8fab","#ffc84a","#fff3b0","#ff7a18"];
const burst=(x,y,n=10)=>{for(let i=0;i<n;i++){const s=document.createElement("span"),a=Math.random()*6.283,d=50+Math.random()*90;s.className="burst";s.textContent="♥";s.style.cssText=`left:${x}px;top:${y}px;color:${cols[i%5]};--s:${12+Math.random()*20}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-30}px;--r:${Math.random()*120-60}deg`;document.body.append(s);setTimeout(()=>s.remove(),1000)}};
const rain=(n=34)=>{for(let i=0;i<n;i++){const s=document.createElement("span");s.className="hrain";s.textContent=["♥","❤","♡","✿"][i%4];s.style.cssText=`left:${Math.random()*100}vw;color:${cols[i%5]};font-size:${14+Math.random()*30}px;--d:${3+Math.random()*3}s;--dx:${Math.random()*160-80}px;--r:${Math.random()*360}deg;animation-delay:${Math.random()*1.4}s`;document.body.append(s);setTimeout(()=>s.remove(),7500)}};
if(!rm){addEventListener("pointerdown",e=>burst(e.clientX,e.clientY,e.pointerType==="touch"?7:10));
 addEventListener("dblclick",e=>rain(40));addEventListener("keydown",e=>{if(e.key.toLowerCase()==="h"&&!/input|textarea/i.test(e.target.tagName))rain(40)});}
// heart cursor
if(fine&&!rm){const c=document.createElement("div"),r=document.createElement("div");c.className="hc";c.innerHTML=HEART;r.className="hc-ring";document.body.append(r,c);document.documentElement.classList.add("has-hc");
 let tx=innerWidth/2,ty=innerHeight/2,cx=tx,cy=ty,rx=tx,ry=ty;
 addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY;const hot=!!e.target.closest("a,button,[role=button],.quiz-choice,.film-card,.wish,input,summary,label");c.classList.toggle("hot",hot);r.classList.toggle("hot",hot);c.classList.remove("away");r.classList.remove("away")});
 document.addEventListener("pointerleave",()=>{c.classList.add("away");r.classList.add("away")});
 let heartFrame=0;
 const follow=()=>{heartFrame=0;if(document.hidden)return;
  cx+=(tx-cx)*.45;cy+=(ty-cy)*.45;rx+=(tx-rx)*.14;ry+=(ty-ry)*.14;
  c.style.transform=`translate(${cx}px,${cy}px)`;r.style.transform=`translate(${rx}px,${ry}px)`;
  if(Math.abs(tx-cx)>.25||Math.abs(ty-cy)>.25||Math.abs(tx-rx)>.25||Math.abs(ty-ry)>.25)
   heartFrame=requestAnimationFrame(follow);
 };
 const scheduleHeart=()=>{if(!heartFrame&&!document.hidden)heartFrame=requestAnimationFrame(follow)};
 addEventListener("pointermove",scheduleHeart,{passive:true});
 document.addEventListener("visibilitychange",scheduleHeart);}
// chapter dots
const map=[[".vi","Hello"],[".kw","Wishes"],["#memories","Quiz"],["#journey","Memories"],["#film-reel","Replays"],[".story","Story"],[".h3","Heart"],[".cb","Five wishes"],["#birthday-cake","Cake"],["#golden-bouquet","Bouquet"],[".bigtype","Party"],["#birthday-wish","Wish"]].map(([s,l])=>({el:$(s),l})).filter(o=>o.el);
const nav=document.createElement("nav");nav.className="chap";nav.setAttribute("aria-label","Chapters");
map.forEach(o=>{const a=document.createElement("a");a.href="#";a.setAttribute("aria-label",o.l);a.innerHTML="<span>"+o.l+"</span>";a.addEventListener("click",e=>{e.preventDefault();o.el.scrollIntoView({behavior:rm?"auto":"smooth"})});nav.append(a);o.a=a});document.body.append(nav);
let chapterFrame=0;
 const act=()=>{chapterFrame=0;let cur=null;map.forEach(o=>{if(o.el.getBoundingClientRect().top<innerHeight*.5)cur=o});map.forEach(o=>o.a.classList.toggle("on",o===cur))};
 const scheduleChapters=()=>{if(!chapterFrame)chapterFrame=requestAnimationFrame(act)};
 addEventListener("scroll",scheduleChapters,{passive:true});addEventListener("resize",scheduleChapters,{passive:true});act();
// giant type band driven by scroll
const bt=$(".bigtype");if(bt&&!rm){const r1=bt.querySelector(".r1"),r2=bt.querySelector(".r2");let tk=false;
 const u=()=>{tk=false;const r=bt.getBoundingClientRect(),q=cl((innerHeight-r.top)/(innerHeight+r.height));r1.style.transform=`translate3d(${-8-q*42}vw,0,0) rotateX(${(.5-q)*34}deg)`;r2.style.transform=`translate3d(${-95+q*45}vw,0,0) rotateX(${(q-.5)*34}deg)`};
 addEventListener("scroll",()=>{if(!tk){tk=true;requestAnimationFrame(u)}},{passive:true});u()}
})();

// 3D wish cube (pinned, scroll-rotated) + scroll-driven cake spin
(()=>{const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v);if(rm)return;
const T=document.querySelector(".cb-track");
if(T){const cube=T.querySelector(".cb-cube"),wrap=T.querySelector(".cb-wrap"),cnt=T.querySelector(".cb-count span");
 const S=[[0,0],[0,-90],[0,-180],[0,-270],[-90,-270]];let mx=0,my=0,tk=false;
 addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;req()});
 function upd(){tk=false;const r=T.getBoundingClientRect(),p=cl(-r.top/(r.height-innerHeight)),f=p*(S.length-1),i=Math.min(S.length-2,Math.floor(f)),t=ez(cl((f-i-.25)/.5));
  cube.style.transform=`rotateX(${S[i][0]+(S[i+1][0]-S[i][0])*t}deg) rotateY(${S[i][1]+(S[i+1][1]-S[i][1])*t}deg)`;
  wrap.style.transform=`rotateX(${-14+my*-10}deg) rotateY(${22+mx*16}deg)`;cnt.textContent="0"+(Math.round(f)+1)}
 function req(){if(!tk){tk=true;requestAnimationFrame(upd)}}addEventListener("scroll",req,{passive:true});addEventListener("resize",req);upd()}
const c=document.getElementById("cake-3d"),s=document.getElementById("birthday-cake");
if(c&&s){let tk=false;const u=()=>{tk=false;const r=s.getBoundingClientRect(),q=cl((innerHeight-r.top)/(innerHeight+r.height));c.style.rotate=`0 1 0 ${(q-.5)*480}deg`};
 addEventListener("scroll",()=>{if(!tk){tk=true;requestAnimationFrame(u)}},{passive:true});u()}
})();