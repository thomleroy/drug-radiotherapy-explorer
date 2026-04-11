// Stable identifiers for the drug catalog. We derive a slug from the drug
// name + class so React keys, favorites and shareable URLs reference a
// stable handle even when the dataset is reordered. The original drug.name
// remains the canonical display label.
import { allDrugs as rawAllDrugs } from '../data/drugs';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const seen = new Map();

export const allDrugs = rawAllDrugs.map((drug) => {
  const base = `${slugify(drug.name)}-${slugify(drug.class || 'na')}`;
  const count = (seen.get(base) ?? 0) + 1;
  seen.set(base, count);
  const id = count === 1 ? base : `${base}-${count}`;
  return { ...drug, id };
});

export const drugById = new Map(allDrugs.map((drug) => [drug.id, drug]));
