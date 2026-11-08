/* A warm gift reveal. A real gift-card code is NEVER bundled into static files. */
(()=>{
"use strict";
const button=document.getElementById("celebrate"),panel=document.getElementById("gift-reveal");
const claim=document.getElementById("gift-claim"),message=document.getElementById("gift-copy");
if(!button||!panel||!claim)return;
let loaded=false;
async function showPrivateGift(){
 if(loaded)return;loaded=true;
 // The public demo stays photo-free and code-free. Only the authenticated
 // Cloudflare Worker is permitted to return a redemption code.
 if(document.body.dataset.mediaApi!=="/api/private/memories")return;
 try{
  const response=await fetch("/api/private/gift",{
   credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}
  });
  if(!response.ok)return;
  const gift=await response.json();
  if(!gift?.ready||typeof gift.code!=="string"||!gift.code.trim())return;
  const code=gift.code.trim();
  if(!/^[A-Za-z0-9-]{6,100}$/.test(code))return;
  message.textContent="A little Amazon.in gift card for you. Pick something you love, just because it's your day.";
  const label=document.createElement("label");label.textContent="YOUR AMAZON.IN GIFT CARD CODE";
  const codeEl=document.createElement("code");codeEl.className="gift-code";codeEl.textContent=code;
  const copy=document.createElement("button");copy.type="button";copy.className="gift-action";copy.textContent="Copy gift code";
  copy.addEventListener("click",async()=>{
   try{await navigator.clipboard.writeText(code);copy.textContent="Copied ✓"}catch{copy.textContent="Select and copy the code above"}
  });
  const link=document.createElement("a");
  link.href="https://www.amazon.in/addgiftcard";link.target="_blank";link.rel="noopener noreferrer";link.textContent="Redeem on Amazon.in ↗";
  claim.replaceChildren(label,codeEl,copy,link);claim.hidden=false;
 }catch{/* Don't display access errors or disclose any secure values. */}
}
button.addEventListener("click",()=>{
 panel.hidden=false;button.setAttribute("aria-expanded","true");
 showPrivateGift();
 setTimeout(()=>panel.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"}),100);
});
})();