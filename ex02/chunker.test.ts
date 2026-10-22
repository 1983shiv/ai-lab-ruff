import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fixedChunks, paragraphChunks, headingChunks } from './chunker.js';

const doc = readFileSync('data/helpdesk.md', 'utf8');

describe('chunkers', () => {
  it('empty text gives no chunks', () => {
    expect(fixedChunks('')).toEqual([]);
    expect(paragraphChunks('   ')).toEqual([]);
    expect(headingChunks('')).toEqual([]);
  });
  it('overlap bigger than size is rejected', () => {
    expect(() => fixedChunks('abc', 10, 10)).toThrow();
  });
  it('no chunk is longer than the limit', () => {
    for (const c of fixedChunks(doc, 200, 40)) expect(c.length).toBeLessThanOrEqual(200);
    for (const c of paragraphChunks(doc, 300)) expect(c.length).toBeLessThanOrEqual(300);
  });
  it('every section heading starts a chunk', () => {
    const chunks = headingChunks(doc);
    for (const h of ['Refunds', 'Shipping', 'Warranty', 'Account and password', 'Support hours']) {
      expect(chunks.some((c) => c.startsWith('## ' + h))).toBe(true);
    }
  });
  it('Windows line endings give the same result', () => {
    expect(headingChunks(doc.replace(/\n/g, '\r\n'))).toEqual(headingChunks(doc));
  });
});