import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { seasonStories } from "../src/data.js";

const origin = "https://messi-career-vault.ukaushik37.workers.dev";
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const minutes = (story) => Math.max(1, Math.ceil([story.dek, ...story.paragraphs].join(" ").trim().split(/\s+/).length / 220));

const renderMedia = (story, index) => {
  const photo = story.photos?.find((item) => item.after === index);
  const video = story.videos?.find((item) => item.after === index);
  return [
    photo ? `<figure><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="lazy"><figcaption><span>${escapeHtml(photo.caption)}</span><a href="${escapeHtml(photo.href)}">Photo: ${escapeHtml(photo.credit)}</a></figcaption></figure>` : "",
    video ? `<figure class="video"><div><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(video.youtubeId)}?rel=0" title="${escapeHtml(video.title)}" loading="lazy" allowfullscreen></iframe></div><figcaption><span>${escapeHtml(video.caption)}</span><a href="${escapeHtml(video.href)}">Video: ${escapeHtml(video.credit)}</a></figcaption></figure>` : "",
  ].join("");
};

for (const [season, story] of Object.entries(seasonStories)) {
  const path = `/articles/${season.replace("–", "-")}/${slug(story.title)}/`;
  const canonical = `${origin}${path}`;
  const hero = story.photos?.[0]?.src || `${origin}/favicon.svg`;
  const body = story.paragraphs.map((paragraph, index) => `<p>${escapeHtml(paragraph)}</p>${renderMedia(story, index)}`).join("\n");
  const sources = story.sources.map(([label, url]) => `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join("");
  const document = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(story.title)} — ${escapeHtml(season)} | The Messi Archive</title>
<meta name="description" content="${escapeHtml(story.dek)}"><meta name="author" content="The Messi Archive">
<link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.svg">
<meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(story.title)}"><meta property="og:description" content="${escapeHtml(story.dek)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${escapeHtml(hero)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(story.title)}"><meta name="twitter:description" content="${escapeHtml(story.dek)}"><meta name="twitter:image" content="${escapeHtml(hero)}">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: story.title, description: story.dek, image: hero, author: { "@type": "Organization", name: "The Messi Archive" }, mainEntityOfPage: canonical })}</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
:root{color-scheme:dark;--ink:#d3dae4;--muted:#8795a8;--blue:#52ddff;--night:#061020}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0,#102b4c 0,transparent 35%),var(--night);color:var(--ink);font-family:Manrope,system-ui,sans-serif}.bar{height:74px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 clamp(18px,4vw,58px);border-bottom:1px solid #ffffff12;background:#061020e8;position:sticky;top:0;z-index:2;backdrop-filter:blur(18px)}.brand{color:#f8f5ef;font-weight:800;letter-spacing:2px;text-decoration:none}.brand b{color:var(--blue)}.actions{display:flex;gap:10px}.actions a{display:inline-flex;align-items:center;min-height:38px;padding:0 14px;border:1px solid #ffffff1c;border-radius:8px;color:#dce3eb;font-size:11px;font-weight:800;letter-spacing:.7px;text-decoration:none}.actions .reader{border-color:#52ddff55;background:#52ddff12;color:var(--blue)}main{max-width:970px;margin:auto;padding:clamp(48px,8vw,100px) clamp(20px,6vw,80px) 110px}.eyebrow{color:var(--blue);font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}h1{max-width:820px;margin:15px 0 22px;color:#fbf8f2;font:700 clamp(46px,9vw,92px)/.96 'Playfair Display',serif;letter-spacing:-2px}.dek{max-width:760px;margin:0 0 19px;color:#f0f2f5;font:600 clamp(19px,3vw,27px)/1.5 Manrope}.meta{display:flex;gap:14px;margin-bottom:52px;color:var(--muted);font-size:11px;letter-spacing:.8px;text-transform:uppercase}article>p{max-width:700px;margin:0 auto 1.45em;color:var(--ink);font:400 clamp(16px,2vw,19px)/1.88 Manrope}article>p:first-child:first-letter{float:left;margin:.08em .11em 0 0;color:#f8f5ef;font:700 4.5em/.73 'Playfair Display',serif}figure{max-width:850px;margin:48px auto}figure img{display:block;width:100%;max-height:620px;object-fit:cover;border-radius:6px}.video>div{aspect-ratio:16/9}.video iframe{width:100%;height:100%;border:0;border-radius:6px}figcaption{display:flex;justify-content:space-between;gap:18px;margin-top:11px;color:var(--muted);font-size:10px;line-height:1.5}figcaption a,.sources a{color:var(--blue);text-decoration:none}.sources{max-width:700px;margin:60px auto 0;padding-top:25px;border-top:1px solid #ffffff17}.sources h2{font-size:11px;letter-spacing:2px;color:var(--blue)}.sources ul{padding-left:18px}.sources li{margin:9px 0;font-size:12px}.end{max-width:700px;margin:60px auto 0;padding:30px;border:1px solid #52ddff25;border-radius:10px;text-align:center}.end strong{display:block;margin-bottom:15px;color:#fff;font-family:'Playfair Display',serif;font-size:23px}.end a{display:inline-flex;padding:12px 17px;border-radius:7px;background:#52ddff;color:#061020;font-size:11px;font-weight:800;text-decoration:none}@media(max-width:600px){.bar{height:auto;min-height:68px}.brand{font-size:11px}.actions a:first-child{display:none}.actions a{padding:0 10px;font-size:9px}h1{letter-spacing:-1px}figcaption{display:block}figcaption a{display:block;margin-top:6px}main{padding-top:52px}}
</style></head><body>
<header class="bar"><a class="brand" href="/">THE MESSI <b>ARCHIVE</b></a><nav class="actions"><a href="/">BACK TO THE ARCHIVE</a><a class="reader" href="https://wise.readwise.io/save?url=${encodeURIComponent(canonical)}">SAVE TO READWISE</a></nav></header>
<main><header><span class="eyebrow">Chapter ${String(Object.keys(seasonStories).indexOf(season) + 1).padStart(2, "0")} · <time>${escapeHtml(season)}</time></span><h1>${escapeHtml(story.title)}</h1><p class="dek">${escapeHtml(story.dek)}</p><div class="meta"><span>${minutes(story)} minute read</span><span>By The Messi Archive</span></div></header>
<article>${body}<aside class="sources"><h2>RESEARCH SOURCES</h2><ul>${sources}</ul></aside><div class="end"><strong>Keep this chapter with you.</strong><a href="https://wise.readwise.io/save?url=${encodeURIComponent(canonical)}">SAVE THIS ARTICLE TO READER</a></div></article></main></body></html>`;
  const directory = resolve("dist", path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), document);
}

console.log(`Generated ${Object.keys(seasonStories).length} standalone article pages.`);
