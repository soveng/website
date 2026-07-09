#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url);
const DATA_PATH = new URL('src/data/sovengAlumni.json', `${ROOT}/`);
const MANIFEST_PATH = new URL('src/data/sovengAlumniAvatarCache.json', `${ROOT}/`);
const OUTPUT_DIR = new URL('public/images/alumni/avatars/', `${ROOT}/`);
const PUBLIC_PREFIX = '/images/alumni/avatars/';
const AVATAR_SIZE = 128;
const CONCURRENCY = 6;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 20_000;
const USER_AGENT = 'SovereignEngineering.io alumni avatar cache (+https://sovereignengineering.io/alumni)';
const STRICT = process.argv.includes('--strict');

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

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function avatarFileName(profile) {
  return `${profile.npub}.webp`;
}

async function fetchAvatar(source) {
  const response = await fetch(source, {
    headers: { accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8', 'user-agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_IMAGE_BYTES) throw new Error(`too large: ${contentLength} bytes`);

  const input = Buffer.from(await response.arrayBuffer());
  if (input.length > MAX_IMAGE_BYTES) throw new Error(`too large: ${input.length} bytes`);
  return input;
}

async function renderAvatar(input) {
  return await sharp(input, { animated: false, failOn: 'none', limitInputPixels: 16_000_000 })
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
    .webp({ effort: 4, quality: 78 })
    .toBuffer();
}

async function processProfile(profile) {
  const source = safeImageUrl(profile.picture);
  if (!source) return { status: 'skipped', profile };

  const input = await fetchAvatar(source);
  const output = await renderAvatar(input);
  const filename = avatarFileName(profile);
  await writeFile(new URL(filename, OUTPUT_DIR), output);

  return {
    status: 'cached',
    profile,
    entry: {
      src: `${PUBLIC_PREFIX}${filename}`,
      source,
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      bytes: output.length,
      sha256: sha256(output),
    },
  };
}

async function mapConcurrent(items, mapper, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        results[index] = { status: 'failed', profile: items[index], error };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function removeStaleFiles(keep) {
  const files = await readdir(OUTPUT_DIR).catch(() => []);
  await Promise.all(
    files
      .filter((file) => file.endsWith('.webp') && !keep.has(file))
      .map((file) => unlink(join(OUTPUT_DIR.pathname, file))),
  );
}

const profiles = JSON.parse(await readFile(DATA_PATH, 'utf8'));
const profilesWithPictures = profiles.filter((profile) => safeImageUrl(profile.picture));

await mkdir(OUTPUT_DIR, { recursive: true });
const results = await mapConcurrent(profilesWithPictures, processProfile, CONCURRENCY);
const failures = results.filter((result) => result.status === 'failed');

for (const failure of failures) {
  console.warn(`${failure.profile.npub}: ${failure.error?.message || failure.error}`);
}

if (STRICT && failures.length > 0) {
  throw new Error(`Failed to cache ${failures.length} alumni avatar(s)`);
}

const avatars = Object.fromEntries(
  results
    .filter((result) => result.status === 'cached')
    .map((result) => [result.profile.npub, result.entry])
    .sort(([left], [right]) => left.localeCompare(right)),
);
const failed = Object.fromEntries(
  failures
    .map((failure) => [
      failure.profile.npub,
      {
        source: safeImageUrl(failure.profile.picture),
        error: failure.error?.message || String(failure.error),
      },
    ])
    .sort(([left], [right]) => left.localeCompare(right)),
);

await removeStaleFiles(new Set(Object.values(avatars).map((entry) => entry.src.replace(PUBLIC_PREFIX, ''))));
await writeFile(
  MANIFEST_PATH,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      format: 'webp',
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      avatars,
      failed,
    },
    null,
    2,
  )}\n`,
);

console.log(`Cached ${Object.keys(avatars).length}/${profilesWithPictures.length} alumni avatars to ${OUTPUT_DIR.pathname}`);
if (failures.length > 0) console.log(`Skipped ${failures.length} broken upstream avatar(s); page will show initials for them.`);
