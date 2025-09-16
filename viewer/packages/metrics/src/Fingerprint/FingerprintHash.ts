// cyrb53 hashing algorythm
export function hashFingerprint(str: string, seed = 0) {
  let firstPointer = 0xdeadbeef ^ seed,
      secondPointer = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      firstPointer = Math.imul(firstPointer ^ ch, 2654435761);
      secondPointer = Math.imul(secondPointer ^ ch, 1597334677);
  }
  firstPointer = Math.imul(firstPointer ^ (firstPointer >>> 16), 2246822507) ^ Math.imul(secondPointer ^ (secondPointer >>> 13), 3266489909);
  secondPointer = Math.imul(secondPointer ^ (secondPointer >>> 16), 2246822507) ^ Math.imul(firstPointer ^ (firstPointer >>> 13), 3266489909);
  return 4294967296 * (2097151 & secondPointer) + (firstPointer >>> 0);
}