import sharp from 'sharp';
import { artworkKey, artworkWidths, artworkSource } from './podcast-artwork.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

// Keep source artwork local so social rendering never depends on remote images.
const directory = 'public/images/dialogue-covers';
mkdirSync(directory, { recursive: true });
const feed = new XMLParser({ ignoreAttributes: false }).parse(readFileSync('public/dialogues.xml', 'utf8'));
for (const episode of feed.rss.channel.item) {
  const url = episode['itunes:image']['@_href'];
  const key = artworkKey(url);
  const file = `${directory}/${key}`;
  if (["jpg", "png"].some(ext => existsSync(`${file}.${ext}`))) continue;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Artwork download failed: ${episode.title} (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const ext = bytes[0] === 0xff && bytes[1] === 0xd8 ? "jpg" : bytes.subarray(0,8).toString("hex") === "89504e470d0a1a0a" ? "png" : null;
  if (!ext) throw new Error(`Unsupported artwork format: ${episode.title}`);
  writeFileSync(`${file}.${ext}`, bytes);
}
console.log(`Episode artwork synced for ${feed.rss.channel.item.length} dialogues.`);

// Derived display images are generated from the cached originals; feeds and social art stay unchanged.
const responsiveDirectory = 'public/images/dialogue-responsive';
mkdirSync(responsiveDirectory, { recursive: true });
for (const episode of feed.rss.channel.item) {
  const url = episode['itunes:image']['@_href'];
  for (const width of artworkWidths) {
    const output = `${responsiveDirectory}/${artworkKey(url)}-${width}.webp`;
    if (!existsSync(output)) await sharp(artworkSource(url)).rotate().resize({ width }).webp({ quality: 82 }).toFile(output);
  }
}
