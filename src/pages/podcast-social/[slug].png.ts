import type { APIRoute, GetStaticPaths } from "astro";
import sharp from "sharp";
import { getEpisodes, type Episode } from "@/lib/podcast";

const WIDTH = 1200;
const HEIGHT = 630;
const COVER_SIZE = 420;
const COVER_X = 64;
const COVER_Y = 105;
const TEXT_X = 548;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, maxChars));
      current = word.slice(maxChars);
    }

    if (lines.length === maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  const remainingWords = words.join(" ");
  const flattened = lines.join(" ");
  if (flattened.length < remainingWords.length && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].replace(/[.…]+$/, "")}…`;
  }

  return lines;
}

async function loadCoverBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    return await sharp(Buffer.from(arrayBuffer))
      .resize(COVER_SIZE, COVER_SIZE, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

function buildOverlaySvg(episode: Episode): Buffer {
  const titleLines = wrapText(episode.title, 26, 3);
  const titleTspans = titleLines
    .map((line, index) => `<tspan x="${TEXT_X}" dy="${index === 0 ? 0 : 68}">${escapeXml(line)}</tspan>`)
    .join("");

  const guestLine = episode.guestName ? `with ${episode.guestName}` : "Walking dialogue";
  const metaLine = `${guestLine}  •  ${episode.pubDate || "No Solutions"}`;
  const subtitleLines = wrapText(episode.subtitle || "No solutions, only trade-offs.", 40, 2);
  const subtitleTspans = subtitleLines
    .map((line, index) => `<tspan x="${TEXT_X}" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`)
    .join("");

  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#050505" />
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
    <rect x="36" y="36" width="1128" height="558" rx="28" fill="none" stroke="#2B2B2B" stroke-width="2" />
    <rect x="${COVER_X - 6}" y="${COVER_Y - 6}" width="${COVER_SIZE + 12}" height="${COVER_SIZE + 12}" rx="18" fill="#111111" stroke="#343434" stroke-width="2" />
    <rect x="${TEXT_X}" y="102" width="240" height="34" rx="17" fill="#F7931A" />
    <text x="${TEXT_X + 20}" y="125" fill="#050505" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="0.08em">NO SOLUTIONS PODCAST</text>
    <text x="${TEXT_X}" y="205" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700">${titleTspans}</text>
    <text x="${TEXT_X}" y="445" fill="#B5B5B5" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">${escapeXml(metaLine)}</text>
    <text x="${TEXT_X}" y="500" fill="#E6E6E6" font-family="Arial, Helvetica, sans-serif" font-size="28">${subtitleTspans}</text>
    <text x="${TEXT_X}" y="566" fill="#8E8E8E" font-family="Arial, Helvetica, sans-serif" font-size="22">sovereignengineering.io/podcast</text>
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0B0B0B" />
        <stop offset="1" stop-color="#161616" />
      </linearGradient>
    </defs>
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
  const overlaySvg = buildOverlaySvg(episode);

  const image = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: "#050505",
    },
  }).composite([
    ...(coverBuffer
      ? [{ input: coverBuffer, left: COVER_X, top: COVER_Y }]
      : []),
    { input: overlaySvg, left: 0, top: 0 },
  ]);

  const png = await image.png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
