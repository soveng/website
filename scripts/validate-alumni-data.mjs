#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requireAssociations = process.argv.includes('--require-associations');
const alumniPath = join(root, 'src/data/sovengAlumni.json');
const associationsPath = join(root, 'src/data/sovengAlumniAssociations.json');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${path}: ${error.message}`);
    return undefined;
  }
}

function isHex64(value) {
  return typeof value === 'string' && /^[0-9a-f]{64}$/i.test(value);
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function isNpub(value) {
  return typeof value === 'string' && /^npub1[023456789acdefghjklmnpqrstuvwxyz]+$/.test(value);
}

function bech32Polymod(values) {
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let checksum = 1;
  for (const value of values) {
    const top = checksum >> 25;
    checksum = ((checksum & 0x1ffffff) << 5) ^ value;
    for (let index = 0; index < 5; index += 1) {
      if ((top >> index) & 1) checksum ^= generators[index];
    }
  }
  return checksum;
}

function bech32HrpExpand(hrp) {
  const values = [];
  for (const char of hrp) values.push(char.charCodeAt(0) >> 5);
  values.push(0);
  for (const char of hrp) values.push(char.charCodeAt(0) & 31);
  return values;
}

function convertBits(data, fromBits, toBits, pad) {
  let accumulator = 0;
  let bits = 0;
  const result = [];
  const maxValue = (1 << toBits) - 1;
  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) return undefined;
    accumulator = (accumulator << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((accumulator >> bits) & maxValue);
    }
  }
  if (pad) {
    if (bits > 0) result.push((accumulator << (toBits - bits)) & maxValue);
  } else if (bits >= fromBits || ((accumulator << (toBits - bits)) & maxValue) !== 0) {
    return undefined;
  }
  return result;
}

function decodeNpubToHex(npub) {
  if (!isNpub(npub)) return undefined;
  if (npub !== npub.toLowerCase()) return undefined;
  const separatorIndex = npub.lastIndexOf('1');
  const hrp = npub.slice(0, separatorIndex);
  if (hrp !== 'npub') return undefined;
  const dataPart = npub.slice(separatorIndex + 1);
  const data = [...dataPart].map((char) => BECH32_CHARSET.indexOf(char));
  if (data.some((value) => value === -1) || data.length < 6) return undefined;
  if (bech32Polymod([...bech32HrpExpand(hrp), ...data]) !== 1) return undefined;
  const bytes = convertBits(data.slice(0, -6), 5, 8, false);
  if (!bytes || bytes.length !== 32) return undefined;
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parseMetadata(record, index) {
  try {
    const parsed = JSON.parse(record.kind0.content);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail(`alumni[${index}]: kind0.content is not a JSON object`);
      return {};
    }
    return parsed;
  } catch (error) {
    fail(`alumni[${index}]: kind0.content does not parse as JSON: ${error.message}`);
    return {};
  }
}

function asOptionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function validateDerivedField(record, metadata, recordField, metadataFields, index) {
  if (!(recordField in record)) return;
  const expected = metadataFields.map((field) => asOptionalString(metadata[field])).find(Boolean);
  if (expected === undefined) return;
  if (record[recordField] !== expected) {
    fail(`alumni[${index}]: ${recordField} is not derived from kind0.content`);
  }
}

function validateHttpsUrl(value, label) {
  if (value === undefined) return;
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${label}: URL must be a non-empty string`);
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') fail(`${label}: URL must be HTTPS`);
    if (!url.hostname) fail(`${label}: URL must have a hostname`);
    if (url.username || url.password) fail(`${label}: URL must not contain credentials`);
  } catch {
    fail(`${label}: URL is malformed`);
  }
}

const alumni = readJson(alumniPath);

if (Array.isArray(alumni)) {
  const pubkeys = new Set();
  const npubs = new Set();

  alumni.forEach((record, index) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      fail(`alumni[${index}]: record must be an object`);
      return;
    }

    if (!isHex64(record.pubkey)) fail(`alumni[${index}]: pubkey must be 64-char hex`);
    if (!isNpub(record.npub)) fail(`alumni[${index}]: npub must be bech32 npub`);
    const decodedPubkey = decodeNpubToHex(record.npub);
    if (decodedPubkey === undefined) fail(`alumni[${index}]: npub checksum/encoding is invalid`);
    if (decodedPubkey !== undefined && decodedPubkey !== record.pubkey) {
      fail(`alumni[${index}]: npub does not encode record.pubkey`);
    }

    if (pubkeys.has(record.pubkey)) fail(`alumni[${index}]: duplicate pubkey ${record.pubkey}`);
    if (npubs.has(record.npub)) fail(`alumni[${index}]: duplicate npub ${record.npub}`);
    pubkeys.add(record.pubkey);
    npubs.add(record.npub);

    if (!record.kind0 || typeof record.kind0 !== 'object' || Array.isArray(record.kind0)) {
      fail(`alumni[${index}]: missing preserved kind0 event`);
      return;
    }

    const event = record.kind0;
    if (!isHex64(event.id)) fail(`alumni[${index}]: kind0.id must be 64-char hex`);
    if (event.kind !== 0) fail(`alumni[${index}]: kind0.kind must be 0`);
    if (event.pubkey !== record.pubkey) fail(`alumni[${index}]: kind0.pubkey must match record.pubkey`);
    if (!Number.isInteger(event.created_at) || event.created_at <= 0) fail(`alumni[${index}]: kind0.created_at must be a positive integer`);
    if (!Array.isArray(event.tags) || event.tags.some((tag) => !Array.isArray(tag))) fail(`alumni[${index}]: kind0.tags must be string[][]`);
    if (typeof event.content !== 'string') fail(`alumni[${index}]: kind0.content must be a string`);
    if (!isHex64(event.sig) && !(typeof event.sig === 'string' && /^[0-9a-f]{128}$/i.test(event.sig))) fail(`alumni[${index}]: kind0.sig must be 128-char hex`);

    const metadata = parseMetadata(record, index);
    validateDerivedField(record, metadata, 'name', ['name'], index);
    validateDerivedField(record, metadata, 'displayName', ['display_name', 'displayName'], index);
    validateDerivedField(record, metadata, 'about', ['about'], index);
    validateDerivedField(record, metadata, 'picture', ['picture'], index);
    validateDerivedField(record, metadata, 'nip05', ['nip05'], index);
    validateHttpsUrl(asOptionalString(metadata.picture), `alumni[${index}].kind0.content.picture`);

    if (!record.source || typeof record.source !== 'object' || Array.isArray(record.source)) {
      fail(`alumni[${index}]: missing source provenance`);
    } else {
      validateHttpsUrl(record.source.membershipSourceUrl, `alumni[${index}].source.membershipSourceUrl`);
      if (!Array.isArray(record.source.relayUrls) || record.source.relayUrls.length === 0) {
        fail(`alumni[${index}]: source.relayUrls must be a non-empty array`);
      }
      if (typeof record.source.fetchedAt !== 'string' || Number.isNaN(Date.parse(record.source.fetchedAt))) {
        fail(`alumni[${index}]: source.fetchedAt must be an ISO date string`);
      }
    }
  });

  if (!existsSync(associationsPath)) {
    const message = 'src/data/sovengAlumniAssociations.json is missing; SEC/project/tag chips remain blocked until source-approved associations exist';
    requireAssociations ? fail(message) : warn(message);
  } else {
    const associations = readJson(associationsPath);
    if (Array.isArray(associations)) {
      const associationPubkeys = new Set();
      associations.forEach((record, index) => {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
          fail(`associations[${index}]: record must be an object`);
          return;
        }
        if (!isHex64(record.pubkey)) fail(`associations[${index}]: pubkey must be 64-char hex`);
        if (!isNpub(record.npub)) fail(`associations[${index}]: npub must be bech32 npub`);
        if (!pubkeys.has(record.pubkey)) fail(`associations[${index}]: pubkey not present in alumni data`);
        if (associationPubkeys.has(record.pubkey)) fail(`associations[${index}]: duplicate pubkey ${record.pubkey}`);
        associationPubkeys.add(record.pubkey);
        if (!Array.isArray(record.secs)) fail(`associations[${index}]: secs must be an array`);
        if (!Array.isArray(record.tags)) fail(`associations[${index}]: tags must be an array`);
        if (!Array.isArray(record.projects)) fail(`associations[${index}]: projects must be an array`);
        if (typeof record.source !== 'string' || !record.source.trim()) fail(`associations[${index}]: source is required`);
        record.secs?.forEach((sec, secIndex) => {
          if (typeof sec !== 'string' || !/^SEC-\d{2}$/.test(sec)) fail(`associations[${index}].secs[${secIndex}]: expected SEC-XX`);
        });
        record.tags?.forEach((tag, tagIndex) => {
          if (typeof tag !== 'string' || !tag.trim()) fail(`associations[${index}].tags[${tagIndex}]: tag must be non-empty string`);
        });
        record.projects?.forEach((project, projectIndex) => {
          if (!project || typeof project !== 'object' || Array.isArray(project)) {
            fail(`associations[${index}].projects[${projectIndex}]: project must be an object`);
            return;
          }
          if (typeof project.name !== 'string' || !project.name.trim()) fail(`associations[${index}].projects[${projectIndex}]: name is required`);
          if (!Array.isArray(project.tags)) fail(`associations[${index}].projects[${projectIndex}]: tags must be an array`);
          if (typeof project.source !== 'string' || !project.source.trim()) fail(`associations[${index}].projects[${projectIndex}]: source is required`);
          if (project.href !== undefined) validateHttpsUrl(project.href, `associations[${index}].projects[${projectIndex}].href`);
        });
      });
      if (requireAssociations && associationPubkeys.size !== pubkeys.size) {
        fail(`association coverage incomplete: ${associationPubkeys.size}/${pubkeys.size} alumni have association records`);
      }
    } else if (associations !== undefined) {
      fail('src/data/sovengAlumniAssociations.json must contain an array');
    }
  }
} else if (alumni !== undefined) {
  fail('src/data/sovengAlumni.json must contain an array');
}

warnings.forEach((message) => console.warn(`WARN: ${message}`));

if (errors.length > 0) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  process.exit(1);
}

console.log(`OK: validated ${Array.isArray(alumni) ? alumni.length : 0} alumni records${requireAssociations ? ' with required associations' : ''}`);
