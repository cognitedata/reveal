/*!
 * Copyright 2026 Cognite AS
 */

import './brotliDecompressTypes';
import brotliDecompress from 'brotli/decompress';

const GZIP_MAGIC_BYTE_0 = 0x1f;
const GZIP_MAGIC_BYTE_1 = 0x8b;

function isGzipCompressed(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === GZIP_MAGIC_BYTE_0 && bytes[1] === GZIP_MAGIC_BYTE_1;
}

async function decompressWithStream(bytes: Uint8Array, stream: DecompressionStream): Promise<Uint8Array> {
  const decompressedStream = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(decompressedStream).arrayBuffer());
}

async function decompressGzip(bytes: Uint8Array): Promise<Uint8Array> {
  return decompressWithStream(bytes, new DecompressionStream('gzip'));
}

// 'br' is valid at runtime in Chromium but missing from this TS lib's CompressionFormat type.
type SupportedCompressionFormat = CompressionFormat | 'br';

function createNativeBrotliStream(): DecompressionStream | undefined {
  try {
    return new DecompressionStream('br' as SupportedCompressionFormat as CompressionFormat);
  } catch {
    // Firefox < 127, Safari < 17.4, Chromium < 124 throw on unsupported format.
    return undefined;
  }
}

async function decompressBrotli(bytes: Uint8Array): Promise<Uint8Array> {
  const nativeStream = createNativeBrotliStream();
  if (nativeStream !== undefined) {
    return decompressWithStream(bytes, nativeStream);
  }
  return brotliDecompress(bytes);
}

async function tryDecompressBrotliWithSizeGate(bytes: Uint8Array): Promise<Uint8Array | undefined> {
  const nativeStream = createNativeBrotliStream();
  if (nativeStream !== undefined) {
    try {
      const decompressed = await decompressWithStream(bytes, nativeStream);
      return decompressed.byteLength > bytes.byteLength ? decompressed : undefined;
    } catch {
      return undefined;
    }
  }
  let decompressed: Uint8Array | undefined;
  try {
    decompressed = brotliDecompress(bytes);
  } catch {
    return undefined;
  }
  if (!decompressed || decompressed.byteLength <= bytes.byteLength) {
    return undefined;
  }
  return decompressed;
}

function tryParseJson(bytes: Uint8Array): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false };
  }
}

export async function parseJsonResponseBody(response: Response): Promise<unknown> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (response.headers.get('content-encoding') !== null) {
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  const asPlain = tryParseJson(bytes);
  if (asPlain.ok) {
    return asPlain.value;
  }

  if (isGzipCompressed(bytes)) {
    let decompressed: Uint8Array;
    try {
      decompressed = await decompressGzip(bytes);
    } catch (error) {
      throw new Error(
        `Signed JSON response body has gzip magic bytes but decompression failed (${bytes.length} bytes): ${(error as Error).message}`,
        { cause: error }
      );
    }
    const parsed = tryParseJson(decompressed);
    if (parsed.ok) {
      return parsed.value;
    }
    throw new Error(
      `Signed JSON response body decompressed as gzip but is not valid JSON (${decompressed.length} bytes)`
    );
  }

  let decompressed: Uint8Array;
  try {
    decompressed = await decompressBrotli(bytes);
  } catch (error) {
    throw new Error(
      `Signed JSON response body is neither plain JSON, gzip, nor valid brotli (${bytes.length} bytes): ${(error as Error).message}`,
      { cause: error }
    );
  }
  const parsed = tryParseJson(decompressed);
  if (parsed.ok) {
    return parsed.value;
  }
  throw new Error(
    `Signed JSON response body decompressed as brotli but is not valid JSON (${decompressed.length} bytes)`
  );
}

export async function decompressBinaryResponseBody(response: Response): Promise<ArrayBuffer> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (response.headers.get('content-encoding') !== null) {
    return toArrayBuffer(bytes);
  }

  if (isGzipCompressed(bytes)) {
    try {
      const decompressed = await decompressGzip(bytes);
      return toArrayBuffer(decompressed);
    } catch (error) {
      throw new Error(
        `Signed binary response body has gzip magic bytes but decompression failed (${bytes.length} bytes): ${(error as Error).message}`,
        { cause: error }
      );
    }
  }

  const brotliDecompressed = await tryDecompressBrotliWithSizeGate(bytes);
  if (brotliDecompressed !== undefined) {
    return toArrayBuffer(brotliDecompressed);
  }

  return toArrayBuffer(bytes);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
