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
      'Madeira, 2023. Sovereign Engineering started as walks along the levadas, long conversations, and a simple rule: show something every Friday. Only three demos shipped in SEC-00, but they set the pattern. Highlighter put book quotes on Nostr. Lightning Prisms explored zaps through prisms. Data Vending Machines asked what a paid API on nostr could look like. Small starts, archived here.',
  },
  'SEC-01': {
    theme: 'The Beginning',
    paragraph:
      'SEC-01 ran six weeks from January through March 2024 with twenty-one participants and twenty-one Friday demos. The Show → Talk → Build loop became the rhythm of the program. Blossom gave Nostr shared blob storage. Zapstore turned signed social identity into an app store. npub.cash handed out Lightning addresses with Cashu inside. Wikifreedia mirrored Wikipedia onto the protocol. Scroll the list for the rest of that first full cohort.',
  },
  'SEC-02': {
    theme: 'Opsec Friendly',
    leadLink: {
      label: 'True names are not required.',
      href: 'https://dergigi.com/names',
    },
    paragraph:
      'SEC-02 ran in May and June 2024 with privacy as the through-line. NIP-60 and NIP-61 put Cashu wallets on Nostr. Nsite published static sites through relays and Blossom. TollGate experimented with captive portals and bearer payments for Wi-Fi. Shopstr pushed decentralized commerce. Thirteen Friday demos, each aimed at tools you can run without handing your identity to a platform.',
  },
  'SEC-03': {
    theme: 'Ecash',
    body: [
      { type: 'text', text: 'Before Bitcoin, ' },
      { type: 'link', text: 'ecash', href: 'https://opensats.org/topics/ecash' },
      {
        type: 'text',
        text: ' was mostly slides and papers. SEC-03, in late 2024, was where the tooling caught up. Nutstash shipped a full wallet redesign. Safebox and Athenut pushed Cashu further. Bolt12 prisms stretched Lightning experiments. TollGate picked up branding and a proper landing page. Fifteen Friday demos, most of them about moving bearer sats through nostr clients people already use.',
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
        text: ' SEC-04 in spring 2025 was the biggest cohort to date: thirty-four projects in six weeks. castr.me turned any npub into a podcast feed. gitworkshop.dev hosted code on nostr. HTTPN, Hypernote, and DVMCP stretched what clients and data vending could do. Someone even shipped an nginx module that speaks HTTP 402. The list below matches that breadth.',
      },
    ],
  },
  'SEC-05': {
    theme: 'YOLO Mode',
    paragraph:
      'SEC-05 in fall 2025 set the cohort record at forty-one shipped projects. The theme was YOLO mode: ship the thing you care about and worry about polish later. Marmot Chat, Boris, ContextVM, hashpool, and Frontier Browser each took a big swing. Relays, mining pools, and AI experiments filled out the rest. FIPS mesh work started here in earnest, and several SEC-07 projects grew out of that code.',
  },
  'SEC-06': {
    theme: 'Identity & Signers',
    paragraph:
      'SEC-06 in March 2026 narrowed the lens to identity. Who holds the key, how you move it between devices, and what actually signs a nostr event. The cohort shipped signer apps, bunker tooling, hardware experiments, and key rollover flows. Six weeks of Friday demos, all of them about keys you hold yourself.',
  },
  'SEC-07': {
    theme: 'Networks & Hardware',
    body: [
      { type: 'text', text: 'SEC-07 was built around ' },
      { type: 'link', text: 'FIPS', href: 'https://fips.network/' },
      {
        type: 'text',
        text: ', the mesh stack that grew out of SEC-05. March and April 2026 brought radios, LoRa range tests, Android nodes, and clients that route traffic over FIPS instead of a rented VPS. Learn FIPS taught the protocol through lessons. Fanal managed a fleet of mesh nodes. Nostr VPN on FIPS moved exit traffic onto the mesh. OPNsense backups rode the same links. The demos below are the hardware and network layer, spelled out project by project.',
      },
    ],
  },
};

export function getCohortIntro(cohort: string): CohortIntro | undefined {
  return cohortIntros[cohort];
}
