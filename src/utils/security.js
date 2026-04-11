// Security/sanitization helpers shared across the app.
// Keeping them in a standalone module makes them trivially testable.

/**
 * Escape a single field for CSV output. Protects against CSV injection
 * (formulas starting with =, +, -, @, \t, \r) and properly quotes values
 * containing ", , \n or \r. See OWASP CSV Injection.
 */
export const escapeCsvField = (value) => {
  const raw = value === undefined || value === null ? '' : String(value);
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
};

/**
 * Validate a URL string and only accept http/https. Anything else
 * (javascript:, data:, vbscript:, …) is rejected.
 */
export const isSafeHttpUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Defensive reader for the favorites list stored in localStorage.
 * Any corrupted or unexpected payload resolves to an empty array.
 */
export const FAVORITES_STORAGE_KEY = 'drug-explorer-favorites';

export const readFavorites = (storage = typeof window !== 'undefined' ? window.localStorage : null) => {
  if (!storage) return [];
  try {
    const raw = storage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => typeof item === 'string' || typeof item === 'number'
    );
  } catch {
    return [];
  }
};

export const writeFavorites = (
  favorites,
  storage = typeof window !== 'undefined' ? window.localStorage : null
) => {
  if (!storage) return;
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Quota exceeded or storage disabled: silently ignore.
  }
};
