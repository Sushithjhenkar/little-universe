/* ===== OUR STORY: edit this block, nothing else needs to change =====
 * met:    the date to count up from, like "2019-08-14T00:00:00" (leave null to hide the counters)
 * label:  caption under the days counter
 * events: add, remove or reorder freely. Each one is {when, title, text}.
 */
const STORY={
 met:null,
 label:"days since hello",
 events:[
  {when:"2019",title:"College",text:"Where our story began."},
  {when:"2019 · The first message",title:"“Happy birthday!”",text:"“Thank you!” Two tiny sentences that turned into a whole story."},
  {when:"2025",title:"We broke up",text:"The hardest chapter, and still a part of our story."},
  {when:"Today",title:"Some bonds stay golden",text:"A birthday wish, wrapped in a little universe."}
 ]
};
(()=>{
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v);
const list=document.getElementById("st-list"),box=document.getElementById("st-counters");if(!list)return;
const fill=list.querySelector(".st-fill");
// timeline items
STORY.events.forEach(e=>{const a=document.createElement("article");a.className="st-item";
 const w=document.createElement("span");w.className="st-when";w.textContent=e.when;
 const h=document.createElement("h3");h.textContent=e.title;const p=document.createElement("p");p.textContent=e.text;
 a.append(w,h,p);list.append(a)});
const items=[...list.querySelectorAll(".st-item")];
// live counters
const start=STORY.met?new Date(STORY.met).getTime():NaN;
if(box&&!isNaN(start)){box.hidden=false;
 box.innerHTML='<div><b data-k="d">0</b><span>'+STORY.label+'</span></div><div><b data-k="h">0</b><span>hours</span></div><div><b data-k="m">0</b><span>minutes</span></div><div><b data-k="s">0</b><span>seconds</span></div>';
 const q=k=>box.querySelector('[data-k="'+k+'"]');
 const tick=()=>{const d=Math.max(0,Date.now()-start);q("d").textContent=Math.floor(d/864e5).toLocaleString();q("h").textContent=Math.floor(d/36e5)%24;q("m").textContent=Math.floor(d/6e4)%60;q("s").textContent=Math.floor(d/1e3)%60};
 tick();setInterval(tick,1000)}
if(rm){items.forEach(i=>i.classList.add("on"));return}
// scroll-driven timeline
let tk=false;
function upd(){tk=false;const H=innerHeight,r=list.getBoundingClientRect();
 if(r.bottom<0||r.top>H*1.5)return; // no DOM painting for an offscreen chapter
 fill.style.height=(cl((H*.6-r.top)/r.height)*100)+"%";
 items.forEach((it,i)=>{const b=it.getBoundingClientRect(),q=ez(cl((H*.9-b.top)/(H*.32))),x0=innerWidth<760?40:(i%2?60:-60);
  it.style.opacity=q;it.style.transform=`perspective(1000px) translate3d(${(1-q)*x0}px,${(1-q)*24}px,0) rotateY(${(1-q)*(x0<0?30:-30)}deg) scale(${.94+.06*q})`;it.style.filter=`blur(${(1-q)*8}px)`;it.classList.toggle("on",q>.7)})}
const req=()=>{if(!tk){tk=true;requestAnimationFrame(upd)}};addEventListener("scroll",req,{passive:true});addEventListener("resize",req);upd()})();