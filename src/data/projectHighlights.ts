import { getProjectByName, slugifyProjectName } from '@/lib/showcase';

export type ProjectHighlightVariant = 'featured' | 'standard' | 'cta';

export interface ProjectHighlightLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface ProjectHighlight {
  title: string;
  eyebrow: string;
  description: string;
  image?: string;
  imageAlt?: string;
  logo?: string;
  variant?: ProjectHighlightVariant;
  links: ProjectHighlightLink[];
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
const learnFips = requireProject('Learn FIPS');
const fipsPrototype = requireProject('FIPs');
const nip60 = requireProject('NIP-60');
const nip61 = requireProject('NIP-61');

const projectHighlights: ProjectHighlight[] = [
  {
    title: 'Blossom',
    eyebrow: blossom.cohort,
    variant: 'featured',
    description: 'HTTP blob storage that became shared infrastructure across the Nostr stack.',
    image: '/images/project-highlights/blossom-wireframe.png',
    imageAlt: 'Wireframe illustration of Blossom blob storage',
    logo: blossom.logo,
    links: [
      {
        href: blossom.link,
        label: blossom.linkText,
        external: true,
      },
      {
        href: `/projects/${blossom.cohort}#${slugifyProjectName(blossom.name)}`,
        label: `${blossom.cohort} archive`,
      },
    ],
  },
  {
    title: 'Zapstore',
    eyebrow: zapstore.cohort,
    variant: 'featured',
    description: 'A Nostr-native app store that turned signed social identity into software distribution.',
    image: '/images/project-highlights/zapstore-wireframe.png',
    imageAlt: 'Wireframe illustration of the Zapstore app store',
    logo: zapstore.logo,
    links: [
      {
        href: zapstore.link,
        label: zapstore.linkText,
        external: true,
      },
      {
        href: `/projects/${zapstore.cohort}#${slugifyProjectName(zapstore.name)}`,
        label: `${zapstore.cohort} archive`,
      },
    ],
  },
  {
    title: 'Nutzaps',
    eyebrow: nip60.cohort,
    variant: 'featured',
    description: 'Cashu wallet standards on Nostr, spanning NIP-60 and NIP-61 and pushing ecash flows into everyday clients.',
    image: '/images/project-highlights/nutzaps-wireframe.png',
    imageAlt: 'Wireframe illustration of Nutzaps ecash on Nostr',
    logo: nip60.logo ?? nip61.logo,
    links: [
      {
        href: nip60.link,
        label: 'NIP-60',
        external: true,
      },
      {
        href: nip61.link,
        label: 'NIP-61',
        external: true,
      },
      {
        href: `/projects/${nip60.cohort}#${slugifyProjectName(nip60.name)}`,
        label: `${nip60.cohort} archive`,
      },
    ],
  },
  {
    title: 'Wikifreedia',
    eyebrow: wikifreedia.cohort,
    variant: 'standard',
    description: 'A censorship-resistant wiki mirror that brought Wikipedia-style knowledge onto Nostr.',
    image: '/images/project-highlights/wikifreedia-wireframe.png',
    imageAlt: 'Wireframe illustration of Wikifreedia',
    logo: wikifreedia.logo,
    links: [
      {
        href: wikifreedia.link,
        label: wikifreedia.linkText,
        external: true,
      },
      {
        href: `/projects/${wikifreedia.cohort}#${slugifyProjectName(wikifreedia.name)}`,
        label: `${wikifreedia.cohort} archive`,
      },
    ],
  },
  {
    title: 'npub.cash',
    eyebrow: npubCash.cohort,
    variant: 'standard',
    description: 'Nostr-native Lightning addresses for everyone, with Cashu eCash built in.',
    logo: npubCash.logo,
    links: [
      {
        href: npubCash.link,
        label: npubCash.linkText,
        external: true,
      },
    ],
  },
  {
    title: 'Nsite',
    eyebrow: nsite.cohort,
    variant: 'standard',
    description: 'Static websites published through Nostr and Blossom, turning the protocol into a deployment surface.',
    logo: nsite.logo,
    links: [
      {
        href: nsite.link,
        label: nsite.linkText,
        external: true,
      },
      {
        href: `/projects/${nsite.cohort}#${slugifyProjectName(nsite.name)}`,
        label: `${nsite.cohort} archive`,
      },
    ],
  },
  {
    title: 'TollGate',
    eyebrow: tollgate.cohort,
    variant: 'standard',
    description: 'Open access control and captive portal tooling built around internet freedom and bearer payments.',
    logo: tollgate.logo,
    links: [
      {
        href: tollgate.link,
        label: tollgate.linkText,
        external: true,
      },
      {
        href: `/projects/${tollgate.cohort}#${slugifyProjectName(tollgate.name)}`,
        label: `${tollgate.cohort} archive`,
      },
    ],
  },
  {
    title: 'FIPS',
    eyebrow: 'Multi-cohort',
    variant: 'standard',
    description: 'Mesh routing, service discovery, and tooling for a sovereign peer-to-peer network kept compounding across cohorts.',
    logo: '/images/showcase/fips-logo.png',
    links: [
      {
        href: learnFips.link,
        label: learnFips.linkText,
        external: true,
      },
      {
        href: `/projects/${fipsPrototype.cohort}#${slugifyProjectName(fipsPrototype.name)}`,
        label: `${fipsPrototype.cohort} archive`,
      },
      {
        href: `/projects/${learnFips.cohort}#${slugifyProjectName(learnFips.name)}`,
        label: `${learnFips.cohort} archive`,
      },
    ],
  },
];

export default projectHighlights;
