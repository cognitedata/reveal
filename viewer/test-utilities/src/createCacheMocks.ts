/*!
 * Copyright 2025 Cognite AS
 */
import { vi } from 'vitest';

// Response.arrayBuffer() returns an ArrayBuffer from the native Node.js (undici) realm,
// which fails instanceof checks in vitest's vmForks VM context. To avoid this, we store
// body bytes as VM-context Uint8Arrays and return them directly from a custom Response-like
// object, bypassing the cross-realm issue.

type CacheEntry = {
  bytes: Uint8Array;
  headers: [string, string][];
  status: number;
  statusText: string;
};

function createMockResponse(entry: CacheEntry, url: string): Response {
  const headers = new Headers(entry.headers);
  let bodyUsed = false;

  const response = {
    headers,
    status: entry.status,
    statusText: entry.statusText,
    ok: entry.status >= 200 && entry.status < 300,
    url,
    type: 'default' as ResponseType,
    redirected: false,
    get bodyUsed() {
      return bodyUsed;
    },
    body: null,
    arrayBuffer: async () => {
      if (bodyUsed) throw new TypeError('Body already used');
      bodyUsed = true;
      const buf = new ArrayBuffer(entry.bytes.byteLength);
      new Uint8Array(buf).set(entry.bytes);
      return buf;
    },
    text: async () => {
      if (bodyUsed) throw new TypeError('Body already used');
      bodyUsed = true;
      return new TextDecoder().decode(entry.bytes);
    },
    json: async () => {
      if (bodyUsed) throw new TypeError('Body already used');
      bodyUsed = true;
      return JSON.parse(new TextDecoder().decode(entry.bytes));
    },
    blob: async () => {
      if (bodyUsed) throw new TypeError('Body already used');
      bodyUsed = true;
      return new Blob([entry.bytes as BlobPart]);
    },
    formData: async () => {
      throw new Error('formData not implemented in mock');
    },
    bytes: async () => {
      if (bodyUsed) throw new TypeError('Body already used');
      bodyUsed = true;
      return entry.bytes.slice();
    },
    clone: () => createMockResponse(entry, url)
  };

  return response;
}

// Real Cache API implementations only accept http(s) URLs as keys - e.g. Chrome throws
// "Failed to execute 'put' on 'Cache': Request scheme '...' is unsupported" for anything
// else. Enforcing the same restriction here catches cache-key bugs (like a key built from
// a non-URL string) in tests instead of only surfacing them in a real browser.
function assertValidCacheUrl(key: string): void {
  let url: URL;
  try {
    url = new URL(key);
  } catch {
    throw new TypeError(`Failed to execute 'put' on 'Cache': '${key}' is not a valid URL`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError(
      `Failed to execute 'put' on 'Cache': Request scheme '${url.protocol.replace(':', '')}' is unsupported`
    );
  }
}

export function createMockCache(storage: Map<string, Response>): Cache {
  return {
    match: async (key: string) => {
      assertValidCacheUrl(key);
      const stored = storage.get(key);
      return stored ? stored.clone() : undefined;
    },
    matchAll: async () => {
      return Array.from(storage.values()).map(r => r.clone());
    },
    put: async (key: string, response: Response) => {
      assertValidCacheUrl(key);
      // Read body as native ArrayBuffer, then copy into VM-context Uint8Array to avoid
      // cross-realm instanceof issues when the data is later returned via arrayBuffer().
      const nativeBuf = await response.arrayBuffer();
      const bytes = new Uint8Array(nativeBuf);

      const headersList: [string, string][] = [];
      response.headers.forEach((value, name) => headersList.push([name, value]));

      const entry: CacheEntry = {
        bytes,
        headers: headersList,
        status: response.status,
        statusText: response.statusText
      };
      storage.set(key, createMockResponse(entry, key));
    },
    delete: async (key: string) => {
      const had = storage.has(key);
      storage.delete(key);
      return had;
    },
    keys: async () => Array.from(storage.keys()).map(url => new Request(url)),
    add: vi.fn(async () => undefined),
    addAll: vi.fn(async () => undefined)
  } satisfies Cache;
}

export function createMockCacheStorage(cacheStorageMap: Map<string, Map<string, Response>>): CacheStorage {
  return {
    open: async (cacheName: string) => {
      if (!cacheStorageMap.has(cacheName)) {
        cacheStorageMap.set(cacheName, new Map());
      }
      return createMockCache(cacheStorageMap.get(cacheName)!);
    },
    delete: async (cacheName: string) => {
      const had = cacheStorageMap.has(cacheName);
      cacheStorageMap.delete(cacheName);
      return had;
    },
    has: async (cacheName: string) => cacheStorageMap.has(cacheName),
    keys: async () => Array.from(cacheStorageMap.keys()),
    match: vi.fn(async () => undefined)
  } satisfies CacheStorage;
}
