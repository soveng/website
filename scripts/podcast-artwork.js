import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { imageSize } from 'image-size';

export const artworkWidths = [160, 360, 720, 1080];
export const artworkKey = url => createHash('sha256').update(url).digest('hex').slice(0, 16);
export function artworkSource(url) {
  const base = `public/images/dialogue-covers/${artworkKey(url)}`;
  return ['jpg', 'png'].map(ext => `${base}.${ext}`).find(existsSync);
}
export function responsiveArtwork(url, sizes) {
  const key = artworkKey(url);
  const { width, height } = imageSize(readFileSync(artworkSource(url)));
  const path = size => `/images/dialogue-responsive/${key}-${size}.webp`;
  return `src="${path(360)}" srcset="${artworkWidths.map(size => `${path(size)} ${size}w`).join(', ')}" sizes="${sizes}" width="${width}" height="${height}"`;
}
