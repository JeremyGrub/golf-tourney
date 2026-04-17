const fs = require("fs");
const html = fs.readFileSync("/tmp/lb-nf.html", "utf8");
const noScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
console.log("--- h1 in visible DOM ---");
for (const m of noScripts.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)) {
  console.log(m[1].slice(0, 180));
}
console.log("--- counts in visible DOM ---");
const phrases = [
  "No tournament here",
  "find this hole",
  "off the map",
  "leaderboard",
];
for (const phrase of phrases) {
  let count = 0;
  let idx = 0;
  while ((idx = noScripts.indexOf(phrase, idx)) !== -1) {
    count++;
    idx += phrase.length;
  }
  console.log(`${phrase}: ${count}`);
}
