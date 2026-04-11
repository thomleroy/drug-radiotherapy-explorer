// Pure text/data helpers shared by the drug explorer UI.
// Kept dependency-free so they can be unit tested in isolation.

import React from 'react';

// Map a free-text radiotherapy delay to a Tailwind class (background +
// foreground) representing the urgency of the delay. Defensive against
// non-string inputs.
//
// Color semantics (matches the on-screen legend):
//   green  → no delay required ("0", "0 (except …)")
//   yellow → short delay, ≤ 48h
//   red    → long delay, > 48h (counted in days/weeks or hours > 48)
export const getCellColor = (value, isDark = false) => {
  if (typeof value !== 'string') return '';
  const v = value.trim();

  // Green: explicit "0" or "0 (except …)" — no delay required.
  if (v === '0' || /^0\s*\(/.test(v)) {
    return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
  }

  // Red: anything counted in days or weeks is by definition > 48h.
  if (/\b(day|days|week|weeks)\b/i.test(v)) {
    return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
  }

  // Hours: take the largest hour value present so ranges like "24h to 48h"
  // bucket on their upper bound. ≤ 48h → yellow (short delay), > 48h → red.
  const hourMatches = [...v.matchAll(/(\d+(?:\.\d+)?)\s*h\b/gi)];
  if (hourMatches.length > 0) {
    const maxHours = Math.max(...hourMatches.map((m) => parseFloat(m[1])));
    if (Number.isFinite(maxHours)) {
      if (maxHours <= 48) {
        return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      }
      return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
    }
  }

  return '';
};

// Highlight a substring match (case-insensitive) by wrapping it in a <mark>.
// Returns plain text when there is nothing to highlight, or an array of
// React nodes otherwise.
export const highlightMatch = (text, query) => {
  if (!query || typeof text !== 'string' || typeof query !== 'string') return text;
  const q = query.trim();
  if (q.length === 0) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + needle.length);
  const after = text.slice(idx + needle.length);
  return [
    before,
    React.createElement(
      'mark',
      {
        key: 'hl',
        className: 'bg-yellow-200 text-inherit rounded px-0.5 dark:bg-yellow-600/50',
      },
      match
    ),
    after,
  ];
};

// Some catalog entries use "[None]" / "None" / "N/A" as a sentinel meaning
// "no bibliography for this molecule". Returns true only when at least one
// real reference token is present.
const NONE_TOKENS = new Set(['none', 'na', 'n/a']);

export const hasMeaningfulReferences = (raw) => {
  if (typeof raw !== 'string' || raw.length === 0) return false;
  return raw
    .split(',')
    .map((token) => token.replace(/[[\]]/g, '').trim())
    .filter(Boolean)
    .some((token) => !NONE_TOKENS.has(token.toLowerCase()));
};

// Parse a free-text "references" string into a clean array of reference
// numbers, dropping empty/sentinel tokens.
export const parseReferenceTokens = (raw) => {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((token) => token.replace(/[[\]]/g, '').trim())
    .filter(Boolean)
    .filter((token) => !NONE_TOKENS.has(token.toLowerCase()));
};

// Format an ISO date string as YYYY-MM-DD; returns "" for invalid input.
export const formatDataDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};
