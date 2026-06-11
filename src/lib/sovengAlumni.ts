import sovEngAlumniData from '@/data/sovengAlumni.js';

export interface SovEngAlumniProfile {
  pubkey: string;
  npub: `npub1${string}`;
  name: string;
  displayName?: string;
  nip05?: string;
  nip05Verified: boolean;
  picture?: string;
}

export const allSovEngAlumni = [...(sovEngAlumniData as SovEngAlumniProfile[])].sort(
  (left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }) || left.npub.localeCompare(right.npub)
);

const alumniByNpub = new Map(allSovEngAlumni.map((profile) => [profile.npub, profile]));

export function getSovEngAlumni(): SovEngAlumniProfile[] {
  return [...allSovEngAlumni];
}

export function getSovEngAlumniByNpub(npub: string): SovEngAlumniProfile | undefined {
  return alumniByNpub.get(npub as `npub1${string}`);
}

export function getSovEngAlumniDisplayName(profile: SovEngAlumniProfile): string {
  return profile.displayName || profile.name || profile.npub;
}

export function getNostrProfileHref(npub: string): string {
  return `https://njump.me/${npub}`;
}
