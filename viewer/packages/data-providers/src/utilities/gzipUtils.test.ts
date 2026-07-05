/*!
 * Copyright 2026 Cognite AS
 */

import { gzipSync } from 'node:zlib';
import { parseJsonResponseBody } from './gzipUtils';

describe(parseJsonResponseBody.name, () => {
  test('parses a plain (non gzip) JSON body', async () => {
    const data = { version: 9, sectors: [] };
    const response = new Response(JSON.stringify(data));

    const result = await parseJsonResponseBody(response);

    expect(result).toEqual(data);
  });

  test('decompresses a gzip body even without a Content-Encoding header', async () => {
    const data = { version: 9, sectors: [{ id: 1 }, { id: 2 }] };
    const gzipped = gzipSync(Buffer.from(JSON.stringify(data)));
    const response = new Response(gzipped);

    const result = await parseJsonResponseBody(response);

    expect(result).toEqual(data);
  });

  test('ignores the Content-Encoding header and relies on the actual body bytes', async () => {
    // Simulates fetch having already auto-decompressed the body because the header was
    // present and correct - the plain-text bytes should be parsed as-is, header notwithstanding.
    const data = { version: 9, sectors: [] };
    const response = new Response(JSON.stringify(data), { headers: { 'content-encoding': 'gzip' } });

    const result = await parseJsonResponseBody(response);

    expect(result).toEqual(data);
  });
});
