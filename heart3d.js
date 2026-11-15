/* Golden 3D heart: three.js (r128). Rotates and zooms with scroll, tilts with the mouse. Falls back to a CSS heart if WebGL is unavailable. */
(()=>{
const T=document.querySelector(".h3-track");if(!T)return;
const sec=T.closest(".h3"),canvas=T.querySelector(".h3-canvas"),ta=T.querySelector(".h3-text .a"),tb=T.querySelector(".h3-text .b"),hint=T.querySelector(".h3-hint"),glow=T.querySelector(".h3-glow");
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v);
function boot(){
let gl=null;try{if(window.THREE)gl=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true})}catch(e){gl=null}
if(!gl)sec.classList.add("nogl");
let grp,ring1,ring2,pts,minis=[],cam,scene,fit=1,gold;
if(gl){gl.setPixelRatio(Math.min(devicePixelRatio||1,2));
 scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(40,1,.1,100);cam.position.set(0,0,9);
 scene.add(new THREE.AmbientLight(0xffe2b0,.8));
 const d=new THREE.DirectionalLight(0xffffff,1.3);d.position.set(3,4,6);scene.add(d);
 const p1=new THREE.PointLight(0xff6b9d,2.4,30);p1.position.set(-5,-1,4);scene.add(p1);
 const p2=new THREE.PointLight(0xffd24a,2.6,30);p2.position.set(5,2,-1);scene.add(p2);
 const sh=new THREE.Shape(),x=0,y=0;
 sh.moveTo(x+.25,y+.25);sh.bezierCurveTo(x+.25,y+.25,x+.2,y,x,y);sh.bezierCurveTo(x-.3,y,x-.3,y+.35,x-.3,y+.35);sh.bezierCurveTo(x-.3,y+.55,x-.1,y+.77,x+.25,y+.95);sh.bezierCurveTo(x+.6,y+.77,x+.8,y+.55,x+.8,y+.35);sh.bezierCurveTo(x+.8,y+.35,x+.8,y,x+.5,y);sh.bezierCurveTo(x+.35,y,x+.25,y+.25,x+.25,y+.25);
 const geo=new THREE.ExtrudeGeometry(sh,{depth:.35,bevelEnabled:true,bevelSegments:10,steps:2,bevelSize:.08,bevelThickness:.08,curveSegments:48});geo.center();
 gold=new THREE.MeshStandardMaterial({color:0xffc63a,metalness:.6,roughness:.26,emissive:0x4a2200,emissiveIntensity:.35});
 const heart=new THREE.Mesh(geo,gold);heart.rotation.z=Math.PI;heart.scale.setScalar(3.2);grp=new THREE.Group();grp.add(heart);scene.add(grp);
 const rm1=new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.75});
 ring1=new THREE.Mesh(new THREE.TorusGeometry(3.3,.035,16,200),rm1);ring2=new THREE.Mesh(new THREE.TorusGeometry(3.9,.025,16,200),rm1);scene.add(ring1,ring2);
 const N=450,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const r=3.6+Math.random()*4.2,a=Math.random()*6.283,b=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(b)*Math.cos(a);pos[i*3+1]=r*Math.sin(b)*Math.sin(a);pos[i*3+2]=r*Math.cos(b)}
 const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
 pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xfff3b0,size:.07,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(pts);
 const pink=new THREE.MeshStandardMaterial({color:0xff5c8a,metalness:.3,roughness:.35});
 for(let i=0;i<12;i++){const m=new THREE.Mesh(geo,pink);m.scale.setScalar(.55);m.rotation.z=Math.PI;scene.add(m);minis.push({m,r:3.5+Math.random()*1.8,sp:.15+Math.random()*.25,ph:Math.random()*6.283,yo:(Math.random()-.5)*3})}}
function resize(){if(!gl)return;const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;gl.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();fit=Math.min(1,cam.aspect*1.25)}
resize();addEventListener("resize",()=>{resize();frame(true)});
let mx=0,my=0,vis=false,raf=0;const t0=performance.now();
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function frame(once){const t=(performance.now()-t0)/1000,r=T.getBoundingClientRect(),p=rm?.5:cl(-r.top/(r.height-innerHeight)),e=ez(p);
 const a=ez(cl((p-.06)/.2)),b=ez(cl((p-.36)/.2));
 ta.style.opacity=rm?1:a;ta.style.transform=`translateY(${(1-a)*40}px) scale(${.9+.1*a})`;ta.style.filter=`blur(${(1-a)*10}px)`;
 tb.style.opacity=rm?1:b;tb.style.transform=`translateY(${(1-b)*40}px) scale(${.9+.1*b})`;tb.style.filter=`blur(${(1-b)*10}px)`;
 hint.style.opacity=.8*(1-cl(p/.08));glow.style.transform=`scale(${.7+e*.6})`;glow.style.opacity=.5+e*.5;
 if(!gl)return;
 const beat=1+.04*Math.pow(Math.max(0,Math.sin(t*3.2)),6);
 grp.rotation.y=p*Math.PI*2.2+mx*.6;grp.rotation.x=Math.sin(p*Math.PI)*.35-my*.35+.08;grp.position.y=Math.sin(t*1.2)*.12;
 grp.scale.setScalar((.7+e*.6)*fit*beat);cam.position.z=9-e*1.4;
 ring1.rotation.set(t*.3+p*3,p*2.4,0);ring2.rotation.set(1.2+p*2,t*.25,p*1.5);ring1.scale.setScalar(fit);ring2.scale.setScalar(fit);
 pts.rotation.y=t*.05+p*1.5;pts.rotation.x=p*.6;
 minis.forEach(o=>{const an=t*o.sp+o.ph+p*3;o.m.position.set(Math.cos(an)*o.r*fit,o.yo+Math.sin(t*.6+o.ph)*.6,Math.sin(an)*o.r*.6);o.m.rotation.y=t+o.ph});
 gold.emissiveIntensity=.3+.2*Math.sin(t*2);
 gl.render(scene,cam)}
function loop(){if(!vis){raf=0;return}frame();raf=requestAnimationFrame(loop)}
if(rm){frame(true);return}
new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!raf)loop()},{rootMargin:"100px"}).observe(T);
}
if(window.THREE||rm)boot();else addEventListener("load",boot);
})();