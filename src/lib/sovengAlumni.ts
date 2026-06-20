import sovEngAlumniData from '@/data/sovengAlumni.js';
import sovEngAlumniAvatarCacheData from '@/data/sovengAlumniAvatarCache.js';

export type Npub = `npub1${string}`;

export interface NostrKind0Event {
  id: string;
  pubkey: string;
  created_at: number;
  kind: 0;
  tags: string[][];
  content: string;
  sig: string;
}

export interface SovEngAlumniSource {
  membershipSourceUrl: string;
  relayUrls: string[];
  fetchedAt: string;
}

export interface SovEngAlumniProfile {
  pubkey: string;
  npub: Npub;
  name?: string;
  displayName?: string;
  about?: string;
  nip05?: string;
  picture?: string;
  kind0: NostrKind0Event;
  source: SovEngAlumniSource;
}

export interface SovEngAlumniStats {
  total: number;
  withAbout: number;
  withPicture: number;
  withNip05: number;
  sourceRelays: string[];
  lastFetchedAt: string;
  newestKind0CreatedAt: number;
}

export interface AlumniProfileViewModel {
  pubkey: string;
  npub: Npub;
  displayName: string;
  handle: string;
  about?: string;
  picture?: string;
  initials: string;
  profileHref: string;
  nostrUri: string;
  sourceHref: string;
}

interface AlumniAvatarCacheEntry {
  src?: string;
  source?: string;
  width?: number;
  height?: number;
  bytes?: number;
  sha256?: string;
}

interface AlumniAvatarCacheData {
  avatars?: Record<string, AlumniAvatarCacheEntry>;
}

const STATIC_AVATAR_PREFIX = '/images/alumni/avatars/';

const alumniAvatarCache = sovEngAlumniAvatarCacheData as AlumniAvatarCacheData;

const rawSovEngAlumni = sovEngAlumniData as unknown as SovEngAlumniProfile[];

const FAMILIAR_FACE_NPUBS = [
  'npub1hw6amg8p24ne08c9gdq8hhpqx0t0pwanpae9z25crn7m9uy7yarse465gr',
  'npub12rv5lskctqxxs2c8rf2zlzc7xx3qpvzs3w4etgemauy9thegr43sf485vg',
  'npub1mhcr4j594hsrnen594d7700n2t03n8gdx83zhxzculk6sh9nhwlq7uc226',
  'npub1wf4pufsucer5va8g9p0rj5dnhvfeh6d8w0g6eayaep5dhps6rsgs43dgh9',
  'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc',
  'npub1ye5ptcxfyyxl5vjvdjar2ua3f0hynkjzpx552mu5snj3qmx5pzjscpknpr',
  'npub19wavu4f7l6l43h24jyskn7fvzy37kcfp67aqjtmv2qgy4lp34nhsda8p6k',
  'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft',
  'npub1uac67zc9er54ln0kl6e4qp2y6ta3enfcg7ywnayshvlw9r5w6ehsqq99rx',
  'npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk',
  'npub1equrmqway3qxw3dkssymusxkwgwrqypfgeqx0lx9pgjam7gnj4ysaqhkj6',
  'npub1u8lnhlw5usp3t9vmpz60ejpyt649z33hu82wc2hpv6m5xdqmuxhs46turz',
] as const satisfies readonly Npub[];

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanAbout(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const cleaned = value.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function shortNpub(npub: string): string {
  return `${npub.slice(0, 10)}…${npub.slice(-6)}`;
}

function newestIsoDate(values: string[]): string {
  const newest = values
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => right - left)[0];

  return newest === undefined ? '' : new Date(newest).toISOString();
}

function getInitials(displayName: string, npub: string): string {
  const parts = displayName
    .replace(/[^\p{L}\p{N}\s._-]/gu, ' ')
    .split(/[\s._-]+/)
    .filter(Boolean);

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || npub.slice(5, 7).toUpperCase();
}

export const allSovEngAlumni = [...rawSovEngAlumni].sort(
  (left, right) =>
    getSovEngAlumniDisplayName(left).localeCompare(getSovEngAlumniDisplayName(right), undefined, { sensitivity: 'base' }) || left.npub.localeCompare(right.npub)
);

const alumniByNpub = new Map(allSovEngAlumni.map((profile) => [profile.npub, profile]));
const familiarFaceNpubs = new Set<Npub>(FAMILIAR_FACE_NPUBS);

export function getSovEngAlumni(): SovEngAlumniProfile[] {
  return [...allSovEngAlumni];
}

export function getSovEngAlumniDirectory(): SovEngAlumniProfile[] {
  // Opening sample for visitor orientation, not rank. UI remains one unlabeled grid.
  const familiarFaces = FAMILIAR_FACE_NPUBS.map((npub) => alumniByNpub.get(npub)).filter((profile): profile is SovEngAlumniProfile => Boolean(profile));
  const remainingAlumni = allSovEngAlumni.filter((profile) => !familiarFaceNpubs.has(profile.npub));
  return [...familiarFaces, ...remainingAlumni];
}

export function getSovEngAlumniByNpub(npub: string): SovEngAlumniProfile | undefined {
  return alumniByNpub.get(npub as Npub);
}

export function getSovEngAlumniDisplayName(profile: Pick<SovEngAlumniProfile, 'displayName' | 'name' | 'npub'>): string {
  return cleanText(profile.displayName) || cleanText(profile.name) || profile.npub;
}

export function getSafeProfileImageHref(value: unknown): string | undefined {
  const imageHref = cleanText(value);
  if (!imageHref) {
    return undefined;
  }

  try {
    const url = new URL(imageHref);
    if (url.protocol !== 'https:') {
      return undefined;
    }
    if (url.username || url.password) {
      return undefined;
    }
    if (!url.hostname) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

function getCachedProfileImageHref(npub: string, sourcePicture: unknown): string | undefined {
  const source = getSafeProfileImageHref(sourcePicture);
  if (!source) {
    return undefined;
  }

  const cached = alumniAvatarCache.avatars?.[npub];
  if (!cached || cached.source !== source) {
    return undefined;
  }

  const src = cleanText(cached.src);
  if (!src) {
    return undefined;
  }
  if (!src.startsWith(STATIC_AVATAR_PREFIX) || !src.endsWith('.webp')) {
    return undefined;
  }

  return src;
}

export function getSafeExternalHref(value: unknown): string | undefined {
  const href = cleanText(value);
  if (!href) {
    return undefined;
  }

  try {
    const url = new URL(href);
    if (url.protocol !== 'https:') {
      return undefined;
    }
    if (url.username || url.password) {
      return undefined;
    }
    if (!url.hostname) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export function getNostrProfileHref(npub: string): string {
  return `https://njump.me/${encodeURIComponent(npub)}`;
}

export function getAlumniProfileViewModel(profile: SovEngAlumniProfile): AlumniProfileViewModel {
  const displayName = getSovEngAlumniDisplayName(profile);
  const handle =
    cleanText(profile.nip05) ||
    (cleanText(profile.name) && cleanText(profile.name) !== displayName ? cleanText(profile.name) : undefined) ||
    shortNpub(profile.npub);

  return {
    pubkey: profile.pubkey,
    npub: profile.npub,
    displayName,
    handle,
    about: cleanAbout(profile.about),
    picture: getCachedProfileImageHref(profile.npub, profile.picture),
    initials: getInitials(displayName, profile.npub),
    profileHref: getNostrProfileHref(profile.npub),
    nostrUri: `nostr:${profile.npub}`,
    sourceHref: getSafeExternalHref(profile.source.membershipSourceUrl) ?? '',
  };
}

export function getSovEngAlumniStats(): SovEngAlumniStats {
  const sourceRelays = [...new Set(allSovEngAlumni.flatMap((profile) => profile.source.relayUrls))].sort();
  const newestKind0CreatedAt = Math.max(...allSovEngAlumni.map((profile) => profile.kind0.created_at));

  return {
    total: allSovEngAlumni.length,
    withAbout: allSovEngAlumni.filter((profile) => cleanAbout(profile.about)).length,
    withPicture: allSovEngAlumni.filter((profile) => getCachedProfileImageHref(profile.npub, profile.picture)).length,
    withNip05: allSovEngAlumni.filter((profile) => cleanText(profile.nip05)).length,
    sourceRelays,
    lastFetchedAt: newestIsoDate(allSovEngAlumni.map((profile) => profile.source.fetchedAt)),
    newestKind0CreatedAt,
  };
}

export function hasSourceLockedAssociationData(): boolean {
  // Deliberately false until SEC/project/tag mappings are backed by an approved canonical source.
  return false;
}
