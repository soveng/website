#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const alumniPath = join(root, 'src/data/sovengAlumni.json');
const membershipSourceUrl = 'https://following.space/d/sier9e7ih6k2?p=83d999a148625c3d2bb819af3064c0f6a12d7da88f68b2c69221f3a746171d19';
const relayUrls = [
  'wss://nos.lol',
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nostr.wine',
  'wss://relay.nostr.band',
  'wss://purplepag.es',
  'wss://nostr-pub.wellorder.net',
  'wss://nostr.mom',
];
const chunkSize = 30;

function parseMetadata(event) {
  try {
    const parsed = JSON.parse(event.content);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function asCleanString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function uniqueByPubkey(records) {
  const seen = new Set();
  const result = [];
  for (const record of records) {
    if (seen.has(record.pubkey)) continue;
    seen.add(record.pubkey);
    result.push(record);
  }
  return result;
}

function rememberEvent(eventsByPubkey, event, allowedPubkeys) {
  if (!event || event.kind !== 0 || typeof event.pubkey !== 'string') return;
  if (allowedPubkeys && !allowedPubkeys.has(event.pubkey)) return;
  const existing = eventsByPubkey.get(event.pubkey);
  if (!existing || event.created_at > existing.created_at || (event.created_at === existing.created_at && event.id > existing.id)) {
    eventsByPubkey.set(event.pubkey, event);
  }
}

function parseEventLines(stdout, eventsByPubkey, allowedPubkeys) {
  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try {
      rememberEvent(eventsByPubkey, JSON.parse(trimmed), allowedPubkeys);
    } catch {
      // Ignore relay notices and partial lines.
    }
  }
}

function fetchKind0Events(seedRecords) {
  const pubkeys = seedRecords.map((record) => record.pubkey);
  const allowedPubkeys = new Set(pubkeys);
  const eventsByPubkey = new Map();
  for (let index = 0; index < pubkeys.length; index += chunkSize) {
    const chunk = pubkeys.slice(index, index + chunkSize);
    const chunkSet = new Set(chunk);
    const args = ['req', '-k', '0', '-l', String(chunk.length * relayUrls.length * 3)];
    for (const pubkey of chunk) args.push('-a', pubkey);
    args.push(...relayUrls);

    console.error(`fetching kind0 chunk ${index / chunkSize + 1}/${Math.ceil(pubkeys.length / chunkSize)} (${chunk.length} pubkeys)`);
    const result = spawnSync('nak', args, { cwd: root, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`nak exited with ${result.status}: ${result.stderr}`);
    }
    parseEventLines(result.stdout, eventsByPubkey, chunkSet);
  }

  const missingAfterBatch = seedRecords.filter((record) => !eventsByPubkey.has(record.pubkey));
  for (const record of missingAfterBatch) {
    console.error(`fallback kind0 fetch for ${record.npub}`);
    const reqArgs = ['req', '-k', '0', '-l', '20', '-a', record.pubkey, ...relayUrls];
    const reqResult = spawnSync('nak', reqArgs, { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (!reqResult.error && reqResult.status === 0) {
      parseEventLines(reqResult.stdout, eventsByPubkey, allowedPubkeys);
    }
    if (eventsByPubkey.has(record.pubkey)) continue;

    const fetchResult = spawnSync('nak', ['fetch', record.npub], { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (!fetchResult.error && fetchResult.status === 0) {
      parseEventLines(fetchResult.stdout, eventsByPubkey, allowedPubkeys);
    }
  }

  return eventsByPubkey;
}

const seedRecords = uniqueByPubkey(JSON.parse(readFileSync(alumniPath, 'utf8')));
const pubkeys = seedRecords.map((record) => record.pubkey);
const fetchedAt = new Date().toISOString();
const eventsByPubkey = fetchKind0Events(seedRecords);

const missing = pubkeys.filter((pubkey) => !eventsByPubkey.has(pubkey));
if (missing.length > 0) {
  console.error(`missing kind0 events for ${missing.length}/${pubkeys.length} pubkeys:`);
  for (const pubkey of missing) console.error(`- ${pubkey}`);
  process.exit(1);
}

const records = seedRecords.map((seed) => {
  const kind0 = eventsByPubkey.get(seed.pubkey);
  const metadata = parseMetadata(kind0);
  const name = asCleanString(metadata.name);
  const displayName = asCleanString(metadata.display_name) ?? asCleanString(metadata.displayName);
  const about = asCleanString(metadata.about);
  const picture = asCleanString(metadata.picture);
  const nip05 = asCleanString(metadata.nip05);

  return {
    pubkey: seed.pubkey,
    npub: seed.npub,
    ...(name ? { name } : {}),
    ...(displayName ? { displayName } : {}),
    ...(about ? { about } : {}),
    ...(nip05 ? { nip05 } : {}),
    ...(picture ? { picture } : {}),
    kind0,
    source: {
      membershipSourceUrl,
      relayUrls,
      fetchedAt,
    },
  };
});

writeFileSync(alumniPath, `${JSON.stringify(records, null, 2)}\n`);
console.log(`wrote ${records.length} source-locked alumni records with raw kind0 events to ${alumniPath}`);
