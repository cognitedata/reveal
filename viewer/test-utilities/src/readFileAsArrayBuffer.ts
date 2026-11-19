/*!
 * Copyright 2026 Cognite AS
 */
import * as fs from 'fs';

/**
 * Reads a file into an ArrayBuffer containing exactly the file's bytes.
 *
 * `fs.readFileSync(...).buffer` must not be used for this: the Buffer may be a view into a larger,
 * shared ArrayBuffer (e.g. a 64 KiB block in Node 24), so `.buffer` can contain unrelated bytes
 * and start at a different offset than the file. Consumers that read at absolute offsets
 * (such as the GLB parser) would then fail.
 */
export function readFileAsArrayBuffer(filePath: string): ArrayBuffer {
  const buffer = fs.readFileSync(filePath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}
