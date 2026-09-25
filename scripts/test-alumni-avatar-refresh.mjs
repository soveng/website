import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = await mkdtemp(join(tmpdir(), 'alumni-avatars-'));
const realFetch = globalThis.fetch;
try {
  for (const directory of ['scripts', 'src/data', 'public/images/alumni/avatars']) await mkdir(join(root, directory), { recursive: true });
  await symlink(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
  await copyFile('scripts/cache-alumni-avatars.mjs', join(root, 'scripts/cache-alumni-avatars.mjs'));
  const profiles = [{ npub: 'npub1fresh', picture: 'https://example.com/fresh' }, { npub: 'npub1cached', picture: 'https://example.com/unavailable' }];
  await writeFile(join(root, 'src/data/sovengAlumni.json'), JSON.stringify(profiles));
  const oldImage = await sharp({ create: { width: 128, height: 128, channels: 3, background: 'red' } }).webp().toBuffer();
  const cached = { src: '/images/alumni/avatars/npub1cached.webp', source: profiles[1].picture, width: 128, height: 128, bytes: oldImage.length };
  await writeFile(join(root, 'src/data/sovengAlumniAvatarCache.json'), JSON.stringify({ avatars: { npub1cached: cached } }));
  await writeFile(join(root, `public${cached.src}`), oldImage);
  const largeImage = await sharp({ create: { width: 1200, height: 1800, channels: 3, background: 'blue' } }).png().toBuffer();
  globalThis.fetch = async (url) => {
    if (url === profiles[1].picture) throw new Error('Simulated upstream outage');
    return new Response(largeImage);
  };
  await import(pathToFileURL(join(root, 'scripts/cache-alumni-avatars.mjs')).href);
  const cache = JSON.parse(await readFile(join(root, 'src/data/sovengAlumniAvatarCache.json'), 'utf8'));
  assert.deepEqual(cache.avatars.npub1cached, cached);
  assert.deepEqual(await readFile(join(root, `public${cached.src}`)), oldImage);
  const metadata = await sharp(join(root, 'public/images/alumni/avatars/npub1fresh.webp')).metadata();
  assert.equal(metadata.width, 128);
  assert.equal(metadata.height, 128);
  assert.equal(metadata.format, 'webp');
  assert.deepEqual(cache.failed, {});
  console.log('PASS: large portrait cropped to square WebP; cached avatar survives upstream outage.');
} finally {
  globalThis.fetch = realFetch;
  await rm(root, { recursive: true, force: true });
}
