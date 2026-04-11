#!/usr/bin/env node
/* eslint-disable no-console */
// Sanity check the drug catalog before shipping. Run via `npm run validate:data`.
//
// Checks performed:
//   - every entry has the required fields
//   - drug.category is one of the known buckets
//   - the slugified id (name + class) is unique
//   - every reference number listed in drug.references exists in references.js
//   - no orphan references (each entry in references.js is cited at least once)
//
// Exits with code 1 on the first batch of failures so it can gate CI.

const path = require('path');
const url = require('url');

const REQUIRED_FIELDS = [
  'name',
  'commercial',
  'class',
  'category',
  'halfLife',
  'normofractionatedRT',
  'palliativeRT',
  'stereotacticRT',
  'intracranialRT',
];
const ALLOWED_CATEGORIES = new Set([
  'chemotherapy',
  'endocrine',
  'targeted',
  'immunotherapy',
]);

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Some drug entries use "[None]" or "None" as an explicit sentinel meaning
// "no bibliography for this molecule". Treat that as a valid empty list.
const NONE_TOKENS = new Set(['none', 'na', 'n/a']);

const parseRefNumbers = (raw) => {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((token) => token.replace(/[[\]\s]/g, ''))
    .filter(Boolean)
    .filter((token) => !NONE_TOKENS.has(token.toLowerCase()));
};

(async () => {
  const drugsPath = path.resolve(__dirname, '..', 'src', 'data', 'drugs.js');
  const refsPath = path.resolve(__dirname, '..', 'src', 'data', 'references.js');

  const drugsModule = await import(url.pathToFileURL(drugsPath).href);
  const refsModule = await import(url.pathToFileURL(refsPath).href);

  const allDrugs = drugsModule.allDrugs;
  const referencesData = refsModule.referencesData;

  if (!Array.isArray(allDrugs)) {
    console.error('FAIL: drugs.js does not export an `allDrugs` array');
    process.exit(1);
  }
  if (!referencesData || typeof referencesData !== 'object') {
    console.error('FAIL: references.js does not export a `referencesData` object');
    process.exit(1);
  }

  const errors = [];
  const idCounts = new Map();
  const citedRefs = new Set();

  allDrugs.forEach((drug, index) => {
    const where = `drug #${index} (${drug?.name ?? '<unnamed>'})`;

    REQUIRED_FIELDS.forEach((field) => {
      if (drug[field] === undefined || drug[field] === null || drug[field] === '') {
        errors.push(`${where}: missing required field "${field}"`);
      }
    });

    if (drug.category && !ALLOWED_CATEGORIES.has(drug.category)) {
      errors.push(`${where}: unknown category "${drug.category}"`);
    }

    const slug = `${slugify(drug.name)}-${slugify(drug.class || 'na')}`;
    idCounts.set(slug, (idCounts.get(slug) ?? 0) + 1);

    parseRefNumbers(drug.references).forEach((refNumber) => {
      citedRefs.add(refNumber);
      if (!Object.prototype.hasOwnProperty.call(referencesData, refNumber)) {
        errors.push(`${where}: references.js has no entry for [${refNumber}]`);
      }
    });
  });

  // Duplicate slug warning (only when more than one entry collapses to the
  // same slug — the runtime falls back to a numeric suffix but uniqueness
  // at the source is preferable).
  for (const [slug, count] of idCounts.entries()) {
    if (count > 1) {
      errors.push(`duplicate slug "${slug}" generated for ${count} drugs`);
    }
  }

  // Orphan references (uncited) — non-fatal warning, just reported.
  const orphanRefs = Object.keys(referencesData).filter((id) => !citedRefs.has(id));

  if (errors.length > 0) {
    console.error('Drug catalog validation FAILED:');
    errors.forEach((err) => console.error(`  - ${err}`));
    if (orphanRefs.length > 0) {
      console.error(`(also: ${orphanRefs.length} orphan references not cited by any drug)`);
    }
    process.exit(1);
  }

  console.log(`OK: ${allDrugs.length} drugs, ${Object.keys(referencesData).length} references`);
  if (orphanRefs.length > 0) {
    console.log(`Note: ${orphanRefs.length} orphan references (uncited) — not blocking.`);
  }
})().catch((err) => {
  console.error('Validation crashed:', err);
  process.exit(2);
});
