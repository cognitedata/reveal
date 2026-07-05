/*!
 * Copyright 2026 Cognite AS
 */

const GZIP_MAGIC_BYTE_0 = 0x1f;
const GZIP_MAGIC_BYTE_1 = 0x8b;

function isGzipCompressed(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === GZIP_MAGIC_BYTE_0 && bytes[1] === GZIP_MAGIC_BYTE_1;
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Parses a Response body as JSON, decompressing it first if it's gzip but arrived without
 * a 'Content-Encoding: gzip' header (some signed URL backends omit it). Detects this by
 * sniffing the gzip magic number instead of trusting the header.
 */
export async function parseJsonResponseBody(response: Response): Promise<unknown> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  const plainBytes = isGzipCompressed(bytes) ? await gunzip(bytes) : bytes;
  return JSON.parse(new TextDecoder().decode(plainBytes));
}
