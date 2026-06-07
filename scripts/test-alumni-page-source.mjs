#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const pagePath = 'src/pages/alumni.astro';
assert.equal(existsSync(pagePath), true, '/alumni route must exist');

const page = readFileSync(pagePath, 'utf8');
assert.match(page, /<Base[\s\S]*meta_title="SovEng Alumni"/, 'alumni page should set Base metadata');
assert.match(page, /getSovEngAlumniStats/, 'alumni route should render source-locked stats');
assert.match(page, /hasSourceLockedAssociationData/, 'alumni route should expose the association gate state');
assert.match(page, /getAlumniProfileViewModel/, 'alumni route should render safe profile view models');
assert.match(page, /class="[^"]*alumni-grid/, 'alumni route should render the profile grid');
assert.match(page, /class="[^"]*alumni-card/, 'alumni route should render profile cards');
assert.match(page, /id="alumni-qr-dialog"/, 'alumni route should include QR dialog markup');
assert.match(page, /data-qr-src/, 'QR image src should be set from safe data attributes');
assert.match(page, /class="alumni-dialog-copy"/, 'QR dialog should expose an explicit npub copy control');
assert.match(page, /activeTrigger\.focus\(\)/, 'QR dialog should restore focus to its opener');
assert.match(page, /data-alumni-avatar-image/, 'avatar images should have an error fallback hook');
assert.match(page, /referrerpolicy="no-referrer"/, 'external profile/QR images should avoid leaking referrers');
assert.match(page, /separator-ship\.png/, 'alumni route should reuse native SovEng decorative separator');
assert.doesNotMatch(page, /<main\s+class="alumni-page"/, 'Base already emits the main landmark; route must not nest main elements');
assert.doesNotMatch(page, /alumni-(?:sec|project|tag)-chip/, 'association chips must stay blocked until canonical data exists');
assert.doesNotMatch(page, /following\.space\/d\/sier9e7ih6k2[^"\s<]*["']\s*>\s*Alumni/, 'route should not be a bare external follow-list link');

const menu = JSON.parse(readFileSync('src/config/menu.json', 'utf8'));
const mainAlumni = menu.main.flatMap((item) => (Array.isArray(item.children) ? item.children : [item])).find((item) => item.name === 'Alumni');
const footerAlumni = menu.footer.find((item) => item.name === 'Alumni');

assert.equal(mainAlumni?.url, '/alumni', 'main Alumni nav should point to local route');
assert.equal(footerAlumni?.url, '/alumni', 'footer Alumni nav should point to local route');

console.log('OK: alumni page route source');
