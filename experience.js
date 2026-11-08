/* Birthday experience: legal music embed, private-media-ready slots, video playback,
   opt-in motion. No credentials, photos or private URLs belong in this public repo. */
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const dataSaver=!!navigator.connection?.saveData;
const musicButton=$("#music"),sheet=$("#music-sheet"),closeMusic=$("#music-close"),musicPause=$("#music-pause"),musicState=$("#music-state"),scFrame=$("#soundcloud-frame");
let widget=null,ready=false,playing=false,userPaused=false,musicOpen=false,autoRetryTimer=0;
const updateMusicUi=()=>{
 musicPause.textContent=userPaused?"♫ Resume song":"♫ Pause song";
 musicPause.setAttribute("aria-pressed",String(userPaused));
 musicButton.innerHTML="♫ Neene Yendigu <span class=\"sound-dot\" aria-hidden=\"true\"></span>";
 musicButton.classList.toggle("music-active",playing);
 musicButton.classList.toggle("music-paused",userPaused);
 musicState.textContent=userPaused?"Paused":playing?"Playing on repeat ♫":ready?"Waiting for browser audio permission…":"Loading SoundCloud…";
};
function toggleMusicPanel(open){
 musicOpen=open;sheet.classList.toggle("open",open);sheet.setAttribute("aria-hidden",String(!open));sheet.inert=!open;
 musicButton.setAttribute("aria-expanded",String(open));
}
function startSoundtrack(){
 if(!ready||userPaused||playing||!widget)return;
 widget.play(); // Browser may block this until a user gesture, especially on phones.
}
function initializeSoundCloud(){
 if(!window.SC?.Widget||!scFrame){musicState.textContent="SoundCloud unavailable — open the song link";return}
 widget=window.SC.Widget(scFrame);
 widget.bind(window.SC.Widget.Events.READY,()=>{
  ready=true;widget.setVolume(68);updateMusicUi();startSoundtrack();
  clearTimeout(autoRetryTimer);
  autoRetryTimer=setTimeout(()=>{if(!playing&&!userPaused){musicState.textContent="Tap anywhere on the page to start audio";}},2600);
 });
 widget.bind(window.SC.Widget.Events.PLAY,()=>{playing=true;updateMusicUi()});
 widget.bind(window.SC.Widget.Events.PAUSE,()=>{playing=false;updateMusicUi()});
 widget.bind(window.SC.Widget.Events.FINISH,()=>{
  playing=false; // Rewind and replay the original SoundCloud stream, no audio file hosted here.
  if(!userPaused){widget.seekTo(0);widget.play()}
  else updateMusicUi();
 });
 widget.bind(window.SC.Widget.Events.ERROR,()=>{playing=false;musicState.textContent="This SoundCloud track couldn't load. Try its original link."});
}
sheet.inert=true;updateMusicUi();
musicButton.addEventListener("click",()=>toggleMusicPanel(!musicOpen));
closeMusic.addEventListener("click",()=>{toggleMusicPanel(false);musicButton.focus()});
musicPause.addEventListener("click",()=>{
 if(userPaused){userPaused=false;playing=false;updateMusicUi();startSoundtrack()}
 else{userPaused=true;widget?.pause();playing=false;updateMusicUi()}
});
addEventListener("keydown",e=>{
 if(e.key==="Escape"&&musicOpen){toggleMusicPanel(false);musicButton.focus()}
 if((e.key==="Enter"||e.key===" ")&&!userPaused)startSoundtrack();
});
document.addEventListener("pointerdown",()=>{
 if(!userPaused&&!playing)startSoundtrack();
},{capture:true,passive:true});
document.addEventListener("touchstart",()=>{
 if(!userPaused&&!playing)startSoundtrack();
},{capture:true,passive:true});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!userPaused)startSoundtrack()});
addEventListener("pointerdown",e=>{if(musicOpen&&!sheet.contains(e.target)&&!musicButton.contains(e.target))toggleMusicPanel(false)});
initializeSoundCloud();
const toast=$("#site-toast");let toastTimer;
function notify(message){if(!toast)return;toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),3400)}
const dialog=$("#film-dialog"),player=$("#memory-video"),filmClose=$("#film-close");
const media={hero:null,photos:[],timeline:[],videos:[]};
function cleanUrl(url){
 if(typeof url!=="string"||!url.trim())return null;
 try{const u=new URL(url,location.origin);if(u.protocol!=="https:"&&u.protocol!=="http:")return null;return u.href}catch{return null}
}
function addImage(container,url,cssClass,alt=""){
 const src=cleanUrl(url);if(!src)return;
 const img=document.createElement("img");img.src=src;img.alt=alt;img.className=cssClass;
 img.decoding="async";img.loading="lazy";container.append(img);
}
function applyPrivateMedia(data){
 if(!data||typeof data!=="object")return;
 const heroUrl=cleanUrl(data.hero?.url??data.hero);
 const hero=$("#hero-portrait");
 if(heroUrl&&hero){hero.onload=()=>{document.querySelector(".portrait-backdrop")?.classList.add("is-ready");document.body.classList.add("has-portrait")};hero.onerror=()=>{document.querySelector(".portrait-backdrop")?.classList.remove("is-ready");document.body.classList.remove("has-portrait")};hero.src=heroUrl}
 if(Array.isArray(data.photos))data.photos.slice(0,4).forEach((entry,index)=>{
  const card=$('[data-photo-slot="'+index+'"]');if(!card)return;const url=typeof entry==="string"?entry:entry?.url;
  const src=cleanUrl(url);if(!src)return;const inner=$(".photo-inner",card);
  addImage(inner,src,"memory-thumb",entry.alt??"Shared memory");card.classList.add("has-image");
  card.dataset.caption=entry.caption??"A little moment";
 });
 if(Array.isArray(data.timeline))data.timeline.slice(0,12).forEach((entry,index)=>{
  const card=$$(".cosmos-card")[index];if(!card)return;const url=typeof entry==="string"?entry:entry?.url;
  if(cleanUrl(url))addImage($(".cosmos-art",card),url,"timeline-thumb",entry.alt??"Memory "+(index+1));
  if(entry&&typeof entry==="object"){
   if(entry.title){card.dataset.title=String(entry.title);$(".cosmos-label",card).textContent=String(entry.title)}
   if(entry.caption)card.dataset.caption=String(entry.caption);
  }
 });
 if(Array.isArray(data.videos))data.videos.slice(0,3).forEach((entry,index)=>{
  const card=$('[data-video-slot="'+index+'"]');if(!card||!entry)return;
  const url=cleanUrl(entry.url);if(!url)return;card.dataset.src=url;
  const poster=cleanUrl(entry.poster);if(poster)addImage($(".film-visual",card),poster,"film-poster","");
  if(entry.title){$(".film-meta strong",card).textContent=String(entry.title);card.setAttribute("aria-label","Play video: "+String(entry.title))}
 });
 const n=Array.isArray(data.videos)?data.videos.length:0;
 if(n&&$("#film-hint"))$("#film-hint").textContent="Pick a frame to replay a moment.";
}
window.LittleUniverse={applyPrivateMedia};
const api=document.body.dataset.mediaApi;
if(api&&api.startsWith("/")){
 fetch(api,{credentials:"same-origin",headers:{Accept:"application/json"}}).then(r=>{if(!r.ok)throw new Error("Media unavailable");return r.json()}).then(applyPrivateMedia).catch(()=>{/* No personal media on public preview. */});
}
$$(".film-card").forEach(card=>card.addEventListener("click",()=>{
 const src=cleanUrl(card.dataset.src);
 if(!src){notify("This memory is waiting for its video ✨");return}
 const title=$(".film-meta strong",card)?.textContent??"A memory in motion";
 $("#film-dialog-title").textContent=title;player.src=src;
 const poster=$(".film-visual img",card);if(poster)player.poster=poster.src;else player.removeAttribute("poster");
 dialog.showModal();player.play().catch(()=>{/* user can press play using video controls */});
}));
function stopFilm(){player.pause();player.removeAttribute("src");player.load();if(dialog.open)dialog.close()}
filmClose.addEventListener("click",stopFilm);
dialog.addEventListener("close",()=>{player.pause();player.removeAttribute("src");player.load()});
dialog.addEventListener("click",e=>{if(e.target===dialog)stopFilm()});
const hero=$(".hero-inner"),portrait=$(".portrait-backdrop img");
if(!reduced&&!dataSaver&&matchMedia("(hover:hover) and (pointer:fine)").matches&&hero){
 let x=0,y=0,tx=0,ty=0,frame=0;
 const animate=()=>{frame=0;x+=(tx-x)*.11;y+=(ty-y)*.11;hero.style.transform="translate3d("+x.toFixed(2)+"px,"+y.toFixed(2)+"px,0)";if(Math.abs(x-tx)>.15||Math.abs(y-ty)>.15)frame=requestAnimationFrame(animate)};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(animate)};
 $(".hero").addEventListener("pointermove",e=>{const box=e.currentTarget.getBoundingClientRect();tx=((e.clientX-box.left)/box.width-.5)*15;ty=((e.clientY-box.top)/box.height-.5)*12;schedule()},{passive:true});
 $(".hero").addEventListener("pointerleave",()=>{tx=ty=0;schedule()});
}
if(!reduced&&!dataSaver&&portrait){
 let pending=false;const onScroll=()=>{if(pending||!document.body.classList.contains("has-portrait"))return;pending=true;requestAnimationFrame(()=>{pending=false;const dy=Math.max(-50,Math.min(50,-scrollY*.055));portrait.style.setProperty("--portrait-y",dy.toFixed(1)+"px")})};addEventListener("scroll",onScroll,{passive:true});
}
})();