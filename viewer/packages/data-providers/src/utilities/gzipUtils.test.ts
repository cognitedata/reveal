/*!
 * Copyright 2026 Cognite AS
 */

import { vi, afterEach } from 'vitest';
import { brotliCompressSync } from 'node:zlib';
import { decompressBinaryResponseBody, parseJsonResponseBody } from './gzipUtils';
import { gzipEncode } from '../../../../test-utilities/src/gzipEncode';

type StubBehavior = { kind: 'throw' } | { kind: 'streamError' } | { kind: 'emit'; chunks: Uint8Array[] };

function stubDecompressionStream(behavior: StubBehavior, tracker?: { formats: string[] }): void {
  vi.stubGlobal(
    'DecompressionStream',
    class {
      readable: ReadableStream<Uint8Array>;
      writable = new WritableStream<Uint8Array>();
      constructor(format: string) {
        tracker?.formats.push(format);
        if (behavior.kind === 'throw') throw new TypeError(`Unsupported format: ${format}`);
        this.readable = new ReadableStream<Uint8Array>({
          start(c) {
            if (behavior.kind === 'streamError') return c.error(new Error('stub'));
            behavior.chunks.forEach(chunk => c.enqueue(chunk));
            c.close();
          }
        });
      }
    }
  );
}

const data = { version: 9, sectors: [{ id: 1 }] };
const plainBinary = new Uint8Array([0xf0, 0x0d, 0xba, 0xad, 0xf0, 0x0d, 0xba, 0xad]);

describe(parseJsonResponseBody.name, () => {
  afterEach(() => vi.unstubAllGlobals());

  test.each([
    ['bare plain JSON', new Response(JSON.stringify(data))],
    [
      'plain JSON with Content-Encoding header (browser already decoded)',
      new Response(JSON.stringify(data), { headers: { 'content-encoding': 'gzip' } })
    ],
    ['plain JSON with leading whitespace', new Response('\n  ' + JSON.stringify(data))]
  ])('parses %s without invoking DecompressionStream', async (_label, response) => {
    const tracker = { formats: [] as string[] };
    stubDecompressionStream({ kind: 'throw' }, tracker);
    expect(await parseJsonResponseBody(response)).toEqual(data);
    expect(tracker.formats).toEqual([]);
  });

  test('decompresses a gzip body even without a Content-Encoding header', async () => {
    expect(await parseJsonResponseBody(new Response(await gzipEncode(JSON.stringify(data))))).toEqual(data);
  });

  test('routes non-JSON, non-gzip bodies through the brotli decoder even when input starts with a JSON structural byte', async () => {
    const tracker = { formats: [] as string[] };
    stubDecompressionStream({ kind: 'emit', chunks: [new TextEncoder().encode(JSON.stringify(data))] }, tracker);
    const result = await parseJsonResponseBody(new Response(new Uint8Array([0x5b, 0xde, 0xad, 0xbe, 0xef])));
    expect(tracker.formats).toEqual(['br']);
    expect(result).toEqual(data);
  });

  test.each([
    [
      'gzip magic bytes are present but the body is not valid gzip',
      new Uint8Array([0x1f, 0x8b, 0x22, 0x68, 0x69, 0x22]),
      /has gzip magic bytes but decompression failed/
    ],
    [
      'body is neither plain JSON, gzip, nor valid brotli',
      new Uint8Array([0xce, 0xb2, 0x81, 0x04]),
      /(?:is neither plain JSON, gzip, nor valid brotli|decompressed as brotli but is not valid JSON)/
    ]
  ])('throws a descriptive error when %s', async (_label, payload, expectedError) => {
    await expect(parseJsonResponseBody(new Response(payload))).rejects.toThrow(expectedError);
  });
});

describe(decompressBinaryResponseBody.name, () => {
  afterEach(() => vi.unstubAllGlobals());

  const expanded = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const shortInput = new Uint8Array([0x11, 0x22, 0x33, 0x44]);
  const brotliText = 'the quick brown fox jumps over the lazy dog. '.repeat(200);
  const brotliBytes = new Uint8Array(brotliCompressSync(Buffer.from(brotliText)));
  const brotliTextBytes = new TextEncoder().encode(brotliText);

  test.each([
    ['plain binary, no header', new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee]), undefined],
    [
      'plain binary with a stale Content-Encoding header',
      new Uint8Array([1, 2, 3, 4, 5]),
      { 'content-encoding': 'gzip' }
    ]
  ])('returns %s verbatim', async (_label, payload, headers) => {
    const response = new Response(payload, headers ? { headers } : undefined);
    expect(new Uint8Array(await decompressBinaryResponseBody(response))).toEqual(payload);
  });

  test('throws a descriptive error when gzip magic bytes are present but decompression fails', async () => {
    await expect(
      decompressBinaryResponseBody(new Response(new Uint8Array([0x1f, 0x8b, 0x00, 0x01, 0x02, 0x03])))
    ).rejects.toThrow(/has gzip magic bytes but decompression failed/);
  });

  test.each<[string, Uint8Array, StubBehavior, Uint8Array]>([
    ['native errors', plainBinary, { kind: 'streamError' }, plainBinary],
    ['native emits empty (size-gate)', plainBinary, { kind: 'emit', chunks: [new Uint8Array([])] }, plainBinary],
    ['no `br` on non-brotli input', plainBinary, { kind: 'throw' }, plainBinary],
    ['native emits larger than input', shortInput, { kind: 'emit', chunks: [expanded] }, expanded],
    ['no `br` + pure-JS decodes real brotli', brotliBytes, { kind: 'throw' }, brotliTextBytes]
  ])('brotli branch: %s', async (_label, input, behavior, expected) => {
    stubDecompressionStream(behavior);
    expect(new Uint8Array(await decompressBinaryResponseBody(new Response(input as BodyInit)))).toEqual(expected);
  });
});
