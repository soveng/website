#!/usr/bin/env bun
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(import.meta.dirname, '..');
const validatorPath = join(repoRoot, 'scripts/validate-alumni-data.mjs');
const sourceRecord = JSON.parse(readFileSync(join(repoRoot, 'src/data/sovengAlumni.json'), 'utf8'))[0];

function runValidator(record) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'soveng-alumni-validator-'));
  try {
    mkdirSync(join(tempRoot, 'src/data'), { recursive: true });
    writeFileSync(join(tempRoot, 'src/data/sovengAlumni.json'), `${JSON.stringify([record], null, 2)}\n`);
    return spawnSync('node', [validatorPath], { cwd: tempRoot, encoding: 'utf8' });
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function cloneRecord() {
  return structuredClone(sourceRecord);
}

const valid = runValidator(cloneRecord());
assert.equal(valid.status, 0, valid.stderr);

const badSig = cloneRecord();
badSig.kind0.sig = 'a'.repeat(64);
assert.notEqual(runValidator(badSig).status, 0, '64-char kind0 signature must fail');

const badTag = cloneRecord();
badTag.kind0.tags = [['relay', 123]];
assert.notEqual(runValidator(badTag).status, 0, 'non-string kind0 tag entries must fail');

const badId = cloneRecord();
badId.kind0.content = JSON.stringify({ ...JSON.parse(badId.kind0.content), about: 'tampered' });
assert.notEqual(runValidator(badId).status, 0, 'tampered kind0 content must fail the event id hash check');

const badSource = cloneRecord();
badSource.source.membershipSourceUrl = 'https://example.com/not-the-approved-list';
assert.notEqual(runValidator(badSource).status, 0, 'unexpected membership source URL must fail');

const badRelay = cloneRecord();
badRelay.source.relayUrls = ['https://nos.lol'];
assert.notEqual(runValidator(badRelay).status, 0, 'non-wss relay URL must fail');

console.log('OK: alumni validator hardening');
