(()=>{"use strict";
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const $=selector=>document.querySelector(selector);
const canvas=$("#stars"),ctx=canvas?.getContext("2d");
let width=0,height=0,scale=1,stars=[],tick=0,lastFrame=0,starFrame=0,heroVisible=true;
function resizeStars(){
 if(!ctx)return;
 scale=Math.min(window.devicePixelRatio||1,innerWidth<801?1.4:1.8);
 width=canvas.width=Math.max(1,Math.round(innerWidth*scale));
 height=canvas.height=Math.max(1,Math.round(innerHeight*scale));
 stars=Array.from({length:Math.min(innerWidth<801?64:140,Math.round(innerWidth/8))},()=>({
 x:Math.random()*width,y:Math.random()*height,r:(Math.random()*1.25+.2)*scale,
 a:Math.random()*.7+.2,s:Math.random()*.003+.001
 }));
 requestStars();
}
function drawStars(timestamp=0){
 starFrame=0;
 if(!ctx||!heroVisible||document.hidden)return;
 const minInterval=innerWidth<801?40:32;
 if(timestamp-lastFrame<minInterval&&!reduce){starFrame=requestAnimationFrame(drawStars);return}
 lastFrame=timestamp;
 ctx.clearRect(0,0,width,height);
 for(const star of stars){
  ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);
  ctx.fillStyle="rgba(255,225,245,"+(reduce?star.a:star.a*(.7+.3*Math.sin(tick*star.s)))+")";
  ctx.fill();
 }
 tick++;
 if(!reduce)starFrame=requestAnimationFrame(drawStars);
}
function requestStars(){if(!starFrame&&ctx&&heroVisible&&!document.hidden)starFrame=requestAnimationFrame(drawStars)}
resizeStars();
addEventListener("resize",resizeStars,{passive:true});
document.addEventListener("visibilitychange",requestStars);
const hero=$(".hero");
if(hero&&"IntersectionObserver" in window){
 new IntersectionObserver(entries=>{
  heroVisible=entries.some(entry=>entry.isIntersecting);
  requestStars();
 },{rootMargin:"100px"}).observe(hero);
}
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");reveal.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>reveal.observe(el));function progress(){const total=document.documentElement.scrollHeight-innerHeight;$("#progress").style.width=(total?scrollY/total*100:0)+"%"}addEventListener("scroll",progress,{passive:true});progress();document.querySelectorAll(".wish").forEach(b=>b.addEventListener("click",()=>{$("#wish-text").textContent=b.dataset.wish}));$("#celebrate").addEventListener("click",()=>{const colors=["#ffc6dd","#bdb1ff","#f9e8b0","#ffffff"];for(let i=0;i<(reduce?25:100);i++){const el=document.createElement("i");el.className="confetti";el.style.left=Math.random()*100+"vw";el.style.background=colors[i%colors.length];el.style.setProperty("--dx",(Math.random()*240-120)+"px");el.style.setProperty("--duration",(Math.random()*2+2)+"s");document.body.appendChild(el);el.addEventListener("animationend",()=>el.remove());if(reduce)setTimeout(()=>el.remove(),1000)}});})();