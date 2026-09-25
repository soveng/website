import assert from 'node:assert/strict';
import { finalizeEvent, generateSecretKey, nip19 } from 'nostr-tools';
import { latestEvent, mergeProfiles, writeRelays } from './extract-alumni-kind0.mjs';

const key = generateSecretKey();
const sign = (created_at, content) => finalizeEvent({ kind: 0, created_at, content: JSON.stringify(content), tags: [] }, key);
const old = sign(100, { name: 'Old', about: 'Original bio' });
const newer = sign(200, { display_name: 'New', about: 'Updated bio', picture: 'https://example.com/avatar.png' });
const saved = [{ pubkey: old.pubkey, npub: nip19.npubEncode(old.pubkey), name: 'Old', about: 'Original bio', kind0: old }];
assert.deepEqual(mergeProfiles([old.pubkey], [], saved, 'now'), saved, 'offline refresh retains snapshot');
const updated = mergeProfiles([old.pubkey], [newer], saved, 'now')[0];
assert.equal(updated.about, 'Updated bio');
assert.equal(updated.displayName, 'New');
assert.equal(updated.picture, 'https://example.com/avatar.png');
const tampered = JSON.parse(JSON.stringify(newer));
tampered.content = '{"about":"forged"}';
assert.deepEqual(mergeProfiles([old.pubkey], [tampered], saved, 'now'), saved, 'invalid signatures cannot replace saved data');
assert.deepEqual(mergeProfiles([], [newer], saved, 'now'), [], 'removed members disappear');
assert.equal(mergeProfiles([newer.pubkey], [newer], [], 'now')[0].about, 'Updated bio', 'new members are added');
assert.equal(latestEvent([old, newer]).id, newer.id);
console.log('PASS: fresh profiles, new/removed members, signature rejection, and snapshot fallback.');

const relayList = finalizeEvent({ kind: 10002, created_at: 200, content: '', tags: [
  ['r', 'wss://write.example', 'write'], ['r', 'wss://both.example'],
  ['r', 'wss://read.example', 'read'], ['r', 'https://invalid.example'],
] }, key);
assert.deepEqual(writeRelays([relayList], old.pubkey), ['wss://write.example/', 'wss://both.example/']);
const replacement = finalizeEvent({kind:10002, created_at:300, content:'', tags:[['r','wss://new.example','write']]}, key);
assert.deepEqual(writeRelays([relayList,replacement], old.pubkey), ['wss://new.example/']);
assert.deepEqual(writeRelays([relayList], '0'.repeat(64)), []);
console.log('PASS: NIP-65 uses latest signed write/both relays, excludes read-only relays and other authors.');
