import { preserveLegacyFragments } from './legacy-fragments.js';
import { generateRestored } from './generate-restored.js';
import { generateSwag } from './render-swag.js';
import { generateLibrary } from './render-library.js';
import { renderMountain } from "./render-mountain.js";
import { renderFooter } from "./render-footer.js";
import { generateProjects } from "./generate-projects.js";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { parse } from "yaml";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

import { socialPreview } from "./social-preview.js";
const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const slug = title => title.replace(/^#/, "").replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
const clean = html => sanitizeHtml(html, {
  allowedTags: sanitizeHtml.defaults.allowedTags,
  allowedAttributes: { a: ["href", "title"] },
  allowedSchemes: ["https", "http", "mailto"],
  transformTags: { a: (tagName, attrs) => ({ tagName, attribs: { ...attrs, href: (attrs.href || "").replace(/^https:\/\/sovereignengineering\.io\/podcast\//, "/podcast/") } }) },
});
const markdown = text => clean(marked.parse(text || ""));
const textOnly = html => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
const safeUrl = url => {
  if (!/^https?:\/\//.test(url || "")) throw new Error(`Invalid podcast URL: ${url}`);
  return escape(url);
};

function layout(title, description, path, body, image = "/images/nosolutions-og.jpg") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#080808">
  <title>${escape(title)} — Sovereign Engineering</title>
  <meta name="description" content="${escape(description)}">
  ${socialPreview(title, description, path, image)}
  <link rel="alternate" type="application/rss+xml" title="${path.startsWith("/blog/") ? "Sovereign Engineering Blog" : "No Solutions"}" href="${path.startsWith("/blog/") ? "/blog/rss.xml" : "/dialogues.xml"}">
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body class="content-page">
  <a class="skip-link" href="#content">Skip to content</a>
  <nav class="nav" aria-label="Main navigation">
    <a class="nav-brand" href="/" aria-label="Sovereign Engineering home"><img src="/src/assets/brandmark.svg" alt=""><span>Sovereign<br>Engineering</span></a>
    <div class="nav-links"><a href="/podcast/"${path.startsWith("/podcast") ? ' aria-current="page"' : ""}>Listen</a><a href="/faq/"${path === "/faq/" ? ' aria-current="page"' : ""}>FAQ</a><a href="/#apply">Apply</a></div>
  </nav>
  <main id="content" class="content-shell${path === "/mountain/" ? " mountain-shell" : ""}">${body}</main>
  ${renderFooter(path === "/mountain/" ? "mountain" : "sea")}
  <script type="module" src="/src/footer-animation.js"></script>
</body>
</html>`;
}

export function generatePages() {
  const xml = readFileSync("public/dialogues.xml", "utf8");
  if (XMLValidator.validate(xml) !== true) throw new Error("Invalid podcast RSS");
  const channel = new XMLParser({ ignoreAttributes: false, parseTagValue: false }).parse(xml).rss.channel;
  const episodes = (Array.isArray(channel.item) ? channel.item : [channel.item]).map(item => {
    const duration = Number(item["itunes:duration"]);
    const date = new Date(item.pubDate);
    if (!item.title || !Number.isFinite(duration) || !Number.isFinite(date.getTime())) throw new Error("Incomplete podcast episode");
    return { ...item, slug: slug(item.title), date, duration: `${Math.floor(duration / 60)} min` };
  }).sort((a, b) => b.date - a.date);
  if (!episodes.length || new Set(episodes.map(ep => ep.slug)).size !== episodes.length) throw new Error("Missing or duplicate episodes");
  const files = [];
  // These directories contain only generated output, never editable source.
  for (const directory of ["podcast", "faq", "policy", "projects", "mountain", "books", "timeline", "swag", "alumni", "blog", "media", "concept", "philosophy", "loop", "contest", "public/social"]) rmSync(directory, { recursive: true, force: true });
  const write = (path, html) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, preserveLegacyFragments(html, "/"+path.replace(/index\.html$/, "")));
    files.push(path);
  };
  const meta = ep => `<p class="episode-meta"><time datetime="${ep.date.toISOString()}">${ep.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time><span>${ep.duration}</span></p>`;
  const description = "Walking dialogues about freedom tech, open protocols, and the trade-offs of building in the open.";
  const episodeCards = list => list.map(ep => `<article class="episode-card"><a href="/podcast/${ep.slug}/"><img src="${safeUrl(ep["itunes:image"]["@_href"])}" alt="" width="240" height="240" loading="lazy"><div>${meta(ep)}<h3>${escape(ep.title)}</h3><p>${textOnly(ep.description.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] || "").slice(0, 350)}</p></div></a></article>`).join("");
  // Reuse the landing-page artwork so both versions stay in sync.
  const bellArt = readFileSync("index.html", "utf8").match(/(<svg class="bell-meme"[\s\S]*?<\/svg>)\s*<\/div>/)?.[1];
  if (!bellArt) throw new Error("Missing landing-page bell curve artwork");
  write("podcast/index.html", layout("No Solutions", description, "/podcast/", `
    <header class="podcast-hero">
      <img src="/images/nosolutions-cover.jpg" width="600" height="600" alt="No Solutions dialogue artwork">
      <div><h1>No<br>Solutions.</h1><p class="content-lead">Walking towards a better internet since <a href="https://mempool.space/block/882690" target="_blank" rel="noopener noreferrer">882,690</a>.</p>
      <div class="content-links"><a href="/dialogues.xml">Subscribe via RSS ↗</a><a href="https://castr.me/npub1n00yy9y3704drtpph5wszen64w287nquftkcwcjv7gnnkpk2q54s73000n">castr.me ↗</a><a href="https://podcastindex.org/podcast/7206062">Podcast Index ↗</a><a href="https://njump.to/nosolutions@sovereignengineering.io">Nostr ↗</a></div></div>
    </header>
    <figure class="podcast-quote">
      <blockquote cite="https://njump.to/nevent1qqsyeue9x26zdcrz2wx8stvl3kmxw42clqd5n4jgpuvxhemm6q8fyugprfmhxue69uhhq7tjv9kkjepwve5kzar2v9nzucm0d5hsygpm7rrrljungc6q0tuh5hj7ue863q73qlheu4vywtzwhx42a7j9n5psgqqqq3tszvt290"><p>“Once it left its AI psychosis phase it has had some good moments.”</p></blockquote>
      <figcaption>— <a href="https://njump.to/nevent1qqsyeue9x26zdcrz2wx8stvl3kmxw42clqd5n4jgpuvxhemm6q8fyugprfmhxue69uhhq7tjv9kkjepwve5kzar2v9nzucm0d5hsygpm7rrrljungc6q0tuh5hj7ue863q73qlheu4vywtzwhx42a7j9n5psgqqqq3tszvt290">fiatjaf ↗</a></figcaption>
    </figure>
    <section aria-labelledby="episodes"><div class="archive-heading"><h2 id="episodes">Latest dialogues.</h2></div>
    <div class="episode-list">${episodeCards(episodes.slice(0, 3))}</div></section>
    <div class="podcast-bell-interlude"><div class="bell-scene">${bellArt}</div></div>
    <section aria-labelledby="dialogue-archive"><div class="archive-heading"><h2 id="dialogue-archive">The archive.</h2></div>
    <div class="episode-list">${episodeCards(episodes.slice(3))}</div></section>
    <script type="module" src="/src/podcast-page.js"></script>`));
  for (const ep of episodes) {
    const audio = safeUrl(ep.enclosure["@_url"]);
    const transcript = ep["podcast:transcript"];
    const notes = ep["podcast:contentLink"];
    write(`podcast/${ep.slug}/index.html`, layout(`${ep.title} — No Solutions`, description, `/podcast/${ep.slug}/`, `
      <a class="text-link" href="/podcast/">← All dialogues</a>
      <header class="episode-hero"><img src="${safeUrl(ep["itunes:image"]["@_href"])}" width="400" height="400" alt="Dialogue artwork"><div><p class="section-index">No Solutions</p><h1>${escape(ep.title)}</h1>${meta(ep)}
      <audio controls preload="none" aria-label="${escape(ep.title)}"><source src="${audio}" type="${escape(ep.enclosure["@_type"] || "audio/mpeg")}">Your browser does not support audio playback.</audio>
      <div class="content-links"><a href="${audio}">Open audio ↗</a>${ep.link ? `<a href="${safeUrl(ep.link.replace("njump.me", "njump.to"))}">Discuss on Nostr ↗</a>` : ""}${notes ? `<a href="${safeUrl(notes["@_href"])}">Show notes ↗</a>` : ""}${transcript ? `<a href="${safeUrl(transcript["@_url"])}">Transcript ↗</a>` : ""}</div></div></header>
      <section class="prose show-notes" aria-label="Dialogue notes">${clean(ep.description)}</section>
      <a class="text-link" href="/podcast/">← All dialogues</a>`, ep["itunes:image"]["@_href"]));
  }
  for (const name of ["faq", "policy"]) {
    const source = readFileSync(`content/${name}.md`, "utf8");
    const data = parse(source.split("---")[1]);
    const sections = data.sections.map(section => `<section class="faq-section" id="${escape(section.id)}"><h2>${escape(section.title)}</h2>${section.questions ? markdown(section.content) : ""}${section.questions ? section.questions.map(q => {
      const id = slug(q.question);
      return `<details id="${id}"><summary>${escape(q.question)}</summary><div class="prose">${markdown(q.answer)}</div></details>`;
    }).join("") : `<div class="prose">${markdown(section.content)}</div>`}</section>`).join("");
    write(`${name}/index.html`, layout(name === "faq" ? "Frequently asked questions" : data.title, data.description, `/${name}/`, `
      <header class="text-hero"><p class="section-index">Sovereign Engineering / ${name === "faq" ? "The practical details" : "How we work"}</p><h1>${name === "faq" ? "Before you<br>join us." : escape(data.title)}</h1><div class="content-lead">${name === "faq" ? "The program, the island, and what to expect." : markdown(data.intro.content)}</div></header>
      <div class="faq-layout"><aside class="section-menu" aria-label="On this page">${data.sections.map(section => `<a href="#${escape(section.id)}">${escape(section.title)}</a>`).join("")}</aside><div>${sections}</div></div><script type="module" src="/src/content.js"></script>`, "/images/sovereign-engineering.png"));
  }
  write("mountain/index.html", layout("Mountain cohort — Spring 2027", "A seven-day mountain cohort in spring 2027. Talk through ideas together, away from devices, then return to the valley for a 24-hour build and Demo Day.", "/mountain/", renderMountain(), "/images/sovereign-engineering.png"));
  generateProjects({ write, layout, escape });
  generateLibrary({ write, layout, escape });
  generateSwag({ write, layout, escape });
  generateRestored({ write, layout, escape });
  write('404.html', layout('Page not found', 'Find your way back to Sovereign Engineering.', '/404.html', `<section class="library-hero"><p class="section-index">404</p><h1>Off the map.</h1><p class="content-lead">That page isn’t here. Try the links below.</p><div class="article-footer"><a class="text-link" href="/">Back to the program →</a><a class="text-link" href="/projects/">Project archive →</a><a class="text-link" href="/blog/">Blog →</a></div></section>`).replace('</head>', '<meta name="robots" content="noindex"></head>'));
  return files;
}
