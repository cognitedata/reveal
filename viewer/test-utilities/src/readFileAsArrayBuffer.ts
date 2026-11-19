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
 *
 * @param filePath Path of the file to read.
 * @param readFile Function used to read the file. Defaults to `fs.readFileSync`; only override in tests.
 */
export function readFileAsArrayBuffer(
  filePath: string,
  readFile: (filePath: string) => Buffer = fs.readFileSync
): ArrayBuffer {
  const buffer = readFile(filePath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}
