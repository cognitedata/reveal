export function createSimpleHash(parts: string[]): string {
  let h = 0x811c9dc5;
  const SEP = "\u001F";
  for (const p of parts) {
    h = fnv1a32(p, h);
    h = fnv1a32(SEP, h);
  }
  return h.toString(16).padStart(8, "0");
}

function fnv1a32(input: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}
