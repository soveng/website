#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const pagePath = 'src/pages/alumni.astro';
assert.equal(existsSync(pagePath), true, '/alumni route must exist');

const page = readFileSync(pagePath, 'utf8');
assert.match(page, /<Base[\s\S]*meta_title="SovEng Alumni"/, 'alumni page should set Base metadata');
assert.match(page, /getSovEngAlumniStats/, 'alumni route should render source-locked stats');
assert.match(page, /hasSourceLockedAssociationData/, 'alumni route should expose the association gate state');
assert.doesNotMatch(page, /following\.space\/d\/sier9e7ih6k2[^"\s<]*["']\s*>\s*Alumni/, 'route should not be a bare external follow-list link');

const menu = JSON.parse(readFileSync('src/config/menu.json', 'utf8'));
const mainAlumni = menu.main.flatMap((item) => (Array.isArray(item.children) ? item.children : [item])).find((item) => item.name === 'Alumni');
const footerAlumni = menu.footer.find((item) => item.name === 'Alumni');

assert.equal(mainAlumni?.url, '/alumni', 'main Alumni nav should point to local route');
assert.equal(footerAlumni?.url, '/alumni', 'footer Alumni nav should point to local route');

console.log('OK: alumni page route source');
