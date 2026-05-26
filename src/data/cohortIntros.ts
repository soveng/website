export type CohortIntroSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

export interface CohortIntro {
  theme: string;
  paragraph?: string;
  leadLink?: {
    label: string;
    href: string;
  };
  body?: CohortIntroSegment[];
}

export function cohortIntroPlainText(intro: CohortIntro): string {
  if (intro.body) {
    return intro.body.map((segment) => segment.text).join('');
  }

  const lead = intro.leadLink?.label ?? '';
  const rest = intro.paragraph ?? '';
  return lead ? `${lead} ${rest}` : rest;
}

export const cohortIntros: Record<string, CohortIntro> = {
  'SEC-00': {
    theme: 'Genesis',
    paragraph:
      'Madeira, 2023. Gigi and Pablo, before the organized cohorts. Highlighter, Lightning Prisms, and Data Vending Machines are the three projects archived here. SEC-01 started the six-week program.',
  },
  'SEC-01': {
    theme: 'The Beginning',
    paragraph:
      'Jan–Mar 2024, six weeks, twenty-one builders, twenty-one Friday demos. Show → Talk → Build. Blossom, Zapstore, npub.cash, and Wikifreedia are below, with the rest of the cohort.',
  },
  'SEC-02': {
    theme: 'Opsec Friendly',
    leadLink: {
      label: 'True names are not required.',
      href: 'https://dergigi.com/names',
    },
    paragraph:
      'May–June 2024, privacy as the theme. NIP-60 and NIP-61, Nsite, TollGate, Shopstr. Thirteen Friday demos on tools you can run yourself.',
  },
  'SEC-03': {
    theme: 'Ecash',
    body: [
      { type: 'text', text: 'Before Bitcoin, ' },
      { type: 'link', text: 'ecash', href: 'https://opensats.org/topics/ecash' },
      {
        type: 'text',
        text: ' was mostly slides and papers. Late 2024, SEC-03 shipped wallets and nostr apps that move bearer sats: Nutstash, Safebox, Athenut, fifteen Friday demos.',
      },
    ],
  },
  'SEC-04': {
    theme: 'Trilemmas',
    body: [
      { type: 'text', text: 'There are ' },
      { type: 'link', text: 'no perfect solutions, only trade-offs.', href: '/podcast' },
      {
        type: 'text',
        text: ' Spring 2025, thirty-four projects in six weeks. castr.me, gitworkshop.dev, HTTPN, Hypernote, and an nginx module that speaks HTTP 402.',
      },
    ],
  },
  'SEC-05': {
    theme: 'YOLO Mode',
    paragraph:
      'Fall 2025, forty-one projects, still the cohort record. YOLO mode: Marmot Chat, hashpool, Frontier Browser, relays, mining, AI. FIPS mesh work started here.',
  },
  'SEC-06': {
    theme: 'Identity & Signers',
    paragraph:
      'March 2026, signers and identity. Keys you hold, bunkers, hardware, rollovers. Six weeks on what signs your nostr events.',
  },
  'SEC-07': {
    theme: 'Networks & Hardware',
    body: [
      { type: 'text', text: 'SEC-07 was built around ' },
      { type: 'link', text: 'FIPS', href: 'https://fips.network/' },
      {
        type: 'text',
        text: ', the mesh stack from SEC-05. March–April 2026: radios, LoRa tests, Learn FIPS, Fanal, Nostr VPN on FIPS, and the rest below.',
      },
    ],
  },
};

export function getCohortIntro(cohort: string): CohortIntro | undefined {
  return cohortIntros[cohort];
}
