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
      'Madeira, 2023: walk, talk, ship on Fridays. Highlighter, Lightning Prisms, and Data Vending Machines were the first demos in this archive.',
  },
  'SEC-01': {
    theme: 'The Beginning',
    paragraph:
      'SEC-01 ran six weeks with twenty-one builders demoing every Friday. Blossom, Zapstore, Wikifreedia, npub.cash, and the rest below.',
  },
  'SEC-02': {
    theme: 'Opsec Friendly',
    leadLink: {
      label: 'True names are not required.',
      href: 'https://dergigi.com/names',
    },
    paragraph:
      'Cashu wallets, Nsite, TollGate, Shopstr, and other tools for staying private on Nostr and the open web.',
  },
  'SEC-03': {
    theme: 'Ecash',
    body: [
      { type: 'text', text: 'Before Bitcoin, ' },
      { type: 'link', text: 'ecash', href: 'https://opensats.org/topics/ecash' },
      {
        type: 'text',
        text: ' was mostly slides and papers. SEC-03 shipped Cashu wallets, wallet UX, and nostr apps that move bearer sats.',
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
        text: ' SEC-04 shipped thirty-four Friday demos. Relays, payments, browsers, castr.me, gitworkshop, and more below.',
      },
    ],
  },
  'SEC-05': {
    theme: 'YOLO Mode',
    paragraph:
      'Forty-one Friday demos, still the cohort record. Relays, mining, browsers, Marmot Chat, hashpool, and the long tail below.',
  },
  'SEC-06': {
    theme: 'Identity & Signers',
    paragraph:
      'SEC-06 covered signers and identity. Generate a keypair, move it between devices, and sign nostr events with keys you hold yourself.',
  },
  'SEC-07': {
    theme: 'Networks & Hardware',
    body: [
      { type: 'text', text: 'SEC-07 was built around ' },
      { type: 'link', text: 'FIPS', href: 'https://fips.network/' },
      {
        type: 'text',
        text: ', the mesh stack that grew out of SEC-05. Mesh routing, peer discovery, radios, LoRa tests, and clients that talk FIPS on the wire.',
      },
    ],
  },
};

export function getCohortIntro(cohort: string): CohortIntro | undefined {
  return cohortIntros[cohort];
}
