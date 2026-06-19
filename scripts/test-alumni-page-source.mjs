#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const pagePath = 'src/pages/alumni.astro';
assert.equal(existsSync(pagePath), true, '/alumni route must exist');
assert.equal(existsSync('public/images/copy-to-clipboard.svg'), true, 'copy-to-clipboard.svg icon asset must exist');

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
const alumniGridRule = page.match(/\.alumni-grid\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
assert.doesNotMatch(alumniGridRule, /\bborder\s*:/, 'profile grid should not draw an outer border');
assert.match(alumniGridRule, /gap:\s*0/, 'grid should avoid gap-based outer border artifacts');
assert.match(page, /\.alumni-card::after\s*\{[\s\S]*linear-gradient\(to bottom[\s\S]*linear-gradient\(to right/, 'card separators should be internal fading lines');
assert.match(page, /--sep-right[\s\S]*--sep-bottom/, 'separator rules should suppress outer grid edges');
const sparkleRule = page.match(/\.alumni-card::before\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
assert.match(sparkleRule, /radial-gradient[\s\S]*var\(--color-primary\)/, 'cards should define red sparkle overlay');
assert.match(sparkleRule, /0\.35px[\s\S]*0\.55px[\s\S]*0\.85px/, 'sparkle dots should use varied tiny sizes, not uniform dots');
assert.doesNotMatch(sparkleRule, /82%, transparent|1\.1px|1\.9px/, 'sparkle dots should stay subtle, not oversized or over-bright');
assert.match(page, /\.alumni-card:hover::before[^{]*\{[\s\S]*opacity:\s*1/, 'card hover should show full-card red sparkle overlay');
assert.match(page, /class="[^"]*alumni-hero bg-black pt-16 pb-4 text-white sm:pt-20 sm:pb-6/, 'hero should keep top breathing room but tighten bottom gap');
assert.match(page, /\.alumni-hero\s*\{[\s\S]*min-height:\s*0/, 'hero should not force tall viewport spacing');
assert.match(page, /class="[^"]*alumni-directory bg-black pt-6 pb-16 text-white sm:pt-8 sm:pb-20/, 'directory should leave a small breathing gap before the grid');
assert.match(page, /class="[^"]*alumni-card-top[\s\S]*alumni-avatar-link[\s\S]*alumni-card-identity[\s\S]*alumni-card-title/, 'card name should sit next to profile image');
assert.match(page, /class="[^"]*alumni-card-identity[\s\S]*alumni-card-title[\s\S]*alumni-npub-copy/, 'npub copy control should sit under card name');
assert.match(page, /class="[^"]*alumni-npub-copy[^"]*"[\s\S]*data-alumni-copy[\s\S]*data-npub=\{profile\.npub\}[\s\S]*\{profile\.npub\}[\s\S]*copy-to-clipboard\.svg/, 'npub and copy icon should be one clickable copy control');
assert.match(page, /\.alumni-npub\s*\{[\s\S]*overflow-wrap:\s*anywhere/, 'full npub should wrap instead of truncating');
assert.doesNotMatch(page, /\.alumni-npub\s*\{[\s\S]*text-overflow:\s*ellipsis/, 'npub text must not be visually ellipsized');
assert.match(page, /navigator\.clipboard\.writeText\(value\)/, 'copy control should copy the npub');
assert.match(page, /icon\.textContent = '✓'/, 'copy icon should turn into a tick after copying');
assert.match(page, /classList\.add\('is-copied'\)/, 'copy control should expose copied visual state');
assert.match(page, /data-alumni-avatar-image/, 'avatar images should have an error fallback hook');
assert.match(page, /width="64"[\s\S]*height="64"/, 'avatar images should declare dimensions to reduce layout shift');
assert.match(page, /loading=\{index < 6 \? 'eager' : 'lazy'\}/, 'above-fold avatars should load eagerly while offscreen avatars stay lazy');
assert.match(page, /fetchpriority=\{index < 3 \? 'high' : 'auto'\}/, 'first visible avatars should get higher fetch priority');
assert.match(page, /contain:\s*layout paint/, 'cards should contain layout/paint without hiding visible content');
assert.match(page, /referrerpolicy="no-referrer"/, 'external profile images should avoid leaking referrers');
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
assert.doesNotMatch(page, /alumni-qr|data-alumni-qr|data-qr-src|qrImageHref|alumni-dialog|Profile QR|QR code/, 'QR UI and data should be removed from the route');
assert.doesNotMatch(page, /kind 0|updatedLabel|updatedAt|<time\b/, 'kind 0 date line should be removed');
assert.doesNotMatch(page, /alumni-card-foot/, 'old card footer line should be removed');
assert.doesNotMatch(page, /following\.space\/d\/sier9e7ih6k2[^"\s<]*["']\s*>\s*Alumni/, 'route should not be a bare external follow-list link');

const menu = JSON.parse(readFileSync('src/config/menu.json', 'utf8'));
const mainAlumni = menu.main.flatMap((item) => (Array.isArray(item.children) ? item.children : [item])).find((item) => item.name === 'Alumni');
const footerLinks = Array.isArray(menu.footer)
  ? menu.footer
  : menu.footer.sections.flatMap((section) => section.links);
const footerAlumni = footerLinks.find((item) => item.name === 'Alumni');

assert.equal(mainAlumni?.url, '/alumni', 'main Alumni nav should point to local route');
assert.equal(footerAlumni?.url, '/alumni', 'footer Alumni nav should point to local route');

console.log('OK: alumni page route source');
