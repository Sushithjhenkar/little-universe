import {mkdir,readFile,writeFile,rm,copyFile} from "node:fs/promises";
import {join} from "node:path";

const dest="dist";
await rm(dest,{recursive:true,force:true});
await mkdir(dest,{recursive:true});

const files=["styles.css","cinematic.css","experience.css","quiz.css","warm.css","sunny.css","cake.css","celebration.css","script.js","cinematic.js","experience.js","quiz.js","gift.js","cake.js","celebration.js"];
for(const file of files)await copyFile(file,join(dest,file));

let html=await readFile("index.html","utf8");
if(!html.includes("<body>"))throw new Error("Could not find <body> in cinematic home");
html=html.replace("<body>",'<body data-media-api="/api/private/memories">');
await writeFile(join(dest,"index.html"),html,"utf8");
console.log("Built protected cinematic birthday site. No playable world or personal media bundled.");
