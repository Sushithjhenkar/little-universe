/* A personal birthday quiz. No tracking, scoring, or response collection. */
(() => {
  "use strict";
  const root=document.getElementById("birthday-quiz-card");
  if(!root)return;
  const $=selector=>root.querySelector(selector);
  const stage=$("#quiz-stage"),options=$("#quiz-options"),step=$("#quiz-step");
  const progress=$("#quiz-progress"),question=$("#quiz-question");
  const description=$("#quiz-description"),icon=$("#quiz-stage .quiz-icon");
  const result=$("#quiz-result"),resultHeading=$("#quiz-result-heading");
  const resultMessage=$("#quiz-result-message"),restart=$("#quiz-restart");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items=[
    {
      title:"When did we first meet?",icon:"♡",
      description:"A little trip back to the beginning…",
      answers:[
        "In 2019, at college",
        "At a college fest, a year later",
        "During an online class",
        "When someone needed the class notes"
      ]
    },
    {
      title:"What was our very first message?",icon:"☺",
      description:"It all started with a few simple words.",
      answers:[
        "“Happy birthday!” — “Thank you!”",
        "“Hey, do you have the notes?”",
        "“Are you coming to college tomorrow?”",
        "“Have we met before?”"
      ]
    },
    {
      title:"Why did we break up?",icon:"♥",type:"reflection",
      description:"I know I hurt you, and I take responsibility for that. If you want, share your thoughts here — or skip. Your answer stays on this device and isn't sent to me."
    },
    {
      title:"Do you love me?",icon:"♡",
      description:"Okay, this one's a cheeky question 😅 You don't have to answer it.",
      answers:["A — Yes ♡","B — Option A 😄"],skip:true
    }
  ];
  let current=0,locked=false,timer=0;
  const make=(tag,className,text)=>{
    const el=document.createElement(tag);el.className=className;el.textContent=text;return el;
  };
  function animateNext(fn){
    if(reduced){fn();return}
    stage.classList.add("is-switching");
    timer=setTimeout(fn,220);
  }
  function advance(){
    if(current<items.length-1){current++;render()}
    else showResult();
  }
  function choose(button){
    if(locked)return;locked=true;button.classList.add("is-chosen");
    options.querySelectorAll("button").forEach(btn=>btn.disabled=true);
    timer=setTimeout(()=>animateNext(advance),reduced?0:350);
  }
  function skip(){
    if(locked)return;locked=true;animateNext(advance);
  }
  function addSkip(label="I'd rather skip this one ↗"){
    const b=make("button","quiz-skip",label);b.type="button";
    b.addEventListener("click",skip);options.append(b);
  }
  function render(){
    locked=false;
    const item=items[current];
    stage.hidden=false;stage.classList.remove("is-switching");
    step.textContent=String(current+1).padStart(2,"0")+" / 04";
    progress.style.width=String((current+1)/items.length*100)+"%";
    icon.textContent=item.icon;question.textContent=item.title;description.textContent=item.description;
    options.replaceChildren();
    if(item.type==="reflection"){
      const label=make("label","quiz-reflection-label","Only if you'd like to share");label.htmlFor="quiz-reflection";
      const area=document.createElement("textarea");
      area.id="quiz-reflection";area.className="quiz-reflection-input";
      area.rows=4;area.maxLength=500;area.placeholder="You can write what's on your mind…";
      area.setAttribute("aria-label","Optional reflection — not sent or saved");
      area.autocomplete="off";area.spellcheck=true;
      const note=make("p","quiz-privacy-note","Private to this moment. Nothing is collected, saved, or sent.");
      const button=make("button","quiz-continue","Continue gently →");button.type="button";
      button.addEventListener("click",()=>{if(locked)return;locked=true;animateNext(advance)});
      options.append(label,area,note,button);
      addSkip("Skip this question");
    }else{
      item.answers.forEach(answer=>{
        const b=make("button","quiz-choice",answer);b.type="button";
        b.addEventListener("click",()=>choose(b));
        options.append(b);
      });
      if(item.skip)addSkip("I'd rather keep that to myself ♡");
    }
  }
  function showResult(){
    stage.hidden=true;result.hidden=false;
    step.textContent="DONE ♡";progress.style.width="100%";
    resultHeading.textContent="Thank you for remembering with me.";
    resultMessage.textContent="Some beginnings are funny, some memories are precious, and some chapters are complicated. I'm grateful for the moments we shared. Happy birthday — may this year be kind to you. ♡";
    restart.focus({preventScroll:true});
  }
  function start(){
    clearTimeout(timer);current=0;locked=false;
    result.hidden=true;render();
    options.querySelector("button")?.focus({preventScroll:true});
  }
  restart.addEventListener("click",start);
  render();
})();