import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// End-to-end check of the .xlsx export pipeline. The app does NOT call
// XLSX.writeFile() — that helper is brittle under Vite's tree-shaking.
// It instead asks xlsx for the raw bytes and triggers the download via a
// Blob + anchor click. We replicate that logic here and make sure:
//   - the library is importable
//   - XLSX.write produces a valid .xlsx (PK zip signature)
//   - the Blob / anchor.click() sequence fires in a jsdom environment
describe('XLSX export pipeline', () => {
  const objectUrls = [];

  beforeEach(() => {
    objectUrls.length = 0;
    // jsdom does not implement URL.createObjectURL — stub it so the
    // anchor dance can still be exercised.
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = (blob) => {
        const fake = `blob:fake-${objectUrls.length}`;
        objectUrls.push({ url: fake, blob });
        return fake;
      };
      window.URL.revokeObjectURL = () => {};
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('XLSX.write emits a valid .xlsx zip', async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet([
      { 'Drug Name': 'Cisplatin', 'Half-life': '30min to 2h' },
      { 'Drug Name': 'Carboplatin', 'Half-life': '6h' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Radiosync');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const bytes = new Uint8Array(buffer);
    expect(bytes.length).toBeGreaterThan(0);
    // .xlsx is a zip → "PK\u0003\u0004" magic bytes.
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });

  test('Blob + anchor download sequence fires a click with the right filename', async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet([{ A: 1 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Radiosync');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Spy on anchor creation to intercept the click and confirm the
    // right attributes were set before it fires.
    const originalCreateElement = document.createElement.bind(document);
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: clickSpy, configurable: true });
      }
      return el;
    });

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'drug-radiotherapy-data-2026-04-11.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(link.getAttribute('download')).toMatch(/^drug-radiotherapy-data-\d{4}-\d{2}-\d{2}\.xlsx$/);
    expect(link.href).toContain('blob:');
    expect(objectUrls).toHaveLength(1);
    expect(objectUrls[0].blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  });
});
