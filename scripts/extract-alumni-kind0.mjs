#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const alumniPath = join(root, 'src/data/sovengAlumni.json');
const membershipSourceUrl = 'https://following.space/d/sier9e7ih6k2?p=83d999a148625c3d2bb819af3064c0f6a12d7da88f68b2c69221f3a746171d19';
const membershipAuthorPubkey = '83d999a148625c3d2bb819af3064c0f6a12d7da88f68b2c69221f3a746171d19';
const membershipListId = 'sier9e7ih6k2';
const membershipListKind = 39089;
const followListRelayUrls = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nostr.oxtr.dev',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  'wss://relay.primal.net',
];
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

function isHex64(value) {
  return typeof value === 'string' && /^[0-9a-f]{64}$/i.test(value);
}

function computeNostrEventId(event) {
  const serialized = JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]);
  return createHash('sha256').update(serialized, 'utf8').digest('hex');
}

function isValidKind0Event(event) {
  if (!event || event.kind !== 0 || !isHex64(event.pubkey) || !isHex64(event.id)) return false;
  if (!Number.isInteger(event.created_at) || event.created_at <= 0) return false;
  if (!Array.isArray(event.tags) || event.tags.some((tag) => !Array.isArray(tag) || tag.some((item) => typeof item !== 'string'))) return false;
  if (typeof event.content !== 'string') return false;
  return computeNostrEventId(event) === event.id;
}

function rememberEvent(eventsByPubkey, event, allowedPubkeys) {
  if (!isValidKind0Event(event)) return;
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

function parseJsonEventLines(stdout) {
  const events = [];
  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // Ignore relay notices and partial lines.
    }
  }
  return events;
}

function isValidMembershipListEvent(event) {
  if (!event || event.kind !== membershipListKind || event.pubkey !== membershipAuthorPubkey || !isHex64(event.id)) return false;
  if (!Number.isInteger(event.created_at) || event.created_at <= 0) return false;
  if (!Array.isArray(event.tags) || event.tags.some((tag) => !Array.isArray(tag) || tag.some((item) => typeof item !== 'string'))) return false;
  if (typeof event.content !== 'string') return false;
  if (computeNostrEventId(event) !== event.id) return false;
  return event.tags.some((tag) => tag[0] === 'd' && tag[1] === membershipListId);
}

function hexToNpub(pubkey, existingByPubkey) {
  const existing = existingByPubkey.get(pubkey);
  if (existing?.npub) return existing.npub;
  const result = spawnSync('nak', ['encode', 'npub', pubkey], { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`nak encode npub exited with ${result.status}: ${result.stderr}`);
  const npub = result.stdout.trim();
  if (!/^npub1[023456789acdefghjklmnpqrstuvwxyz]+$/.test(npub)) throw new Error(`nak returned invalid npub for ${pubkey}`);
  return npub;
}

function fetchMembershipSeedRecords(existingRecords) {
  const existingByPubkey = new Map(existingRecords.map((record) => [record.pubkey, record]));
  const args = ['req', '-k', String(membershipListKind), '-a', membershipAuthorPubkey, '-d', membershipListId, '-l', '20', ...followListRelayUrls];
  console.error(`fetching source follow-list ${membershipListKind}:${membershipAuthorPubkey}:${membershipListId}`);
  const result = spawnSync('nak', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 90_000 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`nak follow-list req exited with ${result.status}: ${result.stderr}`);

  const events = parseJsonEventLines(result.stdout).filter(isValidMembershipListEvent);
  if (events.length === 0) throw new Error('no valid source follow-list event returned from relays');
  events.sort((left, right) => right.created_at - left.created_at || right.id.localeCompare(left.id));

  const event = events[0];
  const seen = new Set();
  const seedRecords = [];
  for (const tag of event.tags) {
    if (tag[0] !== 'p' || !isHex64(tag[1]) || seen.has(tag[1])) continue;
    seen.add(tag[1]);
    seedRecords.push({ pubkey: tag[1], npub: hexToNpub(tag[1], existingByPubkey) });
  }
  if (seedRecords.length === 0) throw new Error('source follow-list event has no p tags');
  console.error(`source follow-list event ${event.id} has ${seedRecords.length} unique pubkeys`);
  return seedRecords;
}

function seedExistingKind0Events(eventsByPubkey, existingRecords, allowedPubkeys) {
  for (const record of existingRecords) rememberEvent(eventsByPubkey, record.kind0, allowedPubkeys);
}

function fetchKind0Events(seedRecords, existingRecords) {
  const pubkeys = seedRecords.map((record) => record.pubkey);
  const allowedPubkeys = new Set(pubkeys);
  const eventsByPubkey = new Map();
  seedExistingKind0Events(eventsByPubkey, existingRecords, allowedPubkeys);
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

const existingRecords = uniqueByPubkey(JSON.parse(readFileSync(alumniPath, 'utf8')));
const seedRecords = fetchMembershipSeedRecords(existingRecords);
const pubkeys = seedRecords.map((record) => record.pubkey);
const fetchedAt = new Date().toISOString();
const eventsByPubkey = fetchKind0Events(seedRecords, existingRecords);

const missing = pubkeys.filter((pubkey) => !eventsByPubkey.has(pubkey));
if (missing.length > 0) {
  console.error(`missing kind0 events for ${missing.length}/${pubkeys.length} pubkeys:`);
  for (const pubkey of missing) console.error(`- ${pubkey}`);
  process.exit(1);
}

const records = seedRecords
  .map((seed) => {
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
  })
  .sort((left, right) => {
    const leftName = left.displayName || left.name || left.npub;
    const rightName = right.displayName || right.name || right.npub;
    return leftName.localeCompare(rightName, undefined, { sensitivity: 'base' }) || left.npub.localeCompare(right.npub);
  });

writeFileSync(alumniPath, `${JSON.stringify(records, null, 2)}\n`);
console.log(`wrote ${records.length} source-locked alumni records with raw kind0 events to ${alumniPath}`);
