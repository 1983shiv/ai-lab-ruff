import { createHash } from "node:crypto"

export const chunkId = (text: string) => {
    createHash('sha1').update(text).digest('hex').slice(0, 16);
    }
const clean = (t: string) => t.replace(/\r\n/g, '\n');

    // Strategy A : fixed size with overlap
export function fixedChunks(text: string, size = 500, overlap = 100): string[]{
    if(overlap >= size){
        throw new Error('overlap must be smaller than size');
    }

    const t = clean(text);
    const out: string[] = [];
    for (let i = 0; i < t.length; i += size - overlap){
        const piece = t.slice(i, i + size).trim();
        if(piece) {out.push(piece)}
        if(i + size >= t.length){ break;}
            
    }
    return out;
}

// Strategy B: keep paragraphs together, up to a maximum size
export function paragraphChunks(text: string, max = 600): string[] {
  const paras = clean(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  let cur = '';
  for (const p of paras) {
    if (p.length > max) {
      if (cur) out.push(cur);
      cur = '';
      out.push(...fixedChunks(p, max, Math.floor(max / 5)));
    } else if (cur && (cur + '\n\n' + p).length > max) {
      out.push(cur);
      cur = p;
    } else {
      cur = cur ? cur + '\n\n' + p : p;
    }
  }
  if (cur) out.push(cur);
  return out;
}

// Strategy C: split by markdown headings and repeat the heading in every chunk
export function headingChunks(md: string, max = 800): string[] {
  const out: string[] = [];
  let heading = '';
  let body: string[] = [];
  const flush = () => {
    const text = body.join('\n').trim();
    if (text) for (const c of paragraphChunks(text, max)) out.push(heading ? heading + '\n' + c : c);
    body = [];
  };
  for (const line of clean(md).split('\n')) {
    if (/^#{1,3}\s/.test(line)) { flush(); heading = line.trim(); } else body.push(line);
  }
  flush();
  return out;
}