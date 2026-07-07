/*!
 * Copyright 2026 Cognite AS
 */

export async function gzipEncode(input: string): Promise<ArrayBuffer> {
  const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}
