/* A tiny just-for-fun birthday quiz. No tracking, scores, or relationship pressure. */
(()=>{
"use strict";
const root=document.getElementById("birthday-quiz-card");
if(!root)return;
const $=sel=>root.querySelector(sel);
const stage=$("#quiz-stage"),options=$("#quiz-options"),step=$("#quiz-step"),progress=$("#quiz-progress"),question=$("#quiz-question"),description=$("#quiz-description"),icon=$("#quiz-stage .quiz-icon"),result=$("#quiz-result"),resultHeading=$("#quiz-result-heading"),resultMessage=$("#quiz-result-message"),restart=$("#quiz-restart");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const questions=[
 {icon:"☀",title:"Choose your perfect little escape.",sub:"No big plans needed. Just pick the vibe.",answers:[
 {text:"A peaceful sunset somewhere beautiful",tag:"peace"},
 {text:"A spontaneous little adventure",tag:"adventure"},
 {text:"A cozy day with favorite people",tag:"warmth"}
 ]},
 {icon:"✧",title:"What makes a normal day special?",sub:"Sometimes the smallest things stay with us.",answers:[
 {text:"Laughing at something completely silly",tag:"laughter"},
 {text:"An unexpected thoughtful surprise",tag:"surprise"},
 {text:"A long, comfortable conversation",tag:"connection"}
 ]},
 {icon:"♡",title:"Pick the kind of birthday magic you love.",sub:"There are no wrong answers, promise.",answers:[
 {text:"A heartfelt letter I can keep",tag:"words"},
 {text:"A beautiful new memory to make",tag:"memories"},
 {text:"A simple day that feels like mine",tag:"comfort"}
 ]},
 {icon:"✦",title:"Choose a wish for your next chapter.",sub:"This one's just for you.",answers:[
 {text:"More peace and little everyday joys",tag:"peaceful-year"},
 {text:"More courage and new adventures",tag:"brave-year"},
 {text:"More laughter and lovely surprises",tag:"happy-year"}
 ]}
];
const wishes={
 "peaceful-year":"May the coming year feel gentle, calm, and full of little reasons to smile.",
 "brave-year":"May this year give you the courage to try new things and the joy of discovering what you love.",
 "happy-year":"May life surprise you with beautiful days, unexpected laughter, and memories you will want to keep."
};
let index=0,chosen=[],locked=false,changeTimer=null;
function render(){
 locked=false;
 const current=questions[index];
 step.innerHTML=String(index+1).padStart(2,"0")+' <small>/ '+String(questions.length).padStart(2,"0")+"</small>";
 progress.style.width=((index+1)/questions.length*100)+"%";
 icon.textContent=current.icon;question.textContent=current.title;description.textContent=current.sub;
 options.replaceChildren();
 current.answers.forEach((answer,i)=>{
  const button=document.createElement("button");button.type="button";button.className="quiz-choice";
  button.textContent=answer.text;button.dataset.index=String(i);
  button.addEventListener("click",()=>select(button,i));
  options.append(button);
 });
 stage.classList.remove("is-switching");
}
function select(button,answerIndex){
 if(locked)return;locked=true;
 chosen[index]=questions[index].answers[answerIndex].tag;
 for(const item of options.children)item.disabled=true;
 button.classList.add("is-chosen");
 const advance=()=>{
  if(index===questions.length-1){showResult();return}
  index++;render();
 };
 if(reduce){advance();return}
 changeTimer=setTimeout(()=>{stage.classList.add("is-switching");changeTimer=setTimeout(advance,230)},370);
}
function showResult(){
 stage.hidden=true;result.hidden=false;
 step.innerHTML="✦ <small>/ COMPLETE</small>";progress.style.width="100%";
 const last=chosen[chosen.length-1]||"peaceful-year";
 resultHeading.textContent="May your next chapter sparkle.";
 resultMessage.textContent=(wishes[last]||wishes["peaceful-year"])+" Happy birthday. Here's to every little moment that makes you, you. ✨";
 restart.focus({preventScroll:true});
}
function start(){
 clearTimeout(changeTimer);index=0;chosen=[];locked=false;
 result.hidden=true;stage.hidden=false;render();
 const first=options.querySelector("button");first?.focus({preventScroll:true});
}
restart.addEventListener("click",start);
render();
})();
