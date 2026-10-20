import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { parse } from 'yaml';
import { renderMountain } from './render-mountain.js';

// Public canonicals stay on the main domain, including when previewing on Vercel.
const origin = process.env.SITE_URL || 'https://soveng.com';
const parsedOrigin = new URL(origin);
if (parsedOrigin.protocol !== 'https:' || parsedOrigin.pathname !== '/' || parsedOrigin.search || parsedOrigin.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without a path, query, or fragment');
}
export const site = parsedOrigin.origin;
// Production images use the canonical host; previews use their own deployment.
const imageOrigin = process.env.SOCIAL_IMAGE_ORIGIN ||
  (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
    site);
const parsedImageOrigin = new URL(imageOrigin);
if (parsedImageOrigin.protocol !== 'https:' || parsedImageOrigin.pathname !== '/' || parsedImageOrigin.search || parsedImageOrigin.hash) {
  throw new Error('SOCIAL_IMAGE_ORIGIN must be an HTTPS origin without a path, query, or fragment');
}
export const socialImageOrigin = parsedImageOrigin.origin;
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const font = { loadSystemFonts: false, fontFiles: ['scripts/social-fonts/EBGaramond.ttf', 'scripts/social-fonts/DMMono-Regular.ttf'], defaultFontFamily: 'EB Garamond' };
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">${body}</svg>`;
const dataImage = file => {
  const type = {'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'}[extname(file)];
  return type ? `data:${type};base64,${readFileSync(file).toString('base64')}` : null;
};
const brandmark = dataImage('src/assets/brandmark.svg');
const cover = dataImage('public/images/nosolutions-cover.jpg');
const widthCache = new Map();
function textWidth(text, size) {
  if (!widthCache.has(text)) {
    const renderer = new Resvg(svg(`<text y="120" font-family="EB Garamond" font-size="100">${e(text)}</text>`), {font});
    // innerBBox clips to the SVG viewport, undercounting long titles.
    widthCache.set(text, renderer.getBBox()?.width || 0);
  }
  return widthCache.get(text) * size / 100;
}
function fitTitle(title, explicitLines, episode = false) {
  for (let size = explicitLines ? 100 : 86; size >= 38; size -= 2) {
    const lines = explicitLines ? [...explicitLines] : [''];
    if (!explicitLines) for (const word of title.split(/\s+/)) {
      const candidate = `${lines.at(-1)} ${word}`.trim();
      if (lines.at(-1) && textWidth(candidate, size) > 660) lines.push(word);
      else lines[lines.length - 1] = candidate;
    }
    if (lines.length <= (episode ? 5 : 3) && lines.every(line => textWidth(line, size) <= 660) && lines.length * size <= (episode ? 330 : explicitLines ? 290 : 250)) return {lines,size};
  }
  throw new Error(`Social preview title is too long: ${title}`);
}
let mountainArt;
function art(path, image) {
  if (path === '/mountain/') {
    mountainArt ||= renderMountain().match(/<svg class="mountain-scene"[\s\S]*?<\/svg>/)[0]
      .replace('stroke-dasharray="100"', 'stroke-dasharray="none"')
      .replace(/<svg[^>]*>/, '<svg x="590" y="100" width="650" height="500" viewBox="170 20 1000 880">');
    return `${mountainArt}<rect x="590" y="100" width="650" height="90" fill="url(#fade-down)"/><rect x="590" y="550" width="650" height="50" fill="url(#fade-up)"/><rect x="580" y="100" width="250" height="500" fill="url(#fade)"/>`;
  }
  if (path === '/swag/') {
    return `<g transform="translate(795 205)"><path d="M80 0 L30 22 L-30 92 L22 132 L52 98 V300 H258 V98 L288 132 L340 92 L280 22 L230 0 Q155 66 80 0Z" fill="#20201c" stroke="#ba9c84" stroke-width="2"/><image x="120" y="100" width="70" height="82" href="${brandmark}"/></g>`;
  }
  if (path === '/books/') {
    return `<g transform="translate(830 205)" stroke="#eee8dd" stroke-width="2"><g transform="rotate(-9 40 230)"><rect width="68" height="250" fill="#343e32"/><path d="M14 0 V250 M24 24 H54 M24 226 H54"/></g><g transform="translate(82 -35)"><rect width="68" height="285" fill="#773b38"/><path d="M14 0 V285 M24 24 H54 M24 261 H54"/></g><g transform="translate(172 12) rotate(8)"><rect width="68" height="238" fill="#665743"/><path d="M14 0 V238 M24 24 H54 M24 214 H54"/></g><path d="M-55 273 H300" stroke="#536057"/></g>`;
  }
  if (path === '/timeline/') {
    return `<path d="M935 190 V490" stroke="#536057" stroke-width="2"/>${['2023','2024','2025','2026','2027'].map((year,i)=>`<circle cx="935" cy="${190+i*75}" r="${i===4?7:4}" fill="${i===4?'#ed3238':'#eee8dd'}"/><text x="965" y="${196+i*75}" fill="#c5c4b9" font-family="DM Mono" font-size="19">${year}</text>`).join('')}`;
  }
  if (path.startsWith('/podcast/')) {
    const episode = path !== '/podcast/';
    const file = episode && image ? `public/images/dialogue-covers/${createHash('sha256').update(image).digest('hex').slice(0,16)}` : null;
    const artwork = file ? dataImage(`${file}.${existsSync(`${file}.png`) ? 'png' : 'jpg'}`) : cover;
    return `<image x="780" y="190" width="360" height="360" preserveAspectRatio="xMidYMid meet" href="${artwork}"/><path d="M780 570 H1140" stroke="#ed3238" stroke-width="3"/>`;
  }
  if (path === '/') {
    // Frame the supplied portrait around the figure and city in the wide card.
    const background = dataImage('src/assets/social-landing.png');
    return `<defs><filter id="home-monochrome" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs><image x="570" y="-130" width="660" height="1163" href="${background}" filter="url(#home-monochrome)"/><rect x="570" width="250" height="630" fill="url(#fade)"/>`;
  }
  const logo = image?.startsWith('/images/showcase/') ? dataImage(`public${image}`) : null;
  return `<g transform="translate(960 345)"><g fill="none" stroke="#66765d"><circle r="170"/><circle r="128" stroke-dasharray="2 9"/><path d="M0 170 V128 M-170 0 H-128 M128 0 H170 M-120-120 L-90-90 M90 90 L120 120"/></g><g fill="#ed3238"><circle cy="170" r="6"/><circle cx="-170" r="6"/><circle cx="120" cy="-120" r="6"/></g>${logo ? `<image x="-66" y="-66" width="132" height="132" href="${logo}"/>` : `<path d="M0 108 V-60 M0 0 Q-85-3-77-72 Q-9-67 0 0 M0-30 Q67-25 73-106 Q4-95 0-30" fill="#53694e" stroke="#aab599" stroke-width="2"/>`}</g>`;
}
export function socialPreview(title, description, path, image) {
  const mountain = path === '/mountain/';
  const home = path === '/';
  const episode = path.startsWith('/podcast/') && path !== '/podcast/';
  const chapter = mountain ? parse(readFileSync('content/mountain.md','utf8').split('---')[1]).chapters[0] : null;
  const cardTitle = home ? 'Build the tools. Ship the future.' : mountain ? chapter.title : title.replace(/ — No Solutions$/, '');
  const explicitLines = home ? ['Build the tools.', 'Ship the future.'] : mountain ? chapter.title.split(/(?<=\.)\s+/) : null;
  const {lines,size} = fitTitle(cardTitle, explicitLines, episode);
  const label = home ? 'SIX WEEKS / MADEIRA' : mountain ? chapter.day.toUpperCase() : episode ? 'NO SOLUTIONS / DIALOGUES' : path === '/podcast/' ? 'FREE-FLOWING DIALOGUES' : path.startsWith('/projects/') ? 'PROJECTS / OPEN BUILDING BLOCKS' : 'SOVEREIGN ENGINEERING / THE DETAILS';
  const subtitle = home ? 'A program to ship something real.' : mountain ? 'A week of dialogue. 24 hours to build.' : path.startsWith('/podcast/') ? 'Walking towards a better internet.' : path.startsWith('/projects/') ? 'Explore the work. Connect the ideas.' : 'The program, the people, and what to expect.';
  const episodeNumber = episode ? path.match(/^\/podcast\/(\d+)-/)?.[1] : null;
  const footer = episodeNumber !== null && episodeNumber !== undefined ? `NOSOLUTIONS.SHOW/${Number(episodeNumber)}` : path === '/podcast/' ? 'NOSOLUTIONS.SHOW' : 'THINK TOGETHER. BUILD TOGETHER.';
  const background = mountain ? '#102529' : '#080808';
  const card = svg(`<defs><linearGradient id="fade"><stop stop-color="${background}"/><stop offset="1" stop-color="${background}" stop-opacity="0"/></linearGradient><linearGradient id="fade-down" x2="0" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${background}" stop-opacity="0"/></linearGradient><linearGradient id="fade-up" x2="0" y2="1"><stop stop-color="${background}" stop-opacity="0"/><stop offset="1" stop-color="${background}"/></linearGradient></defs><rect width="1200" height="630" fill="${background}"/><g transform="translate(0 ${episode ? -80 : 0})">${art(path,image)}${episode ? '' : `<image x="58" y="46" width="46" height="54" href="${brandmark}"/><g fill="#eee8dd" font-family="DM Mono" font-size="17" letter-spacing="2"><text x="124" y="68">SOVEREIGN</text><text x="124" y="92">ENGINEERING</text></g>`}${episode ? '' : `<text x="60" y="176" font-family="DM Mono" font-size="16" letter-spacing="1.4" fill="${mountain?'#e5aa80':'#a7a29a'}">${e(label)}</text>`}<g font-family="EB Garamond" font-size="${size}" letter-spacing="-2">${lines.map((line,i)=>`<text x="57" y="${(episode ? 190+size*.75 : 270)+i*size*.96}" fill="${i===lines.length-1&&lines.length>1?(mountain?'#e5aa80':'#ed3238'):'#eee8dd'}">${e(line)}</text>`).join('')}</g><text x="60" y="${episode ? 535 : Math.max(450,285+lines.length*size*.96)}" font-family="EB Garamond" font-size="27" fill="#c5c4b9">${e(subtitle)}</text><path d="M60 567 H700" stroke="#536057"/><text x="${episode ? 1140 : 60}" y="600" text-anchor="${episode ? 'end' : 'start'}" font-family="DM Mono" font-size="14" letter-spacing="2" fill="#a7a29a">${e(footer)}</text></g>`);
  const png = new Resvg(card,{font}).render().asPng();
  const hash = createHash('sha256').update(png).digest('hex').slice(0,12);
  const filename = `${path === '/' ? 'home' : path.slice(1,-1).replaceAll('/','-')}-${hash}.png`;
  mkdirSync('public/social', {recursive:true});
  writeFileSync(`public/social/${filename}`,png);
  const imageUrl = `${socialImageOrigin}/social/${filename}`;
  const alt = `${title} — Sovereign Engineering. ${cardTitle}`;
  return `<link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="canonical" href="${site}${path}">
  <meta property="og:site_name" content="Sovereign Engineering">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${site}${path}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${e(alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(title)}">
  <meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${e(alt)}">`;
}
export function homeSocialPreview() {
  return socialPreview('Sovereign Engineering','Six weeks in Madeira. Think together through dialogue, and build tools people can run themselves.','/');
}
