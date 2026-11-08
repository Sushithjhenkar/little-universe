/* Little Universe — private Cloudflare Worker.
   ALL assets go through the Worker before being delivered.
   No personal media, Drive IDs, passphrases or tokens are stored in GitHub.
*/
const COOKIE="lu_session", SESSION_SECONDS=60*60*8;
const encoder=new TextEncoder();
const utf8=s=>encoder.encode(String(s));
const hex=buf=>Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,"0")).join("");
const base64url=bytes=>btoa(Array.from(bytes,b=>String.fromCharCode(b)).join("")).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const safeEqual=(a,b)=>{if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a[i]^b[i];return n===0};
const hash=async s=>new Uint8Array(await crypto.subtle.digest("SHA-256",utf8(s)));
async function hmac(value,key){
 const cryptoKey=await crypto.subtle.importKey("raw",utf8(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return base64url(new Uint8Array(await crypto.subtle.sign("HMAC",cryptoKey,utf8(value))));
}
function secureHeaders(response,extra={}){
 const headers=new Headers(response.headers);
 headers.set("Cache-Control","private, no-store, max-age=0");
 headers.set("X-Content-Type-Options","nosniff");
 headers.set("Referrer-Policy","no-referrer");
 headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
 headers.set("Content-Security-Policy",[
  "default-src 'self'",
  "script-src 'self' https://w.soundcloud.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://i1.sndcdn.com https://i2.sndcdn.com",
  "connect-src 'self' https://w.soundcloud.com https://api.soundcloud.com",
  "frame-src https://w.soundcloud.com",
  "media-src 'self' blob: https://*.sndcdn.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
 ].join("; "));
 for(const [key,value] of Object.entries(extra))headers.set(key,value);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function gatePage(failed=false){
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>A Little Universe · Secret Entrance</title>
 <style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:radial-gradient(ellipse at 70% 25%,#3a174b,#090711 65%);color:#faf0f8;font:16px system-ui,sans-serif;padding:22px}main{width:min(100%,455px);text-align:center;padding:42px 28px;border:1px solid #ffffff30;border-radius:27px;background:#ffffff09;box-shadow:0 20px 85px #0008;backdrop-filter:blur(22px)}.star{font-size:62px;color:#f5b5d5;text-shadow:0 0 40px #f5aadb8a}h1{font:500 clamp(36px,8vw,54px)/1.08 Georgia,serif;margin:17px 0 13px}p{color:#c6b6d4;line-height:1.7;font-size:14px}label{display:block;text-align:left;font-size:12px;letter-spacing:.1em;margin:34px 0 9px;color:#efd0df}input{background:#ffffff10;color:#fff;border:1px solid #ffffff52;border-radius:13px;padding:16px;width:100%;font:inherit;outline-offset:3px}button{margin-top:15px;width:100%;border:0;border-radius:14px;padding:16px;font:700 15px system-ui,sans-serif;background:#f7cbe1;color:#1e1320;cursor:pointer}.error{color:#ffafc4;margin-top:12px;font-size:13px}</style></head><body><main><div class="star" aria-hidden="true">✦</div><h1>A little universe<br>just for you.</h1><p>Some memories are meant to be shared with someone special.<br>Enter the magical phrase to step inside.</p><form action="/unlock" method="post"><label for="secret">OUR MAGIC WORD</label><input type="password" name="secret" id="secret" placeholder="A little secret between us…" autocomplete="off" maxlength="160" required autofocus><button type="submit">Enter our universe ✦</button></form>${failed?'<p class="error" role="alert">That wasn’t the phrase. Try again gently ✨</p>':""}</main></body></html>`;
 const response=new Response(html,{status:failed?401:200,headers:{"Content-Type":"text/html; charset=utf-8"}});
 return secureHeaders(response,{"Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"});
}
function getCookie(req){
 const line=req.headers.get("Cookie")||"";
 for(const pair of line.split(";")){
  const [key,...rest]=pair.trim().split("=");
  if(key===COOKIE)return rest.join("=");
 }return null;
}
async function sessionCookie(secretKey){
 const expires=Date.now()+SESSION_SECONDS*1000;
 const random=new Uint8Array(16);crypto.getRandomValues(random);
 const payload=expires+"."+base64url(random);
 return payload+"."+await hmac(payload,secretKey);
}
async function hasSession(req,secretKey){
 const raw=getCookie(req);
 if(!raw||!secretKey||raw.length>400)return false;
 const parts=raw.split(".");
 if(parts.length!==3)return false;
 const expiry=Number(parts[0]);
 if(!Number.isSafeInteger(expiry)||expiry<Date.now()||expiry>Date.now()+SESSION_SECONDS*1000+60000)return false;
 const payload=parts[0]+"."+parts[1];
 const expected=await hmac(payload,secretKey);
 return safeEqual(utf8(expected),utf8(parts[2]));
}
function manifestFromEnv(env){
 if(!env.MEMORIES_MANIFEST)return {files:{},photos:[],timeline:[],videos:[],hero:null};
 try{const value=JSON.parse(env.MEMORIES_MANIFEST);return value&&typeof value==="object"?value:{files:{}}}catch{return{files:{}}}
}
function publicMediaEntry(entry,files,video=false){
 if(!entry||typeof entry!=="object"||typeof entry.key!=="string"||!files?.[entry.key])return null;
 const url="/api/private/media/"+encodeURIComponent(entry.key);
 const result={url,title:entry.title??"",caption:entry.caption??"",alt:entry.alt??""};
 if(video&&entry.posterKey&&files[entry.posterKey])result.poster="/api/private/media/"+encodeURIComponent(entry.posterKey);
 return result;
}
function mediaIndex(manifest){
 const files=manifest.files??{};
 return {
  hero:publicMediaEntry(manifest.hero,files),
  photos:(manifest.photos??[]).map(v=>publicMediaEntry(v,files)).filter(Boolean).slice(0,40),
  timeline:(manifest.timeline??[]).slice(0,30).map(v=>publicMediaEntry(v,files)), // Preserve empty slots; never shift named photos
  videos:(manifest.videos??[]).map(v=>publicMediaEntry(v,files,true)).filter(Boolean).slice(0,20)
 };
}
let cachedToken=null,tokenExpires=0;
function pemToBytes(pem){
 const cleaned=pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,"");
 const bin=atob(cleaned);return Uint8Array.from(bin,c=>c.charCodeAt(0));
}
async function googleAccessToken(env){
 if(cachedToken&&Date.now()<tokenExpires-120000)return cachedToken;
 if(!env.GOOGLE_SA_EMAIL||!env.GOOGLE_SA_PRIVATE_KEY)throw Error("Drive service account not configured");
 const key=await crypto.subtle.importKey("pkcs8",pemToBytes(env.GOOGLE_SA_PRIVATE_KEY),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
 const now=Math.floor(Date.now()/1000);
 const header=base64url(utf8(JSON.stringify({alg:"RS256",typ:"JWT"})));
 const payload=base64url(utf8(JSON.stringify({
  iss:env.GOOGLE_SA_EMAIL,scope:"https://www.googleapis.com/auth/drive.readonly",
  aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600
 })));
 const unsigned=header+"."+payload;
 const signature=base64url(new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,utf8(unsigned))));
 const body=new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:unsigned+"."+signature});
 const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
 if(!tokenResponse.ok)throw Error("Google token exchange failed");
 const token=await tokenResponse.json();
 if(!token.access_token)throw Error("Google access token missing");
 cachedToken=token.access_token;tokenExpires=Date.now()+Math.min(token.expires_in??3600,3600)*1000;
 return cachedToken;
}
async function serveMedia(request,env,manifest,key){
 if(!/^[a-zA-Z0-9_-]{1,64}$/.test(key))return new Response("Not found",{status:404});
 const file=manifest.files?.[key];
 if(!file||!/^[-_a-zA-Z0-9]{10,120}$/.test(file.id||""))return new Response("Not found",{status:404});
 const mime=file.mime||"image/jpeg";
 const allowed=["image/jpeg","image/png","image/webp","image/avif","video/mp4"];
 if(!allowed.includes(mime))return new Response("Unsupported format",{status:415});
 try{
  const token=await googleAccessToken(env);
  const headers={Authorization:"Bearer "+token};
  const range=request.headers.get("Range");if(range&&/^bytes=\d*-\d*$/.test(range))headers.Range=range;
  const upstream=await fetch("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(file.id)+"?alt=media",{headers,redirect:"follow"});
  if(!upstream.ok&&upstream.status!==206)return new Response("Media temporarily unavailable",{status:502});
  const forwarded=new Headers({"Content-Type":mime,"Content-Disposition":"inline"});
  for(const name of ["Content-Length","Content-Range","Accept-Ranges"])if(upstream.headers.has(name))forwarded.set(name,upstream.headers.get(name));
  return secureHeaders(new Response(upstream.body,{status:upstream.status,headers:forwarded}));
 }catch{return new Response("Media temporarily unavailable",{status:503})}
}
export default {
 async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(!env.ACCESS_PASSPHRASE||!env.SESSION_SIGNING_KEY)return secureHeaders(new Response("Secure site is not configured yet.",{status:503}));
  if(path==="/unlock"&&request.method==="POST"){
   if(Number(request.headers.get("Content-Length")||0)>2048)return gatePage(true);
   let entered="";try{entered=String((await request.formData()).get("secret")||"").trim().toLowerCase()}catch{return gatePage(true)}
   if(!entered||entered.length>160)return gatePage(true);
   const correct=await hash(env.ACCESS_PASSPHRASE.trim().toLowerCase());
   const provided=await hash(entered);
   if(!safeEqual(provided,correct))return gatePage(true);
   const cookie=await sessionCookie(env.SESSION_SIGNING_KEY);
   return secureHeaders(new Response(null,{status:303,headers:{
    Location:"/","Set-Cookie":COOKIE+"="+cookie+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+SESSION_SECONDS
   }}));
  }
  if(path==="/unlock"&&request.method==="GET")return gatePage();
  const authorized=await hasSession(request,env.SESSION_SIGNING_KEY);
  if(!authorized)return request.method==="GET"?gatePage():secureHeaders(new Response("Not authorized",{status:401}));
  if(path==="/logout"){
   return secureHeaders(new Response(null,{status:303,headers:{
    Location:"/unlock","Set-Cookie":COOKIE+"=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
   }}));
  }
  const manifest=manifestFromEnv(env);
  // The optional real Amazon.in gift card is stored as an encrypted Cloudflare
  // Worker secret, never in GitHub, HTML, JS or a public Drive document.
  if(path==="/api/private/gift"&&request.method==="GET"){
   const code=String(env.BIRTHDAY_GIFT_CODE||"").trim();
   if(!code||!(/^[A-Za-z0-9-]{6,100}$/.test(code))){
    return secureHeaders(Response.json({ready:false}));
   }
   return secureHeaders(Response.json({ready:true,code}));
  }
  if(path==="/api/private/memories"&&request.method==="GET"){
   return secureHeaders(Response.json(mediaIndex(manifest)));
  }
  if(path.startsWith("/api/private/media/")&&request.method==="GET"){
   return serveMedia(request,env,manifest,path.slice("/api/private/media/".length));
  }
  if(path.startsWith("/api/"))return secureHeaders(new Response("Not found",{status:404}));
  if(request.method!=="GET"&&request.method!=="HEAD")return secureHeaders(new Response("Method not allowed",{status:405}));
  const asset=await env.ASSETS.fetch(request);
  return secureHeaders(asset);
 }
};