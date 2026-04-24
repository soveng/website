import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';

import { getEpisodes, type Episode } from '@/lib/podcast';

const WIDTH = 1200;
const HEIGHT = 630;
const COVER_SIZE = 420;
const COVER_X = 64;
const COVER_Y = 105;
const TEXT_X = 548;
const TITLE_MAX_UNITS = 16;
const SUBTITLE_MAX_UNITS = 30;

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function estimateUnits(text: string): number {
  let total = 0;

  for (const char of text) {
    if (char === ' ') {
      total += 0.35;
    } else if (/[WMQG@#%&]/.test(char)) {
      total += 1.15;
    } else if (/[A-Z0-9]/.test(char)) {
      total += 0.92;
    } else if (/[mw]/.test(char)) {
      total += 0.95;
    } else if (/[iltfjr]/.test(char)) {
      total += 0.45;
    } else if (/[-–—:;,.!"'()/]/.test(char)) {
      total += 0.4;
    } else {
      total += 0.75;
    }
  }

  return total;
}

function truncateToUnits(text: string, maxUnits: number): string {
  let out = '';

  for (const char of text) {
    const next = `${out}${char}`;
    if (estimateUnits(`${next}…`) > maxUnits) {
      break;
    }
    out = next;
  }

  return `${out.trimEnd().replace(/[.…]+$/, '')}…`;
}

function wrapText(text: string, maxUnits: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  let consumedAllWords = true;

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;

    if (estimateUnits(candidate) <= maxUnits) {
      current = candidate;
      continue;
    }

    if (!current) {
      lines.push(truncateToUnits(word, maxUnits));
    } else {
      lines.push(current);
      current = word;
    }

    if (lines.length === maxLines) {
      consumedAllWords = false;
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (!consumedAllWords && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = truncateToUnits(lines[lastIndex], maxUnits);
  }

  return lines.slice(0, maxLines);
}

async function loadCoverBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const roundedCorners = Buffer.from(`
      <svg width="${COVER_SIZE}" height="${COVER_SIZE}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${COVER_SIZE}" height="${COVER_SIZE}" rx="18" ry="18" fill="#fff" />
      </svg>`);

    return await sharp(Buffer.from(arrayBuffer))
      .resize(COVER_SIZE, COVER_SIZE, { fit: 'cover', position: 'centre' })
      .composite([{ input: roundedCorners, blend: 'dest-in' }])
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

function buildBackgroundSvg(): Buffer {
  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#050505" />
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
    <rect x="36" y="36" width="1128" height="558" rx="28" fill="none" stroke="#2B2B2B" stroke-width="2" />
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0B0B0B" />
        <stop offset="1" stop-color="#161616" />
      </linearGradient>
    </defs>
  </svg>`;

  return Buffer.from(svg);
}

function buildForegroundSvg(episode: Episode, hasCover: boolean): Buffer {
  const titleLines = wrapText(episode.title, TITLE_MAX_UNITS, 3);
  const titleTspans = titleLines.map((line, index) => `<tspan x="${TEXT_X}" dy="${index === 0 ? 0 : 58}">${escapeXml(line)}</tspan>`).join('');

  const heightLine = episode.blockHeight ? `${episode.blockHeight}` : '';
  const metaLine = [heightLine, episode.pubDate].filter(Boolean).join(' • ') || 'No Solutions';
  const subtitleLines = wrapText(episode.subtitle || 'No solutions, only trade-offs.', SUBTITLE_MAX_UNITS, 6);
  const subtitleTspans = subtitleLines.map((line, index) => `<tspan x="${TEXT_X}" dy="${index === 0 ? 0 : 28}">${escapeXml(line)}</tspan>`).join('');

  const TITLE_Y = 203;
  const titleBottom = TITLE_Y + (titleLines.length - 1) * 58;
  const metaY = titleBottom + 50;
  const subtitleY = metaY + 45;

  const fallbackMarkup = hasCover
    ? ''
    : `<rect x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="18" fill="#121212" />
       <text x="${COVER_X + COVER_SIZE / 2}" y="${COVER_Y + COVER_SIZE / 2 - 10}" text-anchor="middle" fill="#F7931A" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">NO</text>
       <text x="${COVER_X + COVER_SIZE / 2}" y="${COVER_Y + COVER_SIZE / 2 + 28}" text-anchor="middle" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">SOLUTIONS</text>`;

  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="${COVER_X - 6}" y="${COVER_Y - 6}" width="${COVER_SIZE + 12}" height="${COVER_SIZE + 12}" rx="24" fill="none" stroke="#343434" stroke-width="2" />
    ${fallbackMarkup}
    <text x="${TEXT_X}" y="125" fill="#F7931A" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="0.06em">NO SOLUTIONS.</text>
    <text x="${TEXT_X + 208}" y="125" fill="#8E8E8E" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="400" letter-spacing="0.06em">ONLY DIALOGUES.</text>
    <text x="${TEXT_X}" y="${TITLE_Y}" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="700">${titleTspans}</text>
    <text x="${TEXT_X}" y="${metaY}" fill="#B5B5B5" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="600">${escapeXml(metaLine)}</text>
    <text x="${TEXT_X}" y="${subtitleY}" fill="#E6E6E6" font-family="Arial, Helvetica, sans-serif" font-size="27">${subtitleTspans}</text>
    <text x="${TEXT_X}" y="575" fill="#8E8E8E" font-family="Arial, Helvetica, sans-serif" font-size="22">sovereignengineering.io/podcast</text>
  </svg>`;

  return Buffer.from(svg);
}

export const prerender = true;

export const getStaticPaths = (async () => {
  const episodes = await getEpisodes();
  return episodes.map((episode) => ({
    params: { slug: episode.slug },
    props: { episode },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { episode } = props as { episode: Episode };
  const coverBuffer = await loadCoverBuffer(episode.imageUrl);
  const backgroundSvg = buildBackgroundSvg();
  const foregroundSvg = buildForegroundSvg(episode, Boolean(coverBuffer));

  const image = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: '#050505',
    },
  }).composite([
    { input: backgroundSvg, left: 0, top: 0 },
    ...(coverBuffer ? [{ input: coverBuffer, left: COVER_X, top: COVER_Y }] : []),
    { input: foregroundSvg, left: 0, top: 0 },
  ]);

  const png = await image.png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
