import mediaAppearancesData from '@/data/mediaAppearances.js';

export interface MediaAppearance {
  id: string;
  title: string;
  source: string;
  episodeNumber: number;
  platform: 'Fountain' | 'YouTube';
  url: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: string;
  durationSeconds: number;
  featured: boolean;
  description: string;
  alumniNpubs: `npub1${string}`[];
  projectNames: string[];
  tags: string[];
}

export const allMediaAppearances = [...(mediaAppearancesData as MediaAppearance[])].sort(
  (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
);

export function getMediaAppearances(): MediaAppearance[] {
  return [...allMediaAppearances];
}

export function getFeaturedMediaAppearances(): MediaAppearance[] {
  return allMediaAppearances.filter((appearance) => appearance.featured);
}

export function getArchiveMediaAppearances(): MediaAppearance[] {
  return allMediaAppearances.filter((appearance) => !appearance.featured);
}

export function formatMediaAppearanceDate(publishedAt: string): string {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(publishedAt));
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  return `${minutes}m`;
}

export function formatEpisodeNumber(episodeNumber: number): string {
  return `#${episodeNumber}`;
}

export function formatMediaAppearanceHeading(source: string, episodeNumber: number): string {
  return `${source} ${formatEpisodeNumber(episodeNumber)}`;
}
