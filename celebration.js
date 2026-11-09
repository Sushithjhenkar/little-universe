/* Golden Birthday — intimate, tactile cake cutting and flower arranging.
   Original cinematic site preserved. No external runtime, no private media. */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)");
const cakeShowcase=$(".cake-showcase"),openCut=$("#cake-cut-launch"),closeCut=$("#cake-cut-close");
const cutExperience=$("#cake-cut-experience"),cutScene=$("#birthday-slice-scene");
const cutButton=$("#cake-slice-action"),resetCake=$("#cake-slice-reset"),cutStatus=$("#cake-cut-message");
const flowerButtons=$$(".pick-flower-button"),stems=$("#bouquet-stems");
const count=$("#bouquet-count"),flowerStatus=$("#bouquet-message"),present=$("#bouquet-present"),reset=$("#bouquet-reset"),dedication=$("#bouquet-dedication"),flowerScene=$("#bouquet-3d-scene");
if(!cakeShowcase||!openCut||!cutExperience||!cutScene||!stems||!present)return;
let isCut=false,cutting=false,cutTimer=0,pointerStart=null;
let burstCount=0,burstLayer=null;
const picked=new Set();
const wishes=[
 "For every little reason to smile. ♡",
 "For the calm and warmth you deserve. ☀",
 "For all the adventures still waiting for you. 🌼",
 "For sunshine even on cloudy days. 💛",
 "For a birthday as bright as your favorite color. 💐"
];
function burst(source,quantity=36){
 if(reduce.matches)return;
 if(burstLayer){burstLayer.remove();burstLayer=null}
 const origin=source?.getBoundingClientRect();
 const x=origin?(origin.left+origin.width/2)/innerWidth*100:50;
 const y=origin?(origin.top+origin.height/2)/innerHeight*100:48;
 const layer=document.createElement("div");
 layer.className="celebration-burst";layer.setAttribute("aria-hidden","true");
 document.body.append(layer);burstLayer=layer;
 const colors=["#d59c39","#ffdc70","#eeb99f","#fffce7","#aacb91"];
 const n=innerWidth<700?Math.min(quantity,26):quantity;
 for(let i=0;i<n;i++){
  const petal=document.createElement("i");
  petal.textContent=i%6===0?"✿":i%3===0?"♡":"•";
  petal.style.setProperty("--start-x",x+"vw");
  petal.style.setProperty("--start-y",y+"vh");
  petal.style.setProperty("--color",colors[i%colors.length]);
  petal.style.setProperty("--size",(11+i%5*3)+"px");
  const angle=Math.PI*2*i/n;
  const distance=95+(i*41)%265;
  petal.style.setProperty("--dx",Math.round(Math.cos(angle)*distance)+"px");
  petal.style.setProperty("--dy",Math.round(Math.sin(angle)*distance-45)+"px");
  petal.style.setProperty("--spin",((i%2?1:-1)*(90+(i*37)%260))+"deg");
  petal.style.setProperty("--delay",((i%5)*.025)+"s");
  petal.style.setProperty("--duration",(1.1+(i%5)*.16)+"s");
  layer.append(petal);
 }
 const thisLayer=layer;
 setTimeout(()=>{thisLayer.remove();if(burstLayer===thisLayer)burstLayer=null},2350);
}
function setCutOpen(open){
 if(open){
  cutExperience.hidden=false;
  cakeShowcase.classList.add("is-cutting");
  openCut.setAttribute("aria-expanded","true");
  requestAnimationFrame(()=>{
   const scroller=cutExperience.getBoundingClientRect();
   if(scroller.bottom>innerHeight-28||scroller.top<18)
    cutExperience.scrollIntoView({block:"center",behavior:reduce.matches?"instant":"smooth"});
   closeCut.focus({preventScroll:true});
  });
 }else{
  cutExperience.hidden=true;
  cakeShowcase.classList.remove("is-cutting");
  openCut.setAttribute("aria-expanded","false");
  clearTimeout(cutTimer);cutting=false;
  openCut.focus({preventScroll:true});
 }
}
function makeSlice(){
 if(cutting||isCut)return;
 cutting=true;
 cutScene.classList.add("is-cutting");
 cutStatus.textContent="A little birthday magic is happening… ♡";
 cutTimer=setTimeout(()=>{
  cutScene.classList.add("is-sliced");
  isCut=true;cutting=false;
  cutStatus.textContent="The first slice is yours! Happy Birthday, sunshine. 🎂💛";
  cutButton.textContent="Slice served ✓";
  cutButton.disabled=true;
  burst(cutScene,54);
 },reduce.matches?0:410);
}
openCut.addEventListener("click",()=>setCutOpen(true));
closeCut.addEventListener("click",()=>setCutOpen(false));
cutButton.addEventListener("click",makeSlice);
resetCake.addEventListener("click",()=>{
 clearTimeout(cutTimer);cutting=false;isCut=false;
 cutScene.classList.remove("is-cutting","is-sliced");
 cutStatus.textContent="Another slice? Make another birthday wish! ✨";
 cutButton.textContent="Cut the first slice ✂";
 cutButton.disabled=false;
});
cutScene.addEventListener("pointerdown",event=>{
 if(event.button!==undefined&&event.button!==0)return;
 pointerStart={x:event.clientX,y:event.clientY};
});
cutScene.addEventListener("pointerup",event=>{
 if(!pointerStart)return;
 const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;
 pointerStart=null;
 if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.12)makeSlice();
});
cutScene.addEventListener("pointercancel",()=>{pointerStart=null});
cutScene.addEventListener("keydown",event=>{
 if(event.key==="Enter"||event.key===" "){event.preventDefault();makeSlice()}
});
document.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&!cutExperience.hidden)setCutOpen(false);
});
const flowerAngles=[-31,-15,0,15,30];
const flowerHues=[0,-6,7,13,-10,8,18];
function pick(button){
 const key=Number(button.dataset.flower);
 if(!Number.isInteger(key)||picked.has(key)||picked.size>=5)return;
 picked.add(key);button.classList.add("is-picked");button.disabled=true;
 const index=picked.size-1;
 const stem=document.createElement("span");
 stem.className="bouquet-stem";
 stem.style.setProperty("--angle",flowerAngles[index]+"deg");
 stem.style.setProperty("--hue",flowerHues[key]+"deg");
 const head=document.createElement("span");head.className="bouquet-head";
 head.style.filter="hue-rotate("+flowerHues[key]+"deg)";
 stem.append(head);stems.append(stem);
 count.textContent=picked.size+" / 5 picked";
 flowerStatus.textContent=wishes[index];
 if(picked.size===5){
  present.disabled=false;
  flowerStatus.textContent="Five golden blooms, one beautiful birthday bouquet. 💛";
  burst(flowerScene,24);
 }
}
flowerButtons.forEach(button=>button.addEventListener("click",()=>pick(button)));
present.addEventListener("click",()=>{
 if(picked.size<5||flowerScene.classList.contains("is-presented"))return;
 flowerScene.classList.add("is-presented");
 dedication.hidden=false;
 flowerStatus.textContent="A whole bouquet of sunshine, made just for you. 💐";
 present.textContent="Bouquet delivered ♡";
 present.disabled=true;
 burst(flowerScene,58);
});
reset.addEventListener("click",()=>{
 picked.clear();
 flowerButtons.forEach(button=>{button.classList.remove("is-picked");button.disabled=false});
 stems.replaceChildren();
 flowerScene.classList.remove("is-presented");
 count.textContent="0 / 5 picked";
 flowerStatus.textContent="The bouquet is waiting for its first flower. 💛";
 dedication.hidden=true;present.disabled=true;present.textContent="Present the bouquet 💐";
});
const bouquetCard=$(".golden-bouquet-card");
if(bouquetCard&&!reduce.matches&&matchMedia("(hover:hover) and (pointer:fine)").matches){
 let frame=0,px=0,py=0;
 bouquetCard.addEventListener("pointermove",e=>{
  const box=bouquetCard.getBoundingClientRect();
  px=(e.clientX-box.left)/box.width-.5;py=(e.clientY-box.top)/box.height-.5;
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;
   flowerScene.style.transform="rotateY("+(px*4).toFixed(2)+"deg) rotateX("+(-py*3).toFixed(2)+"deg)";
  });
 },{passive:true});
 bouquetCard.addEventListener("pointerleave",()=>{flowerScene.style.transform=""});
}
})();
