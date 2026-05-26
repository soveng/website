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
      'The idea started in Madeira: bring builders together, walk, talk, and ship on Fridays. This archive holds the first demos — Highlighter, Lightning Prisms, and Data Vending Machines — from that original spark.',
  },
  'SEC-01': {
    theme: 'The Beginning',
    paragraph:
      'Every cohort here starts with an idea and the will to build. SEC-01 was the first full six-week run: twenty-one participants shipping every Friday, from Blossom and Zapstore to Wikifreedia and npub.cash. The demos below are what “start ugly” looks like in public.',
  },
  'SEC-02': {
    theme: 'Opsec Friendly',
    leadLink: {
      label: 'True names are not required.',
      href: 'https://dergigi.com/names',
    },
    paragraph:
      'This cohort shipped tools for privacy and operational security on Nostr and the open web — Cashu wallets, Nsite, TollGate, and commerce that does not depend on a platform knowing who you are.',
  },
  'SEC-03': {
    theme: 'Ecash',
    body: [
      { type: 'text', text: 'Before Bitcoin, ' },
      { type: 'link', text: 'ecash', href: 'https://opensats.org/topics/ecash' },
      {
        type: 'text',
        text: ' was a dream deferred. SEC-03 deepened Cashu tooling, wallet UX, and the infrastructure that turns bearer assets plus nostr into applications people can actually run.',
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
        text: ' SEC-04 shipped thirty-four Friday demos. Relays, payments, browsers, castr.me, gitworkshop, and the rest of the list below.',
      },
    ],
  },
  'SEC-05': {
    theme: 'YOLO Mode',
    paragraph:
      'SEC-05 set a cohort record with forty-one shipped projects. Relays, mining, browsers, AI tools, and other experiments from the list below.',
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
        text: ', the mesh stack that kept compounding after SEC-05. Friday demos covered mesh routing, peer discovery, radios, and clients that run on links you control.',
      },
    ],
  },
};

export function getCohortIntro(cohort: string): CohortIntro | undefined {
  return cohortIntros[cohort];
}
