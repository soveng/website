#!/usr/bin/env bun
import assert from 'node:assert/strict';

import {
  getAlumniProfileViewModel,
  getNostrProfileHref,
  getSafeExternalHref,
  getSafeProfileImageHref,
  getSovEngAlumni,
  getSovEngAlumniDisplayName,
  getSovEngAlumniStats,
  hasSourceLockedAssociationData,
} from '../src/lib/sovengAlumni.ts';

const baseProfile = {
  pubkey: '0'.repeat(64),
  npub: 'npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqz9mrqec',
  name: 'builder',
  displayName: 'Builder McShipface',
  about: 'Ships small tools for large freedoms.',
  nip05: 'builder@example.com',
  picture: 'https://example.com/avatar.png',
  kind0: {
    id: '1'.repeat(64),
    pubkey: '0'.repeat(64),
    created_at: 1_760_000_000,
    kind: 0,
    tags: [],
    content: JSON.stringify({ name: 'builder' }),
    sig: '2'.repeat(128),
  },
  source: {
    membershipSourceUrl: 'https://following.space/d/source',
    relayUrls: ['wss://nos.lol'],
    fetchedAt: '2026-06-07T00:00:00.000Z',
  },
};

const alumni = getSovEngAlumni();
assert.ok(alumni.length > 80, 'expected source-locked alumni list');
assert.ok(
  alumni.every((profile) => profile.kind0.kind === 0),
  'expected preserved kind0 events'
);
const first = alumni[0];
alumni.pop();
const fresh = getSovEngAlumni();
assert.ok(fresh.length > alumni.length, 'getSovEngAlumni must return a defensive copy');
assert.equal(fresh[0].npub, first.npub, 'fresh sorted list should be stable');

assert.equal(getSovEngAlumniDisplayName(baseProfile), 'Builder McShipface');
assert.equal(getSovEngAlumniDisplayName({ ...baseProfile, displayName: undefined }), 'builder');
assert.equal(getSovEngAlumniDisplayName({ ...baseProfile, displayName: undefined, name: '' }), baseProfile.npub);

assert.equal(getSafeProfileImageHref('https://example.com/avatar.png?size=256'), 'https://example.com/avatar.png?size=256');
assert.equal(getSafeProfileImageHref('http://example.com/avatar.png'), undefined);
assert.equal(getSafeProfileImageHref('javascript:alert(1)'), undefined);
assert.equal(getSafeProfileImageHref('data:image/svg+xml,<svg></svg>'), undefined);
assert.equal(getSafeProfileImageHref('https://user:***@example.com/avatar.png'), undefined);
assert.equal(getSafeExternalHref('https://following.space/d/source'), 'https://following.space/d/source');
assert.equal(getSafeExternalHref('http://following.space/d/source'), undefined);
assert.equal(getSafeExternalHref('https://user:***@following.space/d/source'), undefined);

assert.equal(getNostrProfileHref(baseProfile.npub), `https://njump.me/${baseProfile.npub}`);

const viewModel = getAlumniProfileViewModel(baseProfile);
assert.equal(viewModel.displayName, 'Builder McShipface');
assert.equal(viewModel.handle, 'builder@example.com');
assert.equal(viewModel.profileHref, `https://njump.me/${baseProfile.npub}`);
assert.equal(Object.hasOwn(viewModel, 'qrImageHref'), false, 'view model should not expose QR data');
assert.equal(Object.hasOwn(viewModel, 'updatedAt'), false, 'card kind 0 timestamp should not be exposed to route');
assert.equal(Object.hasOwn(viewModel, 'updatedLabel'), false, 'card kind 0 label should not be exposed to route');
assert.equal(viewModel.initials, 'BM');
assert.equal(viewModel.picture, 'https://example.com/avatar.png');
assert.equal(viewModel.about, 'Ships small tools for large freedoms.');

const stats = getSovEngAlumniStats();
assert.equal(stats.total, getSovEngAlumni().length);
assert.ok(stats.withPicture > 0, 'expected picture count');
assert.ok(stats.withAbout > 0, 'expected about count');
assert.ok(stats.sourceRelays.includes('wss://nos.lol'), 'expected source relay in stats');
assert.match(stats.lastFetchedAt, /^\d{4}-\d{2}-\d{2}T/);
assert.equal(hasSourceLockedAssociationData(), false, 'association chips stay blocked until canonical source exists');

console.log('OK: soveng alumni helpers');
