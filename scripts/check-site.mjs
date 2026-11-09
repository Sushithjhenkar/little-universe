import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const html = await readFile("index.html", "utf8");
const required = ["id=\"cosmos-cards\"","id=\"birthday-quiz-card\"","id=\"birthday-cake\"","id=\"cake-cut-experience\"","id=\"golden-bouquet\""];
for (const marker of required) {
  if (!html.includes(marker)) throw new Error("Cinematic birthday section missing: " + marker);
}
if (html.includes('id="world-avatar"') || html.includes('id="world-map"') || html.includes('href="world.html"')) {
  throw new Error("Retired playable character/navigation game detected in homepage");
}

const assets = new Set();
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const url = match[1];
  if (/^(?:https?:|data:|mailto:|tel:|#)/i.test(url)) continue;
  const pathname = url.split(/[?#]/)[0].replace(/^\//, "");
  if (!pathname || pathname.startsWith("api/")) continue;
  if (pathname.includes("..")) throw new Error("Unsafe asset path: " + pathname);
  assets.add(pathname);
}
for (const file of assets) {
  try { await access(resolve(file)); }
  catch { throw new Error("Referenced public asset missing: " + file); }
}
for (const file of ["celebration.css", "celebration.js", "cake.js", "quiz.js"]) {
  if (!assets.has(file)) throw new Error("Expected birthday asset not linked: " + file);
}
console.log("Cinematic birthday build check passed; " + assets.size + " linked local assets verified.");
