import { getProjectArchiveHref, getProjectByName } from '@/lib/showcase';

export type ProjectHighlightVariant = 'featured' | 'standard' | 'cta';

export interface ProjectHighlight {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  externalUrl?: string;
  image?: string;
  imageAlt?: string;
  logo?: string;
  icon?: string;
  variant?: ProjectHighlightVariant;
}

function externalLink(project: { link?: string }): string | undefined {
  const url = project.link?.trim();
  return url || undefined;
}

function requireProject(name: string) {
  const project = getProjectByName(name);

  if (!project) {
    throw new Error(`Missing showcase project: ${name}`);
  }

  return project;
}

const blossom = requireProject('Blossom');
const zapstore = requireProject('Zapstore');
const npubCash = requireProject('npub.cash');
const wikifreedia = requireProject('NIP-54: Wiki / Wikifreedia');
const nsite = requireProject('Nsite');
const tollgate = requireProject('Tollgate');
const fipsPrototype = requireProject('FIPs');
const nip60 = requireProject('NIP-60');
const nip61 = requireProject('NIP-61');

const projectHighlights: ProjectHighlight[] = [
  {
    title: 'Blossom',
    eyebrow: blossom.cohort,
    href: getProjectArchiveHref(blossom),
    externalUrl: externalLink(blossom),
    variant: 'featured',
    description: 'HTTP blob storage that became shared infrastructure across the Nostr stack.',
    image: '/images/project-highlights/blossom-wireframe.png',
    imageAlt: 'Wireframe illustration of Blossom blob storage',
    logo: blossom.logo,
  },
  {
    title: 'Zapstore',
    eyebrow: zapstore.cohort,
    href: getProjectArchiveHref(zapstore),
    externalUrl: externalLink(zapstore),
    variant: 'featured',
    description: 'A Nostr-native app store that turned signed social identity into software distribution.',
    image: '/images/project-highlights/zapstore-wireframe.png',
    imageAlt: 'Wireframe illustration of the Zapstore app store',
    logo: zapstore.logo,
  },
  {
    title: 'Nutzaps',
    eyebrow: nip60.cohort,
    href: getProjectArchiveHref(nip60),
    externalUrl: externalLink(nip60),
    variant: 'featured',
    description: 'Cashu wallet standards on Nostr, spanning NIP-60 and NIP-61 and pushing ecash flows into everyday clients.',
    image: '/images/project-highlights/nutzaps-wireframe.png',
    imageAlt: 'Wireframe illustration of Nutzaps ecash on Nostr',
    logo: nip60.logo ?? nip61.logo,
  },
  {
    title: 'Wikifreedia',
    eyebrow: wikifreedia.cohort,
    href: getProjectArchiveHref(wikifreedia),
    externalUrl: externalLink(wikifreedia),
    variant: 'standard',
    description: 'A censorship-resistant wiki mirror that brought Wikipedia-style knowledge onto Nostr.',
    image: '/images/project-highlights/wikifreedia-wireframe.png',
    imageAlt: 'Wireframe illustration of Wikifreedia',
    logo: wikifreedia.logo,
  },
  {
    title: 'npub.cash',
    eyebrow: npubCash.cohort,
    href: getProjectArchiveHref(npubCash),
    externalUrl: externalLink(npubCash),
    variant: 'standard',
    description: 'Nostr-native Lightning addresses for everyone, with Cashu eCash built in.',
    logo: npubCash.logo,
  },
  {
    title: 'Nsite',
    eyebrow: nsite.cohort,
    href: getProjectArchiveHref(nsite),
    externalUrl: externalLink(nsite),
    variant: 'standard',
    description: 'Static websites published through Nostr and Blossom, turning the protocol into a deployment surface.',
    logo: nsite.logo,
  },
  {
    title: 'TollGate',
    eyebrow: tollgate.cohort,
    href: getProjectArchiveHref(tollgate),
    externalUrl: externalLink(tollgate),
    variant: 'standard',
    description: 'Open access control and captive portal tooling built around internet freedom and bearer payments.',
    logo: tollgate.logo,
  },
  {
    title: 'FIPS',
    eyebrow: fipsPrototype.cohort,
    href: getProjectArchiveHref(fipsPrototype),
    externalUrl: externalLink(fipsPrototype),
    variant: 'standard',
    description: 'Mesh routing, service discovery, and tooling for a sovereign peer-to-peer network kept compounding across cohorts.',
    logo: '/images/showcase/fips-logo.png',
  },
];

export default projectHighlights;
