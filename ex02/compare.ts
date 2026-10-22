import { readFileSync } from 'node:fs';
import { fixedChunks, paragraphChunks, headingChunks } from './chunker.js';

const doc = readFileSync('data/helpdesk.md', 'utf8');
const key = 'Gift cards and downloadable software cannot be refunded.';
const strategies = {
  'fixed 200/40': fixedChunks(doc, 200, 40),
  'paragraph 300': paragraphChunks(doc, 300),
  'heading 800': headingChunks(doc, 800),
};
for (const [name, chunks] of Object.entries(strategies)) {
  const avg = Math.round(chunks.reduce((s, c) => s + c.length, 0) / chunks.length);
  const whole = chunks.some((c) => c.includes(key));
  console.log(name.padEnd(16), 'chunks:', chunks.length, '| avg length:', avg, '| key sentence whole:', whole);
}
4. 