/* A real three-dimensional birthday cake: rings of CSS 3D faces, frosted
 * circular tier tops and rotating candles. GPU-only motion, no 3D CDN.
 */
(()=>{
"use strict";
const stage=document.getElementById("cake-stage");
const cake=document.getElementById("cake-3d");
const button=document.getElementById("cake-spin");
const caption=document.getElementById("cake-caption");
if(!stage||!cake||!button)return;
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const small=matchMedia("(max-width:650px)");
const tiers=[...cake.querySelectorAll(".cake-tier")];
let faces=small.matches?22:28;
tiers.forEach(tier=>{
 const radius=Number(tier.dataset.radius)||95;
 const height=Number(tier.dataset.height)||70;
 const y=Number(tier.dataset.y)||0;
 const width=2*radius*Math.tan(Math.PI/faces)+.5;
 tier.style.setProperty("--radius",radius+"px");
 tier.style.setProperty("--height",height+"px");
 tier.style.setProperty("--y",y+"px");
 tier.style.setProperty("--panel-width",width+"px");
 // Inline positioning avoids CSS calc division in older mobile Safari.
 for(let i=0;i<faces;i++){
  const face=document.createElement("span");
  face.className="cake-panel";
  face.style.left=(-width/2)+"px";
  face.style.top=(-height/2)+"px";
  face.style.width=width+"px";
  face.style.height=height+"px";
  face.style.setProperty("--angle",i*360/faces+"deg");
  tier.append(face);
 }
 const top=document.createElement("span");
 top.className="cake-top-disc";
 top.style.left=(-radius)+"px";
 top.style.top=(-radius)+"px";
 top.style.width=(radius*2)+"px";
 top.style.height=(radius*2)+"px";
 top.style.transform="translateY("+(y-height/2)+"px) rotateX(90deg)";
 tier.append(top);
});
let angle=12,boost=0,frame=0,visible=true,dragging=false,previousX=0,dragDistance=0,quietUntil=0,lastFrameTime=0,celebrations=0;
const scale=()=>small.matches?(innerWidth<365?.65:.75):1;
const paint=()=>{cake.style.transform="rotateX(-18deg) rotateY("+angle.toFixed(2)+"deg) scale("+scale()+")"};
function animate(timestamp){
 frame=0;
 if(!visible||document.hidden||reduced.matches)return;
 const elapsed=Math.min(lastFrameTime?timestamp-lastFrameTime:16,48);
 lastFrameTime=timestamp;
 if(!dragging&&timestamp>quietUntil){
  angle=(angle+elapsed*(.017+boost))%360;
  if(boost>0)boost=Math.max(0,boost-elapsed*.000016);
  paint();
 }
 frame=requestAnimationFrame(animate);
}
function start(){if(!frame&&visible&&!document.hidden&&!reduced.matches){lastFrameTime=0;frame=requestAnimationFrame(animate)}}
function stop(){if(frame){cancelAnimationFrame(frame);frame=0}}
const watcher=new IntersectionObserver(entries=>{
 visible=entries[0]?.isIntersecting??false;
 if(visible)start();else stop();
},{threshold:.02,rootMargin:"150px"});
watcher.observe(stage);
document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else start()});
reduced.addEventListener?.("change",()=>{paint();if(reduced.matches)stop();else start()});
small.addEventListener?.("change",()=>{paint()});
paint();
stage.addEventListener("pointerdown",event=>{
 if(event.button!==undefined&&event.button!==0)return;
 dragging=true;previousX=event.clientX;dragDistance=0;
 quietUntil=performance.now()+1800;
 if(stage.setPointerCapture)stage.setPointerCapture(event.pointerId);
});
stage.addEventListener("pointermove",event=>{
 if(!dragging)return;
 const dx=event.clientX-previousX;
 previousX=event.clientX;dragDistance+=Math.abs(dx);
 angle=(angle+dx*.63+3600)%360;paint();
});
function stopDrag(event){
 if(!dragging)return;
 dragging=false;quietUntil=performance.now()+1700;
 if(stage.hasPointerCapture?.(event.pointerId))stage.releasePointerCapture(event.pointerId);
 if(dragDistance<9)celebrate();
}
stage.addEventListener("pointerup",stopDrag);
stage.addEventListener("pointercancel",()=>{dragging=false;quietUntil=performance.now()+500});
const messages=[
 "Wishing you sunshine, laughter, and a beautiful year ahead. ♡",
 "May the happiest days find you in the simplest little moments. ♡",
 "Here’s to more smiles, more adventures, and every good thing you deserve. ♡",
 "Happy birthday! You deserve a day as bright as your favorite color. ☀"
];
function petals(){
 if(reduced.matches)return;
 const layer=document.createElement("div");layer.className="cake-petals";layer.setAttribute("aria-hidden","true");
 stage.append(layer);
 for(let i=0;i<22;i++){
  const petal=document.createElement("span");petal.className="cake-petal";
  petal.textContent=i%4===0?"❀":i%3===0?"♥":"●";
  petal.style.setProperty("--petal-angle",i*360/22+"deg");
  petal.style.setProperty("--petal-distance",(90+(i%6)*28)+"px");
  petal.style.setProperty("--delay",i%5*35+"ms");
  layer.append(petal);
 }
 setTimeout(()=>layer.remove(),1900);
}
function celebrate(){
 celebrations++;
 boost=.30;quietUntil=0;
 caption.textContent=messages[celebrations%messages.length];
 petals();start();
}
button.addEventListener("click",celebrate);
stage.addEventListener("keydown",e=>{
 if(e.key==="Enter"||e.key===" "){e.preventDefault();celebrate()}
});
})();