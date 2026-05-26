export interface CohortIntro {
  theme: string;
  paragraph: string;
  leadLink?: {
    label: string;
    href: string;
  };
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
    paragraph:
      'Before Bitcoin, ecash was a dream deferred. SEC-03 deepened Cashu tooling, wallet UX, and the infrastructure that turns bearer assets plus nostr into applications people can actually run.',
  },
  'SEC-04': {
    theme: 'Trilemmas',
    paragraph:
      'There are no perfect solutions, only trade-offs. Thirty-four projects shipped in SEC-04 — relays, payments, browsers, developer tooling — each demo an explicit choice under real constraints.',
  },
  'SEC-05': {
    theme: 'YOLO Mode',
    paragraph:
      'Bitcoin and nostr are permissionless, so builders stop asking and start shipping. Forty-one demos in SEC-05 span relays, mining, AI, browsers, and more — systems aimed at making the old stack obsolete, not reforming it.',
  },
  'SEC-06': {
    theme: 'Identity & Signers',
    paragraph:
      'Identity in sovereign systems is held in keys, not assigned by platforms. SEC-06 focused on signers, key ceremony, and the layer where intent becomes cryptographic action.',
  },
  'SEC-07': {
    theme: 'Networks & Hardware',
    paragraph:
      'Protocols need a body: machines, radios, nodes, and operators willing to keep them alive. SEC-07 demos run the stack down through networks and hardware — the layers beneath every sovereign application.',
  },
};

export function getCohortIntro(cohort: string): CohortIntro | undefined {
  return cohortIntros[cohort];
}
