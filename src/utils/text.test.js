import {
  getCellColor,
  hasMeaningfulReferences,
  parseReferenceTokens,
  formatDataDate,
} from './text';

describe('getCellColor', () => {
  const greenLight = 'bg-green-100 text-green-800';
  const yellowLight = 'bg-yellow-100 text-yellow-800';
  const redLight = 'bg-red-100 text-red-800';

  test.each([
    ['0', greenLight],
    ['0 (except thoracic irradiation: 24h)', greenLight],
    ['0 (except IV)', greenLight],
  ])('green for "%s"', (value, expected) => {
    expect(getCellColor(value, false)).toBe(expected);
  });

  test.each([
    ['24h', yellowLight],
    ['48h', yellowLight],
    ['24h to 48h', yellowLight],
    ['1.5h', yellowLight],
  ])('yellow for "%s" (≤48h)', (value, expected) => {
    expect(getCellColor(value, false)).toBe(expected);
  });

  test.each([
    ['72h', redLight],
    ['127h', redLight],
    ['3 days', redLight],
    ['7 days', redLight],
    ['21 days', redLight],
    ['2 weeks', redLight],
    ['5 days, 2 weeks if IT', redLight],
  ])('red for "%s" (>48h)', (value, expected) => {
    expect(getCellColor(value, false)).toBe(expected);
  });

  test('returns dark-mode classes when isDark=true', () => {
    expect(getCellColor('24h', true)).toBe('bg-yellow-900/30 text-yellow-300');
    expect(getCellColor('3 days', true)).toBe('bg-red-900/30 text-red-300');
    expect(getCellColor('0', true)).toBe('bg-green-900/30 text-green-300');
  });

  test('returns "" for non-string or unrecognized input', () => {
    expect(getCellColor(undefined)).toBe('');
    expect(getCellColor(null)).toBe('');
    expect(getCellColor(42)).toBe('');
    expect(getCellColor('')).toBe('');
    expect(getCellColor('No concomitant association: an expert opinion is required before irradiation')).toBe('');
  });
});

describe('hasMeaningfulReferences', () => {
  test('true when at least one numeric token is present', () => {
    expect(hasMeaningfulReferences('[228,229]')).toBe(true);
    expect(hasMeaningfulReferences('228')).toBe(true);
  });

  test('false for None / N/A sentinels and empty input', () => {
    expect(hasMeaningfulReferences('[None]')).toBe(false);
    expect(hasMeaningfulReferences('None')).toBe(false);
    expect(hasMeaningfulReferences('N/A')).toBe(false);
    expect(hasMeaningfulReferences('')).toBe(false);
    expect(hasMeaningfulReferences(undefined)).toBe(false);
    expect(hasMeaningfulReferences(null)).toBe(false);
  });
});

describe('parseReferenceTokens', () => {
  test('returns clean tokens stripping brackets and whitespace', () => {
    expect(parseReferenceTokens('[228, 229, 230]')).toEqual(['228', '229', '230']);
  });

  test('drops sentinel tokens', () => {
    expect(parseReferenceTokens('[228, None, 229]')).toEqual(['228', '229']);
    expect(parseReferenceTokens('[None]')).toEqual([]);
  });

  test('returns [] for non-strings', () => {
    expect(parseReferenceTokens(null)).toEqual([]);
    expect(parseReferenceTokens(undefined)).toEqual([]);
  });
});

describe('formatDataDate', () => {
  test('formats ISO strings as YYYY-MM-DD', () => {
    expect(formatDataDate('2025-12-10T23:26:01+01:00')).toBe('2025-12-10');
    expect(formatDataDate('2026-01-15T00:00:00Z')).toBe('2026-01-15');
  });

  test('returns "" for invalid input', () => {
    expect(formatDataDate('')).toBe('');
    expect(formatDataDate(null)).toBe('');
    expect(formatDataDate(undefined)).toBe('');
    expect(formatDataDate('not a date')).toBe('');
  });
});
