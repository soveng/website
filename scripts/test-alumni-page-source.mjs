#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const pagePath = 'src/pages/alumni.astro';
assert.equal(existsSync(pagePath), true, '/alumni route must exist');
assert.equal(existsSync('public/images/copy-to-clipboard.svg'), false, 'unused copy icon asset should be removed');

const page = readFileSync(pagePath, 'utf8');
assert.match(page, /<Base[\s\S]*meta_title="Alumni"/, 'alumni page should set Base metadata');
assert.doesNotMatch(page, />\s*Social Graph\s*</, 'hero eyebrow should be removed');
assert.match(page, /<h1[^>]*id="alumni-title"[\s\S]*Alumni[\s\S]*<\/h1>/, 'hero title should be Alumni');
assert.match(
  page,
  /Builders, designers, and founders from Sovereign Engineering working on a freer internet with Bitcoin, Nostr, and open protocols\./,
  'hero lede should use the tightened alumni copy'
);
assert.match(
  page,
  /class="[^"]*alumni-source-link[^"]*"[\s\S]*Nostr follow-list[\s\S]*fa-arrow-up-right-from-square/,
  'source link should sit under hero copy with the shared external-link icon'
);
assert.match(page, /getAlumniProfileViewModel/, 'alumni route should render safe profile view models');
assert.match(page, /class="[^"]*alumni-grid/, 'alumni route should render the profile grid');
assert.match(page, /class="[^"]*alumni-card/, 'alumni route should render profile cards');
const alumniGridRule = page.match(/\.alumni-grid\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
assert.match(alumniGridRule, /gap:\s*1rem/, 'grid should use breathing room between cards');
assert.doesNotMatch(alumniGridRule, /margin-top:/, 'grid should not need extra offset hacks');
assert.match(page, /\.alumni-card\s*\{[\s\S]*border:\s*1px solid rgb\(255 255 255 \/ 9%\)/, 'cards should use a simple subtle border');
assert.match(page, /\.alumni-card:hover\s*\{[\s\S]*border-color:\s*rgb\(255 255 255 \/ 18%\)/, 'card hover should stay restrained');
assert.doesNotMatch(page, /\.alumni-card::before|\.alumni-card::after/, 'card sparkle and separator overlays should be removed');
assert.match(page, /class="[^"]*alumni-hero bg-black pt-16 pb-6 text-white sm:pt-20 sm:pb-8/, 'hero should keep the simplified spacing');
assert.match(page, /\.alumni-hero\s*\{[\s\S]*min-height:\s*0/, 'hero should not force tall viewport spacing');
assert.match(page, /class="[^"]*alumni-directory bg-black pt-4 pb-16 text-white sm:pt-4 sm:pb-20/, 'directory should sit tighter under the hero');
assert.match(
  page,
  /class="[^"]*alumni-card-top[\s\S]*alumni-avatar-link[\s\S]*alumni-card-identity[\s\S]*alumni-card-title/,
  'card name should sit next to profile image'
);
assert.match(page, /class="[^"]*alumni-card-identity[\s\S]*alumni-card-title[\s\S]*alumni-handle/, 'handle should sit under the card name');
assert.match(
  page,
  /class="[^"]*alumni-card-title[^"]*"[\s\S]*fa-arrow-up-right-from-square/,
  'card title link should use the smaller FontAwesome external-link icon'
);
assert.match(page, /class="[^"]*alumni-handle[^"]*"[\s\S]*\{profile\.handle\}/, 'card should show the compact handle line');
assert.doesNotMatch(page, /\{profile\.npub\}<\/span>/, 'full npub text should no longer render in the card body');
assert.doesNotMatch(page, /alumni-npub-copy|data-alumni-copy|Copy npub|copy-to-clipboard\.svg/, 'copy npub UI and wiring should be removed');
assert.doesNotMatch(page, /navigator\.clipboard\.writeText\(value\)|is-copied|is-copy-failed/, 'clipboard logic should be removed');
assert.match(page, /data-alumni-avatar-image/, 'avatar images should have an error fallback hook');
assert.match(page, /width="64"[\s\S]*height="64"/, 'avatar images should declare dimensions to reduce layout shift');
assert.match(page, /loading=\{index < 6 \? 'eager' : 'lazy'\}/, 'above-fold avatars should load eagerly while offscreen avatars stay lazy');
assert.match(page, /fetchpriority=\{index < 3 \? 'high' : 'auto'\}/, 'first visible avatars should get higher fetch priority');
assert.match(page, /contain:\s*layout paint/, 'cards should contain layout/paint without hiding visible content');
assert.match(page, /referrerpolicy="no-referrer"/, 'external profile images should avoid leaking referrers');
assert.doesNotMatch(page, /<main\s+class="alumni-page"/, 'Base already emits the main landmark; route must not nest main elements');
assert.doesNotMatch(page, /getSovEngAlumniStats|alumni-total-count/, 'page should no longer render the big alumni count');
assert.doesNotMatch(page, /↗/, 'page should use the shared icon instead of raw arrow glyphs');
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
assert.doesNotMatch(
  page,
  /alumni-qr|data-alumni-qr|data-qr-src|qrImageHref|alumni-dialog|Profile QR|QR code/,
  'QR UI and data should be removed from the route'
);
assert.doesNotMatch(page, /kind 0|updatedLabel|updatedAt|<time\b/, 'kind 0 date line should be removed');
assert.doesNotMatch(page, /alumni-card-foot/, 'old card footer line should be removed');
assert.doesNotMatch(page, /following\.space\/d\/sier9e7ih6k2[^"\s<]*["']\s*>\s*Alumni/, 'route should not be a bare external follow-list link');

const menu = JSON.parse(readFileSync('src/config/menu.json', 'utf8'));
const mainAlumni = menu.main.flatMap((item) => (Array.isArray(item.children) ? item.children : [item])).find((item) => item.name === 'Alumni');
const footerLinks = Array.isArray(menu.footer) ? menu.footer : menu.footer.sections.flatMap((section) => section.links);
const footerAlumni = footerLinks.find((item) => item.name === 'Alumni');

assert.equal(mainAlumni?.url, '/alumni', 'main Alumni nav should point to local route');
assert.equal(footerAlumni?.url, '/alumni', 'footer Alumni nav should point to local route');

console.log('OK: alumni page route source');
