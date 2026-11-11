import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { imageSize } from 'image-size';
import { artworkKey, artworkWidths, artworkSource } from './podcast-artwork.js';

const episodes = new XMLParser({ ignoreAttributes: false }).parse(readFileSync('public/dialogues.xml', 'utf8')).rss.channel.item;
const archive = readFileSync('dist/podcast/index.html', 'utf8');
for (const episode of episodes) {
  const url = episode['itunes:image']['@_href'];
  const key = artworkKey(url);
  const original = imageSize(readFileSync(artworkSource(url)));
  assert(archive.includes(`/images/dialogue-responsive/${key}-360.webp`), `Missing cover: ${episode.title}`);
  for (const width of artworkWidths) {
    const file = `dist/images/dialogue-responsive/${key}-${width}.webp`;
    const actual = imageSize(readFileSync(file));
    assert.equal(actual.type, 'webp', file);
    assert.equal(actual.width, width, file);
    assert(Math.abs(actual.height - original.height * width / original.width) <= 1, `Distorted aspect ratio: ${file}`);
  }
}
console.log(`Verified responsive cover files, widths, and aspect ratios for ${episodes.length} episodes.`);
