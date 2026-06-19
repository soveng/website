#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const data = JSON.parse(readFileSync('src/data/sovengAlumni.json', 'utf8'));
const cache = JSON.parse(readFileSync('src/data/sovengAlumniAvatarCache.json', 'utf8'));

function cleanText(value) {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function safeImageUrl(value) {
  const imageHref = cleanText(value);
  if (!imageHref) return undefined;

  try {
    const url = new URL(imageHref);
    if (url.protocol !== 'https:') return undefined;
    if (url.username || url.password) return undefined;
    if (!url.hostname) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

const profilesWithRemoteAvatars = data.filter((profile) => safeImageUrl(profile.picture));
const avatars = cache.avatars ?? {};
const failed = cache.failed ?? {};

assert.equal(
  Object.keys(avatars).length + Object.keys(failed).length,
  profilesWithRemoteAvatars.length,
  'avatar cache manifest should cover every safe source image as cached or failed',
);

for (const profile of profilesWithRemoteAvatars) {
  const source = safeImageUrl(profile.picture);
  const entry = avatars[profile.npub];
  if (!entry) {
    assert.equal(failed[profile.npub]?.source, source, `missing cache or failure entry for ${profile.npub}`);
    continue;
  }

  assert.equal(entry.source, source, `stale cache source for ${profile.npub}`);
  assert.match(entry.src, /^\/images\/alumni\/avatars\/npub1.+\.webp$/, `unexpected local avatar path for ${profile.npub}`);
  assert.equal(entry.width, 128, `unexpected avatar width for ${profile.npub}`);
  assert.equal(entry.height, 128, `unexpected avatar height for ${profile.npub}`);

  const publicPath = `public${entry.src}`;
  assert.equal(existsSync(publicPath), true, `missing avatar file ${publicPath}`);
  assert.ok(statSync(publicPath).size > 0, `empty avatar file ${publicPath}`);
  assert.equal(readFileSync(publicPath, { encoding: 'utf8', flag: 'r' }).slice(0, 4), 'RIFF', `avatar should be WebP RIFF ${publicPath}`);
}

if (existsSync('dist/alumni/index.html')) {
  const html = readFileSync('dist/alumni/index.html', 'utf8');
  const avatarSrcs = [...html.matchAll(/<img class="alumni-avatar-image" src="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(avatarSrcs.length, Object.keys(avatars).length, 'built page should render cached avatar image count');
  assert.ok(avatarSrcs.every((src) => src.startsWith('/images/alumni/avatars/')), 'built page avatar srcs should all be local');
  assert.ok(avatarSrcs.every((src) => src.endsWith('.webp')), 'built page avatar srcs should all be WebP');
  assert.equal(avatarSrcs.some((src) => /^https?:\/\//.test(src)), false, 'built page should not render remote avatar image URLs');
}

console.log(`OK: ${Object.keys(avatars).length} alumni avatars cached as local WebP assets; ${Object.keys(failed).length} broken upstream avatar(s) use initials`);
