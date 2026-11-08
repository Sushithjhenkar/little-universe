/* The Golden Garden — a playful private-media-ready birthday micro-world.
   No media IDs, passphrases, response uploads or gift secrets here.
   The public world is an illustration-only demo; protected media is fetched
   only through Cloudflare Worker first-party authenticated endpoints.
*/
(()=>{
"use strict";
const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
const map=$("#world-map"),avatar=$("#world-avatar");
if(!map||!avatar)return;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const intro=$("#intro-screen"),introStart=$("#intro-start");
const cakeArea=$("#slicing-area"),cakeStatus=$("#cake-game-status");
const flowerField=$("#flower-field"),bouquet=$("#bouquet-stems"),flowerCount=$("#flower-counter"),present=$("#bouquet-present"),flowerMessage=$("#flower-message");
const messageDialog=$("#message-dialog"),messageTitle=$("#message-title"),messageText=$("#message-text"),messageIcon=$("#message-icon");
const privateAPI=document.body.dataset.mediaApi==="/api/private/memories";
const positions={cake:[23,34],flowers:[77,34],memories:[22,83],quiz:[78,83],gift:[50,10]};
const questNames=["cake","flowers","memories","quiz"];
const quests=new Set();let player={x:50,y:57},walkToken=0,lastWalk=0,started=false,toastTimeout=null,openPortal=null;
const held=new Set();const allDialogs=$$("dialog.world-dialog");let lastActive=null;
const ease=t=>1-Math.pow(1-t,3);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function setPosition(x,y,walk=false){
 player.x=clamp(x,5,95);player.y=clamp(y,15,96);
 avatar.style.left=player.x+"%";avatar.style.top=player.y+"%";
 avatar.classList.toggle("is-walking",walk);
 const center=$(".world-center-label");if(center){center.style.left=player.x+"%";center.style.top="calc("+player.y+"% + 17px)"}
}
function toast(text){
 const el=$("#garden-toast");el.textContent=text;el.classList.add("is-on");
 clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove("is-on"),3200);
}
function confetti(x=50,y=43,count=32){
 if(reduce)return;
 const layer=$("#garden-confetti");
 const colors=["#dca64e","#ffe49a","#fffaf2","#f1bf9c","#b8c69a"];
 for(let i=0;i<count;i++){
  const part=document.createElement("span");part.className="garden-petal";
  part.textContent=i%5===0?"✿":i%3===0?"♡":"●";
  part.style.setProperty("--start-x",x+"vw");
  part.style.setProperty("--start-y",y+"vh");
  part.style.setProperty("--petal-color",colors[i%colors.length]);
  part.style.setProperty("--petal-size",(11+(i%5)*3)+"px");
  part.style.setProperty("--dx",(((i*47+13)%580)-290)+"px");
  part.style.setProperty("--dy",(-90-((i*73)%360))+"px");
  part.style.setProperty("--spin",((i%2?1:-1)*(120+(i*51)%300))+"deg");
  part.style.setProperty("--delay",(i%6*34)+"ms");
  part.style.setProperty("--duration",(1.4+(i%5)*.14)+"s");
  layer.append(part);
  setTimeout(()=>part.remove(),2700);
 }
}
function complete(place){
 if(quests.has(place))return;
 quests.add(place);
 const node=$('.world-place[data-place="'+place+'"]');node?.classList.add("is-complete");
 $("#quests-count").textContent=quests.size+" of "+questNames.length+" moments";
 $("#quests-progress").style.width=(quests.size/questNames.length*100)+"%";
 if(quests.size===questNames.length)toast("You explored every corner of our little garden! 💛");
}
function activeDialog(){return allDialogs.find(d=>d.open)||null}
function openDialog(id){
 const dlg=document.getElementById(id+"-dialog");
 if(!dlg)return;
 if(activeDialog())activeDialog().close();
 lastActive=document.activeElement;
 openPortal=id;
 try{dlg.showModal()}catch{dlg.setAttribute("open","")}
 if(id==="memories"){complete("memories");loadMemories()}
 if(id==="gift")loadGift();
 if(id==="quiz")renderQuiz();
 dlg.querySelector('[data-close]')?.focus({preventScroll:true});
}
function positionForPlace(name){
 const b=$('.world-place[data-place="'+name+'"]');
 if(!b)return positions[name]??[50,57];
 const mapRect=map.getBoundingClientRect(),rect=b.getBoundingClientRect();
 return [
  (rect.left+rect.width/2-mapRect.left)/mapRect.width*100,
  (rect.top+rect.height/2-mapRect.top)/mapRect.height*100
 ];
}
function walkTo(x,y,done){
 ++walkToken;const token=walkToken;
 const sx=player.x,sy=player.y,dist=Math.hypot(x-sx,y-sy);
 const dur=reduce?30:clamp(dist*13,300,1100);
 let begin=null;avatar.classList.add("is-walking");
 function frame(ts){
  if(token!==walkToken)return;
  if(begin===null)begin=ts;
  const t=clamp((ts-begin)/dur,0,1),p=ease(t);
  setPosition(sx+(x-sx)*p,sy+(y-sy)*p,t<1);
  if(t<1)requestAnimationFrame(frame);else{avatar.classList.remove("is-walking");done?.()}
 }
 requestAnimationFrame(frame);
}
function travelTo(place){
 if(!started){toast("Enter the garden first! ♡");return}
 const [x,y]=positionForPlace(place);
 walkTo(x,y+4,()=>openDialog(place));
}
$$(".world-place").forEach(btn=>btn.addEventListener("click",e=>{
 e.stopPropagation();travelTo(btn.dataset.place);
}));
map.addEventListener("click",event=>{
 if(!started||event.target.closest(".world-place"))return;
 const rect=map.getBoundingClientRect();
 walkTo((event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100);
});
const keyDirs={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down"};
function canWalk(){return started&&!intro.contains(document.activeElement)&&!activeDialog()&&!messageDialog.open}
document.addEventListener("keydown",event=>{
 if(!canWalk()||event.target.closest("input,textarea,select"))return;
 const direction=keyDirs[event.code];
 if(direction){held.add(direction);event.preventDefault();++walkToken}
 if(event.code==="Enter"&&document.activeElement===map){
  const near=Object.entries(positions).map(([name])=>({name,loc:positionForPlace(name)})).filter(p=>Math.hypot(p.loc[0]-player.x,p.loc[1]-player.y)<15)[0];
  if(near){event.preventDefault();openDialog(near.name)}
 }
});
document.addEventListener("keyup",event=>{if(keyDirs[event.code])held.delete(keyDirs[event.code])});
document.addEventListener("blur",()=>held.clear());
let lastFrame=0;
function walking(ts){
 if(lastFrame===0)lastFrame=ts;
 const delta=Math.min(ts-lastFrame,52)/1000;lastFrame=ts;
 if(canWalk()&&held.size){
  const dx=(held.has("right")?1:0)-(held.has("left")?1:0);
  const dy=(held.has("down")?1:0)-(held.has("up")?1:0);
  if(dx||dy){const d=Math.hypot(dx,dy);setPosition(player.x+dx/d*26*delta,player.y+dy/d*31*delta,true)}
 }else if(!canWalk()||!held.size){if(!walkToken||held.size===0)avatar.classList.remove("is-walking")}
 requestAnimationFrame(walking);
}
requestAnimationFrame(walking);
$$("[data-move]",$("#world-dpad")).forEach(button=>{
 const dir=button.dataset.move;
 button.addEventListener("pointerdown",e=>{if(!started)return;held.add(dir);++walkToken;button.setPointerCapture?.(e.pointerId)});
 const release=()=>held.delete(dir);
 ["pointerup","pointercancel","lostpointercapture"].forEach(type=>button.addEventListener(type,release));
 button.addEventListener("click",()=>{if(!started)return;const d={up:[0,-3],down:[0,3],left:[-3,0],right:[3,0]}[dir];setPosition(player.x+d[0],player.y+d[1])});
});
for(let i=0;i<135;i++){
 const pos=document.createElement("span"),flower=i%11===0?"✿":i%7===0?"♡":"•";
 const x=((i*73+17)%997)/10,y=((i*103+41)%953)/10;
 pos.textContent=flower;pos.style.left=x+"%";pos.style.top=y+"%";
 pos.style.setProperty("--size",(flower==="•"?5:9+i%3*3)+"px");
 pos.style.setProperty("--color",["#f4e4a8","#f7d46b","#fff7c7","#91b87b"][i%4]);
 pos.style.setProperty("--opacity",(.3+(i%5)*.1).toFixed(2));
 pos.style.setProperty("--rot",((i*27)%60-30)+"deg");
 pos.style.setProperty("--duration",(3+i%5)+"s");
 $("#garden-sprinkles").append(pos);
}
let playerMusic=null,musicPlaying=false;
function initMusic(){
 if(typeof SC==="undefined"||!SC.Widget)return;
 try{
  playerMusic=SC.Widget($("#garden-soundcloud"));
  playerMusic.bind(SC.Widget.Events.FINISH,()=>{if(musicPlaying){playerMusic.seekTo(0);playerMusic.play()}});
  playerMusic.bind(SC.Widget.Events.PLAY,()=>{$("#music-label").textContent="Pause music";$("#music-toggle").setAttribute("aria-pressed","true");musicPlaying=true});
  playerMusic.bind(SC.Widget.Events.PAUSE,()=>{$("#music-label").textContent="Play music";$("#music-toggle").setAttribute("aria-pressed","false");musicPlaying=false});
 }catch{playerMusic=null}
}
function toggleMusic(){
 if(!playerMusic)initMusic();
 if(!playerMusic){toast("You can play the music from the classic story page ♫");return}
 if(musicPlaying){playerMusic.pause()}else{playerMusic.play()}
}
$("#music-toggle").addEventListener("click",toggleMusic);
introStart.addEventListener("click",()=>{
 started=true;intro.classList.add("is-gone");intro.setAttribute("aria-hidden","true");
 map.focus({preventScroll:true});
 setTimeout(()=>intro.remove(),750);
 confetti(50,50,38);
 if(!playerMusic)initMusic();
 if(playerMusic){playerMusic.play()}else toast("Tap Play music if you want the soundtrack ♫");
});
allDialogs.forEach(dialog=>{
 dialog.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>dialog.close()));
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener("close",()=>{
  if(dialog.id==="memories-dialog"){const video=$("#world-video");video.pause()}
  held.clear();if(lastActive?.isConnected)lastActive.focus({preventScroll:true});
 });
});
function message(title,text,icon="💛"){
 messageTitle.textContent=title;messageText.textContent=text;messageIcon.textContent=icon;
 if(!messageDialog.open){try{messageDialog.showModal()}catch{messageDialog.setAttribute("open","")}}
 $("#message-close").focus({preventScroll:true});
}
$("#message-close").addEventListener("click",()=>messageDialog.close());
messageDialog.addEventListener("click",e=>{if(e.target===messageDialog)messageDialog.close()});
function cutCake(){
 if(cakeArea.classList.contains("is-cut")){toast("The cake is already cut! Want another slice? ♡");return}
 cakeArea.classList.add("is-cut");cakeStatus.textContent="You did it! The first slice is yours. Happy Birthday! 💛";
 complete("cake");confetti(50,48,55);
 message("Happy Birthday, sunshine!","You cut your golden birthday cake! May every little wish you make find its way to you.","🎂");
}
$("#cake-cut-button").addEventListener("click",cutCake);
$("#cake-reset").addEventListener("click",()=>{cakeArea.classList.remove("is-cut");cakeStatus.textContent="One more birthday slice? ♡"});
let startCutX=null,startCutY=null;
cakeArea.addEventListener("pointerdown",e=>{startCutX=e.clientX;startCutY=e.clientY});
cakeArea.addEventListener("pointerup",e=>{
 if(startCutX===null)return;
 const dx=e.clientX-startCutX,dy=e.clientY-startCutY;
 if(Math.abs(dx)>63&&Math.abs(dx)>Math.abs(dy)*1.2)cutCake();
 startCutX=null;startCutY=null;
});
cakeArea.addEventListener("pointercancel",()=>{startCutX=null});
cakeArea.addEventListener("keydown",e=>{if(e.code==="Enter"||e.code==="Space"){e.preventDefault();cutCake()}});
const chosenFlowers=new Set(),flowerIcons=["🌻","🌼","🌻","🌼","🌻","🌼","🌻","🌼"];
$$(".pick-flower").forEach(button=>button.addEventListener("click",()=>{
 const id=Number(button.dataset.flower);
 if(chosenFlowers.has(id)||chosenFlowers.size>=5)return;
 chosenFlowers.add(id);button.classList.add("is-picked");button.disabled=true;
 const idx=chosenFlowers.size,stem=document.createElement("span");
 stem.className="bouquet-stem";stem.style.setProperty("--stem-turn",(-25+idx*10)+"deg");
 stem.innerHTML='<span class="bouquet-head">'+flowerIcons[id]+'</span>';
 bouquet.append(stem);
 flowerCount.textContent=idx+" / 5 flowers";
 const phrases=["One little sunshine wish. ☀","A second flower, for brighter days. ♡","A third, for all the laughter.","One more, for every good memory.","Your yellow bouquet is ready! 💐"];
 flowerMessage.textContent=phrases[idx-1];
 if(idx===5){present.disabled=false;confetti(48,60,23)}
}));
present.addEventListener("click",()=>{
 if(chosenFlowers.size<5)return;complete("flowers");confetti(50,49,46);
 message("For the girl who loves yellow 💛","Five little flowers, picked just for you. May your year be full of the kind of happiness that blooms in its own time.","💐");
});
$("#bouquet-reset").addEventListener("click",()=>{
 chosenFlowers.clear();$$(".pick-flower").forEach(button=>{button.disabled=false;button.classList.remove("is-picked")});
 $$(".bouquet-stem",bouquet).forEach(el=>el.remove());
 flowerCount.textContent="0 / 5 flowers";flowerMessage.textContent="The garden is waiting for you. ♡";present.disabled=true;
});
const titles=["The first hello","A random Tuesday","That laugh","A little adventure","Earlier days","Silly moments","Somewhere new","The unexpected","The little things","Another sunset","Good days","What's next"];
const symbols=["♡","☀","☺","✿","❀","♡","☀","✿","♥","☼","♡","∞"];
let memoriesLoaded=false,privateMemories=null;
function renderMemories(data){
 const board=$("#memory-board");board.replaceChildren();
 titles.forEach((title,i)=>{
  const item=document.createElement("article");item.className="memory-polaroid";
  item.style.setProperty("--tilt",(-2+(i%5))+"deg");
  const visual=document.createElement("div");visual.className="memory-image";
  const entry=data?.timeline?.[i];
  if(entry?.url&&entry.url.startsWith("/api/private/media/")){
   const img=document.createElement("img");img.src=entry.url;img.loading="lazy";img.alt=entry.alt||title;
   img.addEventListener("error",()=>{visual.replaceChildren(document.createTextNode(symbols[i]))},{once:true});
   visual.append(img);
  }else visual.textContent=symbols[i];
  const name=document.createElement("strong");name.textContent=title;
  const sub=document.createElement("small");sub.textContent="MEMORY "+String(i+1).padStart(2,"0");
  item.append(visual,name,sub);board.append(item);
 });
 const videoBlock=$("#world-videos"),list=$("#world-video-list");
 list.replaceChildren();
 if(data?.videos?.length){
  const labels=["Little Adventures","Funny Moments","Days to Remember"];
  data.videos.slice(0,3).forEach((v,i)=>{
   if(!v?.url||!v.url.startsWith("/api/private/media/"))return;
   const b=document.createElement("button");b.textContent="▶ "+labels[i];b.type="button";
   b.addEventListener("click",()=>{
    const player=$("#world-video");player.pause();player.src=v.url;player.hidden=false;
    if(playerMusic&&musicPlaying)playerMusic.pause();
    player.play().catch(()=>toast("Tap play on the video to start it."));
    player.scrollIntoView({block:"nearest",behavior:reduce?"auto":"smooth"});
   });list.append(b);
  });
  videoBlock.hidden=!list.children.length;
 }else{videoBlock.hidden=true;$("#world-video").hidden=true}
}
async function loadMemories(){
 if(memoriesLoaded){renderMemories(privateMemories);return}
 renderMemories(null);
 if(!privateAPI)return;
 try{
  const response=await fetch("/api/private/memories",{credentials:"same-origin",cache:"no-store"});
  if(!response.ok)return;
  const data=await response.json();
  privateMemories=data;memoriesLoaded=true;renderMemories(data);
 }catch{toast("The private memories aren't connected yet. ♡")}
}
async function loadGift(){
 const container=$("#world-gift-claim");container.hidden=true;container.replaceChildren();
 $("#gift-soon").hidden=false;
 if(!privateAPI)return;
 try{
  const response=await fetch("/api/private/gift",{credentials:"same-origin",cache:"no-store"});
  if(!response.ok)return;
  const gift=await response.json();
  if(!gift?.ready||typeof gift.code!=="string"||!/^[A-Za-z0-9-]{6,100}$/.test(gift.code))return;
  const label=document.createElement("span");label.textContent="YOUR AMAZON.IN BIRTHDAY GIFT";
  const code=document.createElement("code");code.textContent=gift.code;
  const copy=document.createElement("button");copy.type="button";copy.textContent="Copy gift code";
  copy.addEventListener("click",async()=>{
   try{await navigator.clipboard.writeText(gift.code);copy.textContent="Copied ✓"}catch{copy.textContent="Select the code above to copy"}
  });
  const link=document.createElement("a");link.href="https://www.amazon.in/addgiftcard";link.target="_blank";link.rel="noopener noreferrer";link.textContent="Redeem on Amazon.in ↗";
  container.append(label,code,copy,link);container.hidden=false;$("#gift-soon").hidden=true;
 }catch{}
}
const quiz=[
 {title:"When did we first meet?",sub:"The very beginning of this little story.",answers:["In 2019, at college","At a college fest a year later","During an online class","When we needed class notes"],correct:0,good:"Yes! It all began in 2019, at college. Some memories really do stay golden. ♡"},
 {title:"What was our first message?",sub:"Just two simple words to start.",answers:["Happy Birthday — Thank You","Hey, have you done the assignment?","Are you coming tomorrow?","I think we've met before"],correct:0,good:"Happy Birthday and Thank You! Two tiny messages that became quite a story. ♡"},
 {title:"Why did we break up?",sub:"Write your thoughts here if you'd like. This stays on your screen and is not sent or saved.",type:"reflection",good:"I believe you may have written that it was because of me. I know I hurt you, and you're right to feel that way. I'm sorry for that, sincerely."},
 {title:"Do you love me?",sub:"A little cheeky one. No answer is required.",answers:["A — Yes ♡","B — Option A 😄"],correct:"any",good:"Haha, both answers count! This is your birthday — no promises or explanations needed. ♡"}
];
let quizIndex=0,quizLocked=false;
function renderQuiz(){
 quizLocked=false;const q=quiz[quizIndex];
 $("#world-quiz-num").textContent=(quizIndex+1)+" / 4";
 $("#world-quiz-bar").style.width=((quizIndex+1)/4*100)+"%";
 $("#world-quiz-step").hidden=false;$("#world-quiz-done").hidden=true;
 $("#world-quiz-question").textContent=q.title;$("#world-quiz-subtitle").textContent=q.sub;
 const opts=$("#world-quiz-options");opts.replaceChildren();
 if(q.type==="reflection"){
  const area=document.createElement("textarea");area.className="world-quiz-textarea";area.maxLength=500;area.placeholder="Write whatever feels true to you…";area.setAttribute("aria-label","Private reflection");
  const note=document.createElement("p");note.className="world-quiz-small";note.textContent="Only for this moment. Nothing is collected, saved, or sent.";
  const next=document.createElement("button");next.type="button";next.className="gold-button";next.textContent="Continue ♡";
  next.addEventListener("click",()=>{if(quizLocked)return;quizLocked=true;message("Something I want to acknowledge",q.good,"♥");messageDialog.addEventListener("close",nextQuiz,{once:true})});
  opts.append(area,note,next);
 }else{
  q.answers.forEach((answer,i)=>{
   const b=document.createElement("button");b.className="world-answer";b.type="button";b.textContent=answer;
   b.addEventListener("click",()=>{
    if(quizLocked)return;
    if(q.correct!=="any"&&i!==q.correct){
     const hint=$("#world-quiz-hint");
     if(hint)hint.textContent="Not quite 😄 Try another answer.";
     b.classList.remove("quiz-wrong");void b.offsetWidth;b.classList.add("quiz-wrong");
     return;
    }
    quizLocked=true;b.classList.add("is-correct");
    message(quizIndex===3?"A little birthday smile!":"You remembered! 💛",q.good,"🌼");
    messageDialog.addEventListener("close",nextQuiz,{once:true});
   });opts.append(b);
  });
  if(q.correct!=="any"){const hint=document.createElement("p");hint.id="world-quiz-hint";hint.className="world-quiz-hint";hint.setAttribute("role","status");opts.append(hint)}
  else{const skip=document.createElement("button");skip.className="subtle-button";skip.type="button";skip.textContent="I'd rather keep this answer to myself ♡";skip.addEventListener("click",nextQuiz);opts.append(skip)}
 }
}
function nextQuiz(){
 if(quizIndex<3){quizIndex++;renderQuiz()}
 else{$("#world-quiz-step").hidden=true;$("#world-quiz-done").hidden=false;complete("quiz");confetti(50,45,46)}
}
$("#world-quiz-replay").addEventListener("click",()=>{quizIndex=0;renderQuiz()});
renderQuiz();
})();
