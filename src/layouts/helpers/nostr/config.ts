// Configuration for the live Nostr demo gallery embedded on the active
// cohort's project page. Update these when a new cohort begins.

// Hashtag participants tag their demo posts with on Nostr.
export const HASHTAGS = ["demoday"];

// Active cohort window. Posts outside this range are filtered out at the
// relay level. Update when a new cohort begins.
const COHORT_START_ISO = "2026-03-30T00:00:00Z";
const COHORT_END_ISO = "2026-04-20T23:59:59Z";

export const COHORT_START_TIMESTAMP = Math.floor(
  new Date(COHORT_START_ISO).getTime() / 1000,
);
export const COHORT_END_TIMESTAMP = Math.floor(
  new Date(COHORT_END_ISO).getTime() / 1000,
);

// Trusted curators allowed to publish kind:30000 cohort lists. When a curator
// publishes one for the active cohort, the page automatically uses it as
// the allowlist instead of the hardcoded fallback below.
export const CURATOR_PUBKEYS = [
  // dergigi
  "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93",
  // yo
  "d60bdad03468f5f8c85b1b10db977e310a5aafab33750dfadb37488b02bfc8d7",
];

// d-tags we look for on kind:30000 events (e.g. "sec07" for cohort 7).
export const COHORT_D_TAGS = Array.from(
  { length: 50 },
  (_, i) => `sec${String(i + 1).padStart(2, "0")}`,
);

// Hardcoded fallback allowlist — used when no curator has published a cohort
// list yet. These are SEC-07 cohort participant pubkeys (decoded from npubs).
export const ALLOWED_PUBKEYS = [
  "dc6c293fae6009e2a4880ada9cac807fb63fed7317ed5ff3e59b0209e8d30dae", // Maroon
  "d60bdad03468f5f8c85b1b10db977e310a5aafab33750dfadb37488b02bfc8d7", // yo
  "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93", // Gigi
  "c3e23eb5e376ed584973a6e0efdab8e3d911de6ded858110a12482ca3db6539a", // c03rad0r
  "bbb5dda0e15567979f0543407bdc2033d6f0bbb30f72512a981cfdb2f09e2747", // Arjen
  "f53b9d91a8cd177fb4a1cf081a1b6d58759a381ef120a7c5a18c0e70cae80983", // Thomas
  "a136247d8caf7e30bf403d32006faeca0c9d1cec7a16075e4142c2fed6cade60", // Shadrach
  "40b9c85fffeafc1cadf8c30a4e5c88660ff6e4971a0dc723d5ab674b5e61b451", // Gzuuus
  "1634b87b5fcfd4a6c4ff2f2de17450ccce46f9abe0b02a71876c596ec165bfed", // k0
  "1f830dd875130b134fbf3f27a69eecd8613a499748a71b5a271a719febae14ed", // Dimi
  "d02a3b54e6433fc7c2608e99ef9b4aed9039644446da9822d20b5b9890964f2f", // oleksky
  "2bbace553efebf58dd55912169f92c1123eb6121d7ba092f6c50104afc31acef", // Johnathan Corgan
  "11b9a89404dbf3034e7e1886ba9dc4c6d376f239a118271bd2ec567a889850ce", // Justin Moon
  "4ad6fa2d16e2a9b576c863b4cf7404a70d4dc320c0c447d10ad6ff58993eacc8", // redshift
  "12ee03d11684a125dd87be879c28190415be3f3b1eca6b4ed743bd74ffd880e6", // SatsAndSports
  "056f33245ca4cc4fa3c1d6e557dd8eae714889f3c3423cbd6fbf09f3c0e200d2", // Alex Xie
  "b158557dddf53d5b98e7fb7597a294f67c7cb6accdcc9aea9f6a5ab50fae01ee", // Chester Arinc
  "9ec7a778167afb1d30c4833de9322da0c08ba71a69e1911d5578d3144bb56437", // balas
  "4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0", // Sirius
  "6eef2e68c399c8f2efbf70d831c2b618d7a84bdfd21734a81e6d7d3d817f6850", // lauri
];

// Curated set of free, generally reliable relays. Different Nostr clients
// publish to different relays by default, so a wide net catches posts
// regardless of which client a participant uses.
export const DEFAULT_RELAYS = [
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://relay.snort.social",
  "wss://offchain.pub",
  "wss://nostr.mom",
  "wss://purplerelay.com",
  "wss://relay.nostrify.io",
  "wss://nostr.bitcoiner.social",
  "wss://nostr.fmt.wiz.biz",
  "wss://relay.nostr.bg",
];
