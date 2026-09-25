#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'node:fs';
import { nip19, verifyEvent } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { BlogWebSocket } from '../src/lib/blogWebSocket.ts';

const alumniPath = new URL('../src/data/sovengAlumni.json', import.meta.url);
const author = '83d999a148625c3d2bb819af3064c0f6a12d7da88f68b2c69221f3a746171d19';
const listId = 'sier9e7ih6k2';
const membershipSourceUrl = `https://following.space/d/${listId}?p=${author}`;
const relayUrls = ['wss://nos.lol', 'wss://relay.damus.io', 'wss://relay.primal.net', 'wss://purplepag.es'];
const profileRelays = ['wss://purplepag.es', 'wss://relay.vertexlab.io', ...relayUrls.filter((url) => url !== 'wss://purplepag.es')];
const fallbackRelays = ['wss://relay.nostr.band', 'wss://nostr-pub.wellorder.net', 'wss://nostr.mom', 'wss://nostr.wine'];
const existing = JSON.parse(readFileSync(alumniPath, 'utf8'));

export function latestEvent(events) {
  return events.filter((event) => {
    try { return verifyEvent(event); } catch { return false; }
  }).sort((a, b) => b.created_at - a.created_at || a.id.localeCompare(b.id))[0];
}

export function writeRelays(events, pubkey) {
  const event = latestEvent(events.filter((event) => event.kind === 10002 && event.pubkey === pubkey));
  const urls = (event?.tags ?? []).flatMap(([tag, value, mode]) => {
    if (tag !== 'r' || (mode && mode !== 'write')) return [];
    try {
      const url = new URL(value);
      return url.protocol === 'wss:' && !url.username && !url.password ? [url.href] : [];
    } catch { return []; }
  });
  return [...new Set(urls)].slice(0, 4);
}

export function mergeProfiles(pubkeys, events, saved, fetchedAt, queriedRelays = relayUrls) {
  const oldByKey = new Map(saved.map((profile) => [profile.pubkey, profile]));
  return pubkeys.flatMap((pubkey) => {
    const old = oldByKey.get(pubkey);
    const event = latestEvent([
      ...(old ? [old.kind0] : []),
      ...events.filter((candidate) => candidate.kind === 0 && candidate.pubkey === pubkey),
    ].filter((candidate) => {
      try {
        const metadata = JSON.parse(candidate.content);
        return metadata && typeof metadata === 'object' && !Array.isArray(metadata);
      } catch { return false; }
    }));
    if (!event) return old ? [old] : [];
    if (old?.kind0.id === event.id) return [old];
    const metadata = JSON.parse(event.content);
    const clean = (value) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
    return [{
      pubkey, npub: nip19.npubEncode(pubkey),
      name: clean(metadata.name),
      displayName: clean(metadata.display_name) || clean(metadata.displayName),
      about: clean(metadata.about), nip05: clean(metadata.nip05), picture: clean(metadata.picture),
      kind0: event, source: { membershipSourceUrl, relayUrls: queriedRelays, fetchedAt },
    }];
  });
}

export async function refreshAlumni() {
  const pool = new AbstractSimplePool({
    verifyEvent, websocketImplementation: BlogWebSocket, maxWaitForConnection: 3000,
  });
  const queriedRelays = new Set();
  const query = async (filter, relays = relayUrls) => {
    for (const relay of relays) queriedRelays.add(relay);
    try { return await pool.querySync(relays, filter, { maxWait: 5000 }); }
    catch (error) { console.warn('Alumni relay refresh failed; retaining saved data.', error); return []; }
  };
  try {
    const membership = latestEvent((await query({ kinds: [39089], authors: [author], '#d': [listId], limit: 10 }))
      .filter((event) => event.kind === 39089 && event.pubkey === author && event.tags.some((tag) => tag[0] === 'd' && tag[1] === listId)));
    const pubkeys = membership
      ? [...new Set(membership.tags.filter((tag) => tag[0] === 'p' && /^[a-f0-9]{64}$/.test(tag[1])).map((tag) => tag[1]))]
      : existing.map((profile) => profile.pubkey);
    if (!membership) console.warn('Alumni membership unavailable; refreshing saved members.');
    const batches = [];
    for (let i = 0; i < pubkeys.length; i += 30) {
      batches.push(query({ kinds: [0, 10002], authors: pubkeys.slice(i, i + 30), limit: 600 }, profileRelays));
    }
    const events = (await Promise.all(batches)).flat();
    const authorsByRelay = new Map();
    let withOutbox = 0;
    for (const pubkey of pubkeys) {
      const relays = writeRelays(events, pubkey);
      if (relays.length) withOutbox++;
      for (const relay of relays) {
        const authors = authorsByRelay.get(relay) ?? [];
        authors.push(pubkey);
        authorsByRelay.set(relay, authors);
      }
    }
    const outboxJobs = [...authorsByRelay].flatMap(([relay, authors]) => {
      const jobs = [];
      for (let i = 0; i < authors.length; i += 30) jobs.push({ relay, authors: authors.slice(i, i + 30) });
      return jobs;
    });
    // Limit concurrent connections while querying the authors' advertised write relays.
    for (let i = 0; i < outboxJobs.length; i += 8) {
      const results = await Promise.all(outboxJobs.slice(i, i + 8).map(({ relay, authors }) => query({ kinds: [0], authors, limit: 300 }, [relay])));
      events.push(...results.flat());
    }
    console.log(`Discovered write relays for ${withOutbox}/${pubkeys.length} alumni; queried ${authorsByRelay.size} outbox relays.`);
    let records = mergeProfiles(pubkeys, events, existing, new Date().toISOString(), [...queriedRelays]);
    const byKey = new Map(records.map((record) => [record.pubkey, record]));
    const incomplete = pubkeys.filter((pubkey) => !byKey.get(pubkey)?.about || !byKey.get(pubkey)?.picture);
    if (incomplete.length) {
      const extra = [];
      for (let i = 0; i < incomplete.length; i += 30) {
        extra.push(query({ kinds: [0], authors: incomplete.slice(i, i + 30), limit: 300 }, fallbackRelays));
      }
      records = mergeProfiles(pubkeys, (await Promise.all(extra)).flat(), records, new Date().toISOString(), [...queriedRelays]);
    }
    records.sort((a, b) => (a.displayName || a.name || a.npub).localeCompare(b.displayName || b.name || b.npub, undefined, { sensitivity: 'base' }));
    writeFileSync(alumniPath, `${JSON.stringify(records, null, 2)}\n`);
    console.log(`Refreshed ${records.length} alumni profiles (${pubkeys.length - records.length} new members awaiting profile data).`);
  } finally { pool.destroy(); }
}

if (import.meta.main) await refreshAlumni();
