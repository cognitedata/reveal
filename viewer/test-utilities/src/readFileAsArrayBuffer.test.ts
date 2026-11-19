/*!
 * Copyright 2026 Cognite AS
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, afterAll } from 'vitest';
import { Mock, It } from 'moq.ts';
import { readFileAsArrayBuffer } from './readFileAsArrayBuffer';

describe(readFileAsArrayBuffer.name, () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reveal-read-file-as-array-buffer-'));
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function createReadFileMock(buffer: Buffer): (filePath: string) => Buffer {
    return new Mock<(filePath: string) => Buffer>()
      .setup(instance => instance(It.IsAny()))
      .returns(buffer)
      .object();
  }

  function writeTempFile(name: string, content: Uint8Array): string {
    const filePath = path.join(tempDir, name);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  test('returns an ArrayBuffer with exactly the bytes of the file', () => {
    const content = Uint8Array.from([0x67, 0x6c, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00, 0xff]);
    const filePath = writeTempFile('bytes.bin', content);

    const result = readFileAsArrayBuffer(filePath);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(content.byteLength);
    expect(Array.from(new Uint8Array(result))).toEqual(Array.from(content));
  });

  test('returns an empty ArrayBuffer for an empty file', () => {
    const filePath = writeTempFile('empty.bin', new Uint8Array(0));

    const result = readFileAsArrayBuffer(filePath);

    expect(result.byteLength).toBe(0);
  });

  test('returns exactly the file bytes when the Buffer is a view into a larger shared ArrayBuffer', () => {
    const content = Uint8Array.from([1, 2, 3, 4, 5]);
    const poolOffset = 100;
    const pool = new Uint8Array(65536).fill(0xaa);
    pool.set(content, poolOffset);
    const pooledBuffer = Buffer.from(pool.buffer, poolOffset, content.byteLength);
    const readFile = createReadFileMock(pooledBuffer);

    const result = readFileAsArrayBuffer('some-file.bin', readFile);

    expect(result.byteLength).toBe(content.byteLength);
    expect(Array.from(new Uint8Array(result))).toEqual(Array.from(content));
  });

  test('returned ArrayBuffer does not share memory with the underlying Buffer', () => {
    const content = Uint8Array.from([1, 2, 3, 4, 5]);
    const pool = new Uint8Array(1024);
    pool.set(content, 10);
    const pooledBuffer = Buffer.from(pool.buffer, 10, content.byteLength);
    const readFile = createReadFileMock(pooledBuffer);

    const result = readFileAsArrayBuffer('some-file.bin', readFile);
    new Uint8Array(result)[0] = 99;

    expect(pooledBuffer[0]).toBe(1);
  });

  test('reads a GLB fixture so that the GLB magic header is at the start of the buffer', () => {
    const glbPath = path.resolve(import.meta.dirname, '../../packages/sector-loader/tests/test.glb');

    const result = readFileAsArrayBuffer(glbPath);

    expect(result.byteLength).toBe(fs.statSync(glbPath).size);
    expect(new TextDecoder().decode(new Uint8Array(result, 0, 4))).toBe('glTF');
  });
});
