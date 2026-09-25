import covers from '@/data/blogCovers.json';

type CoverWidth = 320 | 960 | 1600;
const coverBases = covers as Record<string, string>;

export function blogCoverSrc(image: string, width: CoverWidth): string {
  const base = coverBases[image];
  // Newly published articles still render before a local cover variant exists.
  return base ? `${base}-${width}.webp` : image;
}

export function blogCoverSrcSet(image: string, widths: CoverWidth[]): string | undefined {
  const base = coverBases[image];
  return base ? widths.map((width) => `${base}-${width}.webp ${width}w`).join(', ') : undefined;
}
