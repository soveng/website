import sovEngAlumniData from '@/data/sovengAlumni.js';

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
  qrImageHref: string;
  updatedAt: string;
  updatedLabel: string;
  sourceHref: string;
}

const rawSovEngAlumni = sovEngAlumniData as unknown as SovEngAlumniProfile[];

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanAbout(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
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

function formatKind0Date(createdAt: number): string {
  if (!Number.isFinite(createdAt) || createdAt <= 0) return 'unknown';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(createdAt * 1000));
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

export function getSovEngAlumni(): SovEngAlumniProfile[] {
  return [...allSovEngAlumni];
}

export function getSovEngAlumniByNpub(npub: string): SovEngAlumniProfile | undefined {
  return alumniByNpub.get(npub as Npub);
}

export function getSovEngAlumniDisplayName(profile: Pick<SovEngAlumniProfile, 'displayName' | 'name' | 'npub'>): string {
  return cleanText(profile.displayName) || cleanText(profile.name) || profile.npub;
}

export function getSafeProfileImageHref(value: unknown): string | undefined {
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

export function getSafeExternalHref(value: unknown): string | undefined {
  const href = cleanText(value);
  if (!href) return undefined;

  try {
    const url = new URL(href);
    if (url.protocol !== 'https:') return undefined;
    if (url.username || url.password) return undefined;
    if (!url.hostname) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function getNostrProfileHref(npub: string): string {
  return `https://njump.me/${encodeURIComponent(npub)}`;
}

export function getNostrProfileQrImageHref(npub: string, size = 240): string {
  const boundedSize = Math.min(Math.max(Math.round(size), 160), 480);
  const nostrUri = `nostr:${npub}`;

  return `https://api.qrserver.com/v1/create-qr-code/?size=${boundedSize}x${boundedSize}&margin=12&data=${encodeURIComponent(nostrUri)}`;
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
    picture: getSafeProfileImageHref(profile.picture),
    initials: getInitials(displayName, profile.npub),
    profileHref: getNostrProfileHref(profile.npub),
    nostrUri: `nostr:${profile.npub}`,
    qrImageHref: getNostrProfileQrImageHref(profile.npub),
    updatedAt: new Date(profile.kind0.created_at * 1000).toISOString(),
    updatedLabel: formatKind0Date(profile.kind0.created_at),
    sourceHref: getSafeExternalHref(profile.source.membershipSourceUrl) ?? '',
  };
}

export function getSovEngAlumniStats(): SovEngAlumniStats {
  const sourceRelays = [...new Set(allSovEngAlumni.flatMap((profile) => profile.source.relayUrls))].sort();
  const newestKind0CreatedAt = Math.max(...allSovEngAlumni.map((profile) => profile.kind0.created_at));

  return {
    total: allSovEngAlumni.length,
    withAbout: allSovEngAlumni.filter((profile) => cleanAbout(profile.about)).length,
    withPicture: allSovEngAlumni.filter((profile) => getSafeProfileImageHref(profile.picture)).length,
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
