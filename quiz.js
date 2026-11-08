/* Our Little Story — 4-question birthday quiz with accessible feedback dialog.
 * No answers are uploaded, saved, logged, scored, or shared.
 */
(()=>{
 "use strict";
 const root=document.getElementById("birthday-quiz-card");
 const dialog=document.getElementById("quiz-feedback");
 if(!root||!dialog)return;
 const $=(s,within=root)=>within.querySelector(s);
 const step=$("#quiz-step"),bar=$("#quiz-progress"),stage=$("#quiz-stage"),question=$("#quiz-question"),description=$("#quiz-description"),icon=$(".quiz-icon",stage),options=$("#quiz-options"),result=$("#quiz-result"),resultHeading=$("#quiz-result-heading"),resultMessage=$("#quiz-result-message"),restart=$("#quiz-restart");
 const heading=document.getElementById("feedback-heading"),msg=document.getElementById("feedback-message"),deco=document.getElementById("feedback-decoration"),continueButton=document.getElementById("feedback-continue");
 const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const questions=[
  {title:"When did we first meet?",description:"A little trip back to the beginning…",icon:"♡",
   answers:["In 2019, at college","At a college fest, a year later","During an online class","When someone needed the class notes"],
   correct:0,
   success:"Yes! Back in 2019, at college. Some beginnings become memories that stay with us. ♡",
   hint:"Not quite 😄 Think of the college days in 2019. Try another one!"
  },
  {title:"What was our very first message?",description:"It all started with a few simple words.",icon:"☺",
   answers:["“Happy birthday!” — “Thank you!”","“Hey, do you have the notes?”","“Are you coming to college tomorrow?”","“Have we met before?”"],
   correct:0,
   success:"Yesss! ‘Happy Birthday’ and ‘Thank You.’ Funny how a few simple words can become a whole story. ♡",
   hint:"Almost! 🎈 It started with two tiny birthday messages. Try again!"
  },
  {title:"Why did we break up?",description:"You can write what you felt here. Your words stay on this page and are never sent or saved.",icon:"♥",type:"reflection",
   success:"Yes, I believe you wrote that it was because of me. You're right that I hurt you, and I'm sorry for that. I know an apology can't undo what happened, but I mean it."
  },
  {title:"Do you love me?",description:"Okay, a tiny cheeky question 😅 No pressure — you can keep this one to yourself.",icon:"♡",
   answers:["A — Yes ♡","B — Option A 😄"],correct:"any",allowSkip:true,
   success:"Correct! 😄 Both answers get a little smile. No promises required — it's your birthday, after all. ♡"
  }
 ];
 let index=0,locked=false,advanceOnClose=null,popupOpen=false;
 function el(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
 }
 function celebratePopup(){
  if(reduced)return;
  const wrap=el("div","quiz-confetti-hearts");
  wrap.setAttribute("aria-hidden","true");
  for(let i=0;i<17;i++){
   const heart=el("span","quiz-heart-pop",i%3===0?"✿":i%3===1?"♡":"●");
   heart.style.setProperty("--angle",String(20+i*19)+"deg");
   heart.style.setProperty("--distance",String(78+(i%5)*16)+"px");
   heart.style.setProperty("--delay",String((i%4)*38)+"ms");
   wrap.append(heart);
  }
  $(".quiz-pop-body",dialog)?.append(wrap);
  setTimeout(()=>wrap.remove(),1350);
 }
 function feedback(title,text,type="success",after=null){
  heading.textContent=title;msg.textContent=text;
  deco.textContent=type==="reflection"?"♥":"♡";
  dialog.dataset.kind=type;
  advanceOnClose=after;
  popupOpen=true;
  if(typeof dialog.showModal==="function")dialog.showModal();
  else dialog.setAttribute("open","");
  continueButton.focus({preventScroll:true});
  if(type==="success")celebratePopup();
 }
 function endFeedback(){
  if(!popupOpen)return;
  if(typeof dialog.close==="function"&&dialog.open)dialog.close();
  else {dialog.removeAttribute("open");onClose()}
 }
 function onClose(){
  if(!popupOpen)return;
  popupOpen=false;
  const next=advanceOnClose;advanceOnClose=null;
  if(next)next();
 }
 dialog.addEventListener("close",onClose);
 continueButton.addEventListener("click",endFeedback);
 function advance(){
  if(index===questions.length-1){showResult();return}
  index++;render();
 }
 function select(btn,choice){
  if(locked)return;
  const current=questions[index];
  if(current.correct!=="any"&&choice!==current.correct){
   const hint=options.querySelector(".quiz-live-hint");
   if(hint)hint.textContent=current.hint;
   btn.classList.remove("quiz-wrong");void btn.offsetWidth;btn.classList.add("quiz-wrong");
   return;
  }
  locked=true;btn.classList.add("is-chosen");
  options.querySelectorAll("button").forEach(b=>b.disabled=true);
  feedback(index===3?"A little smile for you!":"You remembered! ♡",current.success,"success",advance);
 }
 function render(){
  locked=false;result.hidden=true;stage.hidden=false;
  stage.classList.remove("is-switching");
  const current=questions[index];
  step.textContent=String(index+1).padStart(2,"0")+" / 04";
  bar.style.width=String((index+1)/questions.length*100)+"%";
  icon.textContent=current.icon;question.textContent=current.title;description.textContent=current.description;
  options.replaceChildren();
  if(current.type==="reflection"){
   const label=el("label","quiz-reflection-label","Your thoughts (just for this moment)");
   label.htmlFor="quiz-reflection";
   const textarea=el("textarea","quiz-reflection-input");
   textarea.id="quiz-reflection";textarea.rows=4;textarea.maxLength=550;
   textarea.placeholder="Write whatever feels true to you…";
   textarea.setAttribute("aria-label","Your private thoughts about the breakup");
   textarea.autocomplete="off";textarea.spellcheck=true;
   const notice=el("p","quiz-privacy-note","Nothing you write here is collected, saved, or sent. You can continue without writing anything.");
   const button=el("button","quiz-continue","Continue ♡");button.type="button";
   button.addEventListener("click",()=>{
    if(locked)return;locked=true;
    // Intentionally don't read, save or transmit her response.
    feedback("Something I need to acknowledge",current.success,"reflection",advance);
   });
   options.append(label,textarea,notice,button);
  }else{
   current.answers.forEach((answer,i)=>{
    const button=el("button","quiz-choice",answer);
    button.type="button";button.addEventListener("click",()=>select(button,i));
    options.append(button);
   });
   if(current.allowSkip){
    const skip=el("button","quiz-skip","I'd rather keep that answer to myself ♡");
    skip.type="button";skip.addEventListener("click",()=>{if(locked)return;locked=true;advance()});
    options.append(skip);
   }else{
    const hint=el("p","quiz-live-hint","");hint.setAttribute("role","status");hint.setAttribute("aria-live","polite");
    options.append(hint);
   }
  }
 }
 function showResult(){
  stage.hidden=true;result.hidden=false;
  step.textContent="DONE ♡";bar.style.width="100%";
  resultHeading.textContent="Thank you for remembering with me.";
  resultMessage.textContent="From our first hello to all those little days in between — I'm grateful for the memories. May this birthday bring you exactly the happiness and peace you deserve. ♡";
  restart.focus({preventScroll:true});
 }
 restart.addEventListener("click",()=>{index=0;locked=false;render();options.querySelector("button")?.focus({preventScroll:true})});
 render();
})();