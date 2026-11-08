/* Mobile-first cinematic memory timeline.
 * Desktop: original 3D orbit. Mobile: lightweight 3D coverflow that follows
 * native page scroll (plus swipe/arrow controls). No scroll-jacking.
 * Respects the visitor's Reduced Motion system preference.
 */
(()=>{
"use strict";
const root=document.querySelector(".cosmos-timeline");
if(!root) return;
const sticky=root.querySelector(".cosmos-sticky");
const scene=root.querySelector("#cosmos-scene");
const cards=Array.from(root.querySelectorAll(".cosmos-card"));
const counter=root.querySelector("#memory-index");
const heading=root.querySelector("#memory-title");
const caption=root.querySelector("#memory-caption");
const bar=root.querySelector("#memory-progress");
const prev=root.querySelector("#memory-prev");
const next=root.querySelector("#memory-next");
if(!sticky||!scene||!cards.length) return;
const total=cards.length;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const mobile=window.matchMedia("(max-width: 800px)");
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
let target=0,position=0,frame=0,active=-1;
let nearViewport=true, touchX=null,touchY=null;
const getLength=()=>Math.max(1,root.offsetHeight-sticky.getBoundingClientRect().height);
function setCurrent(index){
 const i=clamp(index,0,total-1);
 if(i===active) return;
 active=i;
 counter.textContent=String(i+1).padStart(2,"0");
 heading.textContent=cards[i].dataset.title||"A little memory";
 caption.textContent=cards[i].dataset.caption||"A moment worth keeping.";
 if(prev) prev.disabled=i===0;
 if(next) next.disabled=i===total-1;
}
function readScroll(){
 const rect=root.getBoundingClientRect();
 const viewport=window.innerHeight||document.documentElement.clientHeight;
 nearViewport=rect.bottom>-viewport && rect.top<viewport*2;
 const distance=getLength();
 target=clamp(-rect.top/distance,0,1);
}
function draw(){
 frame=0;
 if(reduced.matches) return;
 // Avoid spending animation frames on off-screen 3D cards.
 if(!nearViewport) { position=target;return; }
 const isMobile=mobile.matches;
 const ease=isMobile?.18:.115;
 position+=(target-position)*ease;
 if(Math.abs(position-target)<.0002)position=target;
 const selected=position*(total-1);
 setCurrent(Math.round(selected));
 bar.style.width=(position*100).toFixed(2)+"%";
 const width=Math.max(320,window.innerWidth||document.documentElement.clientWidth);
 for(let i=0;i<total;i++){
   const card=cards[i];
   const delta=i-selected;
   const distance=Math.abs(delta);
   const shouldDraw=distance<(isMobile?4.5:6.5);
   card.style.visibility=shouldDraw?"visible":"hidden";
   if(!shouldDraw)continue;
   let x,y,z,rotation,scale,opacity;
   if(isMobile){
     // iOS WebKit handles this compact coverflow better than deep rotating
     // 3D planes distributed along an enormous helix.
     const radius=Math.min(width*.61,250);
     x=Math.sin(clamp(delta,-3.4,3.4)*.61)*radius;
     y=distance*11+Math.sin(delta*.72)*10;
     z=-distance*83;
     rotation=clamp(-delta*19,-57,57);
     scale=clamp(1-distance*.095,.65,1);
     opacity=clamp(1-Math.max(0,distance-1.4)*.26,.06,1);
   }else{
     // Keep the existing wide-screen 3D helix.
     const theta=delta*.83;
     const radius=Math.min(width*.25,370);
     x=Math.sin(theta)*radius;
     z=Math.cos(theta)*420-420;
     y=Math.sin(theta*.65)*110+delta*22;
     rotation=-Math.sin(theta)*33;
     scale=clamp(1-distance*.035,.65,1);
     opacity=clamp(1-Math.max(0,distance-4)*.22,.08,1);
   }
   card.style.transform="translate3d(-50%,-50%,0) translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,"+z.toFixed(1)+"px) rotateY("+rotation.toFixed(1)+"deg) scale("+scale.toFixed(3)+")";
   card.style.opacity=opacity.toFixed(3);
   card.style.zIndex=String(100-Math.round(distance*12));
 }
 if(Math.abs(position-target)>.0002)requestDraw();
}
function requestDraw(){
 if(!frame&&!reduced.matches)frame=requestAnimationFrame(draw);
}
function handleScroll(){
 readScroll();
 requestDraw();
}
function goTo(index){
 if(reduced.matches) return;
 const i=clamp(index,0,total-1);
 const rect=root.getBoundingClientRect();
 const scrollTop=window.scrollY||document.documentElement.scrollTop||0;
 const top=scrollTop+rect.top+(i/(total-1))*getLength();
 window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
 // Immediate visual feedback even before Safari reports its scroll position.
 target=i/(total-1);
 requestDraw();
}
prev?.addEventListener("click",()=>goTo(Math.round(target*(total-1))-1));
next?.addEventListener("click",()=>goTo(Math.round(target*(total-1))+1));
sticky.addEventListener("touchstart",event=>{
 if(!mobile.matches||reduced.matches||event.touches.length!==1)return;
 touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;
},{passive:true});
sticky.addEventListener("touchend",event=>{
 if(touchX===null||touchY===null||!mobile.matches||reduced.matches)return;
 const t=event.changedTouches[0];
 const dx=t.clientX-touchX,dy=t.clientY-touchY;
 touchX=touchY=null;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.35){
  goTo(Math.round(target*(total-1))+(dx<0?1:-1));
 }
},{passive:true});
root.tabIndex=0;
root.addEventListener("keydown",event=>{
 if(reduced.matches||(event.key!=="ArrowLeft"&&event.key!=="ArrowRight"))return;
 event.preventDefault();
 goTo(Math.round(target*(total-1))+(event.key==="ArrowRight"?1:-1));
});
const refresh=()=>{readScroll();if(!reduced.matches){position=target;requestDraw()}};
window.addEventListener("scroll",handleScroll,{passive:true});
window.addEventListener("resize",refresh,{passive:true});
window.visualViewport?.addEventListener("resize",refresh,{passive:true});
window.addEventListener("pageshow",refresh);
mobile.addEventListener?.("change",refresh);
reduced.addEventListener?.("change",()=>{
 root.classList.toggle("reduced-timeline",reduced.matches);
 for(const card of cards){card.style.visibility="visible";card.style.opacity="1";card.style.transform=""}
 if(!reduced.matches)refresh();
});
root.classList.toggle("reduced-timeline",reduced.matches);
readScroll();
setCurrent(clamp(Math.round(target*(total-1)),0,total-1));
if(!reduced.matches){position=target;draw()}
else{for(const card of cards){card.style.opacity="1";card.style.visibility="visible";card.style.transform=""}}
})();