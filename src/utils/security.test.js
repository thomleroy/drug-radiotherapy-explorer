import {
  escapeCsvField,
  isSafeHttpUrl,
  readFavorites,
  writeFavorites,
  FAVORITES_STORAGE_KEY,
} from './security';

describe('escapeCsvField', () => {
  test('wraps plain strings in double quotes', () => {
    expect(escapeCsvField('cisplatin')).toBe('"cisplatin"');
  });

  test('neutralizes formula injection leading characters', () => {
    expect(escapeCsvField('=SUM(A1)')).toBe(`"'=SUM(A1)"`);
    expect(escapeCsvField('+1+1')).toBe(`"'+1+1"`);
    expect(escapeCsvField('-cmd')).toBe(`"'-cmd"`);
    expect(escapeCsvField('@evil')).toBe(`"'@evil"`);
    expect(escapeCsvField('\tleading-tab')).toBe(`"'\tleading-tab"`);
  });

  test('escapes embedded double quotes', () => {
    expect(escapeCsvField('He said "hi"')).toBe('"He said ""hi"""');
  });

  test('handles null, undefined and numbers', () => {
    expect(escapeCsvField(null)).toBe('""');
    expect(escapeCsvField(undefined)).toBe('""');
    expect(escapeCsvField(42)).toBe('"42"');
  });

  test('preserves commas and newlines inside quoted value', () => {
    expect(escapeCsvField('a, b\nc')).toBe('"a, b\nc"');
  });
});

describe('isSafeHttpUrl', () => {
  test.each([
    ['https://example.com', true],
    ['http://example.com/path?q=1', true],
    ['HTTPS://EXAMPLE.COM', true],
  ])('accepts %s', (url, expected) => {
    expect(isSafeHttpUrl(url)).toBe(expected);
  });

  test.each([
    ['javascript:alert(1)'],
    ['data:text/html,<script>'],
    ['vbscript:msgbox'],
    ['file:///etc/passwd'],
    ['ftp://example.com'],
    [''],
    [null],
    [undefined],
    [{}],
    [42],
    ['not a url'],
  ])('rejects %p', (value) => {
    expect(isSafeHttpUrl(value)).toBe(false);
  });
});

describe('readFavorites / writeFavorites', () => {
  const createMemoryStorage = () => {
    const map = new Map();
    return {
      getItem: (key) => (map.has(key) ? map.get(key) : null),
      setItem: (key, value) => map.set(key, String(value)),
      removeItem: (key) => map.delete(key),
      clear: () => map.clear(),
    };
  };

  test('returns an empty array when storage is empty', () => {
    const storage = createMemoryStorage();
    expect(readFavorites(storage)).toEqual([]);
  });

  test('round-trips a list of favorites', () => {
    const storage = createMemoryStorage();
    writeFavorites(['cisplatin', 'cetuximab'], storage);
    expect(readFavorites(storage)).toEqual(['cisplatin', 'cetuximab']);
  });

  test('ignores corrupted JSON payloads', () => {
    const storage = createMemoryStorage();
    storage.setItem(FAVORITES_STORAGE_KEY, '{not json');
    expect(readFavorites(storage)).toEqual([]);
  });

  test('ignores non-array JSON payloads', () => {
    const storage = createMemoryStorage();
    storage.setItem(FAVORITES_STORAGE_KEY, '{"foo":1}');
    expect(readFavorites(storage)).toEqual([]);
  });

  test('filters out unexpected item types', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(['cisplatin', 3, null, { n: 'bad' }, true])
    );
    expect(readFavorites(storage)).toEqual(['cisplatin', 3]);
  });

  test('tolerates storage returning null and quota errors', () => {
    expect(readFavorites(null)).toEqual([]);

    const brokenStorage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(readFavorites(brokenStorage)).toEqual([]);
    expect(() => writeFavorites(['x'], brokenStorage)).not.toThrow();
  });
});
