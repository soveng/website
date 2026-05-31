import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import type { APIRoute, GetStaticPaths } from 'astro';
import * as opentype from 'opentype.js';
import sharp from 'sharp';

import { getEpisodes, type Episode } from '@/lib/podcast';

const WIDTH = 1200;
const HEIGHT = 630;
const COVER_SIZE = 420;
const COVER_X = 64;
const COVER_Y = 105;

const TEXT_X = 548;
const TEXT_RIGHT = 1120;
const TEXT_W = TEXT_RIGHT - TEXT_X;
const CENTER_Y = 300;

const ACCENT = '#ED3238';
const SPINE_X = 512;

const KICKER = { size: 16, tracking: 3, lineHeight: 28, color: ACCENT, label: 'NO SOLUTIONS PODCAST' };
const TITLE = { size: 50, lineHeight: 60, maxLines: 3, color: '#FFFFFF' };
const META = { size: 21, lineHeight: 30, color: '#9A9A9A' };
const QUOTE = { size: 26, lineHeight: 36, maxLines: 2, color: '#DCDCDC' };
const FOOTER = { size: 20, color: '#6F6F6F', y: 566 };

const GAP_KICKER_TITLE = 18;
const GAP_TITLE_META = 30;
const GAP_META_QUOTE = 18;

const require = createRequire(import.meta.url);

function loadFont(spec: string): opentype.Font {
  const buffer = readFileSync(require.resolve(spec));
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

const fontDisplay = loadFont('@fontsource/inter/files/inter-latin-700-normal.woff');
const fontBody = loadFont('@fontsource/inter/files/inter-latin-400-normal.woff');
const fontItalic = loadFont('@fontsource/inter/files/inter-latin-400-italic.woff');

function width(font: opentype.Font, text: string, size: number): number {
  return font.getAdvanceWidth(text, size);
}

function pathData(font: opentype.Font, text: string, x: number, y: number, size: number): string {
  return font.getPath(text, x, y, size).toPathData(2);
}

function clampWithEllipsis(font: opentype.Font, text: string, size: number, maxWidth: number): string {
  let out = text;
  while (out.length && width(font, `${out}…`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out.replace(/[\s.,;:]+$/, '')}…`;
}

function wrapText(font: opentype.Font, text: string, size: number, maxWidth: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && width(font, candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) {
    lines.push(current);
  }

  const overflow = lines.length > maxLines;
  const visible = lines.slice(0, maxLines);
  const lastIndex = visible.length - 1;

  return visible.map((line, index) => {
    const tooWide = width(font, line, size) > maxWidth;
    if (tooWide || (index === lastIndex && overflow)) {
      return clampWithEllipsis(font, line, size, maxWidth);
    }
    return line;
  });
}

function trackedKicker(font: opentype.Font, text: string, x: number, y: number, size: number, tracking: number): string {
  const parts: string[] = [];
  let cursor = x;

  for (const char of text) {
    if (char !== ' ') {
      parts.push(pathData(font, char, cursor, y, size));
    }
    cursor += width(font, char, size) + tracking;
  }

  return parts.join(' ');
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
  const titleLines = wrapText(fontDisplay, episode.title, TITLE.size, TEXT_W, TITLE.maxLines);

  const guestLine = episode.guestName ? `with ${episode.guestName}` : 'A walking dialogue';
  const metaRaw = episode.pubDate ? `${guestLine}  ·  ${episode.pubDate}` : guestLine;
  const metaLine = width(fontBody, metaRaw, META.size) > TEXT_W ? clampWithEllipsis(fontBody, metaRaw, META.size, TEXT_W) : metaRaw;

  const quoteLines = wrapText(fontItalic, episode.subtitle || 'No solutions, only trade-offs.', QUOTE.size, TEXT_W, QUOTE.maxLines);

  const total =
    KICKER.lineHeight +
    GAP_KICKER_TITLE +
    titleLines.length * TITLE.lineHeight +
    GAP_TITLE_META +
    META.lineHeight +
    GAP_META_QUOTE +
    quoteLines.length * QUOTE.lineHeight;

  const startTop = CENTER_Y - total / 2;
  let cursor = startTop;
  const paths: string[] = [];

  const kickerY = cursor + KICKER.size * 0.8;
  paths.push(`<path d="${trackedKicker(fontDisplay, KICKER.label, TEXT_X, kickerY, KICKER.size, KICKER.tracking)}" fill="${KICKER.color}" />`);
  cursor += KICKER.lineHeight + GAP_KICKER_TITLE;

  for (const line of titleLines) {
    const baseline = cursor + TITLE.size * 0.72;
    paths.push(`<path d="${pathData(fontDisplay, line, TEXT_X, baseline, TITLE.size)}" fill="${TITLE.color}" />`);
    cursor += TITLE.lineHeight;
  }
  cursor += GAP_TITLE_META;

  const metaY = cursor + META.size * 0.78;
  paths.push(`<path d="${pathData(fontBody, metaLine, TEXT_X, metaY, META.size)}" fill="${META.color}" />`);
  cursor += META.lineHeight + GAP_META_QUOTE;

  for (const line of quoteLines) {
    const baseline = cursor + QUOTE.size * 0.74;
    paths.push(`<path d="${pathData(fontItalic, line, TEXT_X, baseline, QUOTE.size)}" fill="${QUOTE.color}" />`);
    cursor += QUOTE.lineHeight;
  }

  const spineTop = kickerY - KICKER.size * 0.72;
  const spineHeight = cursor - QUOTE.lineHeight + QUOTE.size - spineTop;
  const spine = `<rect x="${SPINE_X}" y="${spineTop.toFixed(1)}" width="4" height="${spineHeight.toFixed(1)}" rx="2" fill="${ACCENT}" />`;

  const footerPath = `<path d="${pathData(fontBody, 'sovereignengineering.io/podcast', TEXT_X, FOOTER.y, FOOTER.size)}" fill="${FOOTER.color}" />`;

  let fallbackMarkup = '';
  if (!hasCover) {
    const cx = COVER_X + COVER_SIZE / 2;
    const noWidth = width(fontDisplay, 'NO', 64);
    const solWidth = width(fontDisplay, 'SOLUTIONS', 40);
    fallbackMarkup = `
      <rect x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="18" fill="#101010" />
      <path d="${pathData(fontDisplay, 'NO', cx - noWidth / 2, COVER_Y + COVER_SIZE / 2 - 6, 64)}" fill="${ACCENT}" />
      <path d="${pathData(fontDisplay, 'SOLUTIONS', cx - solWidth / 2, COVER_Y + COVER_SIZE / 2 + 44, 40)}" fill="#FFFFFF" />`;
  }

  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${fallbackMarkup}
    ${spine}
    ${paths.join('\n    ')}
    ${footerPath}
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
  const body = new Uint8Array(png);

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
