#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const pagePath = 'src/pages/alumni.astro';
assert.equal(existsSync(pagePath), true, '/alumni route must exist');

const page = readFileSync(pagePath, 'utf8');
assert.match(page, /<Base[\s\S]*meta_title="SovEng Alumni"/, 'alumni page should set Base metadata');
assert.match(page, />\s*Social Graph\s*</, 'hero eyebrow should be Social Graph');
assert.match(page, /<h1[^>]*id="alumni-title"[\s\S]*SovEng Alumni[\s\S]*<\/h1>/, 'hero title should be SovEng Alumni');
assert.match(
  page,
  /Brave souls who participated in one of the SECs working towards builindg a better internet and advancing FreedomTech/,
  'hero lede should use requested copy',
);
assert.match(page, /class="[^"]*alumni-source-link[^"]*"[\s\S]*Nostr follow-list[\s\S]*↗/, 'source link should sit under hero copy with arrow');
assert.match(page, /getSovEngAlumniStats/, 'alumni route should render the total alumni count');
assert.match(page, /class="[^"]*alumni-total-count[^"]*"[\s\S]*\{stats\.total\}/, 'hero should display total count without a visible title');
assert.match(page, /getAlumniProfileViewModel/, 'alumni route should render safe profile view models');
assert.match(page, /class="[^"]*alumni-grid/, 'alumni route should render the profile grid');
assert.match(page, /class="[^"]*alumni-card/, 'alumni route should render profile cards');
assert.match(page, /id="alumni-qr-dialog"/, 'alumni route should include QR dialog markup');
assert.match(page, /data-qr-src/, 'QR image src should be set from safe data attributes');
assert.match(page, /class="alumni-dialog-copy"/, 'QR dialog should expose an explicit npub copy control');
assert.match(page, /activeTrigger\.focus\(\)/, 'QR dialog should restore focus to its opener');
assert.match(page, /data-alumni-avatar-image/, 'avatar images should have an error fallback hook');
assert.match(page, /referrerpolicy="no-referrer"/, 'external profile/QR images should avoid leaking referrers');
assert.doesNotMatch(page, /<main\s+class="alumni-page"/, 'Base already emits the main landmark; route must not nest main elements');
assert.doesNotMatch(page, /hasSourceLockedAssociationData/, 'association gate note should not render on the page');
assert.doesNotMatch(page, /alumni-(?:sec|project|tag)-chip/, 'association chips must stay blocked until canonical data exists');
assert.doesNotMatch(page, /SEC\/project\/tag chips are intentionally hidden/, 'association source note should be removed');
assert.doesNotMatch(page, /class="[^"]*alumni-manifest/, 'manifest section should be removed');
assert.doesNotMatch(page, />\s*Manifest\s*</, 'manifest title should be removed');
assert.doesNotMatch(page, /class="[^"]*alumni-stats/, 'stats section should be removed');
assert.doesNotMatch(page, />\s*Profiles\s*</, 'stats labels should be removed');
assert.doesNotMatch(page, />\s*With bios\s*</, 'stats labels should be removed');
assert.doesNotMatch(page, />\s*With avatars\s*</, 'stats labels should be removed');
assert.doesNotMatch(page, />\s*Source refresh\s*</, 'stats labels should be removed');
assert.doesNotMatch(page, /class="[^"]*alumni-source-note/, 'old source note block should be removed');
assert.doesNotMatch(page, /separator-ship\.png/, 'decorative separator between hero and grid should be removed');
assert.doesNotMatch(page, /class="[^"]*alumni-directory-header/, 'embellishment header between hero and grid should be removed');
assert.doesNotMatch(page, />\s*Roll call\s*</, 'roll-call embellishment should be removed');
assert.doesNotMatch(page, /Builders in the wild/, 'directory title embellishment should be removed');
assert.doesNotMatch(page, /following\.space\/d\/sier9e7ih6k2[^"\s<]*["']\s*>\s*Alumni/, 'route should not be a bare external follow-list link');

const menu = JSON.parse(readFileSync('src/config/menu.json', 'utf8'));
const mainAlumni = menu.main.flatMap((item) => (Array.isArray(item.children) ? item.children : [item])).find((item) => item.name === 'Alumni');
const footerAlumni = menu.footer.find((item) => item.name === 'Alumni');

assert.equal(mainAlumni?.url, '/alumni', 'main Alumni nav should point to local route');
assert.equal(footerAlumni?.url, '/alumni', 'footer Alumni nav should point to local route');

console.log('OK: alumni page route source');
