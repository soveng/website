import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Generated before Astro builds. A clean checkout can render initials until
// avatars have been fetched, without tracking image binaries in Git.
let sovEngAlumniAvatarCache = { avatars: {} };
try {
  sovEngAlumniAvatarCache = JSON.parse(readFileSync(resolve('src/data/sovengAlumniAvatarCache.json'), 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

export default sovEngAlumniAvatarCache;
