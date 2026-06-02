/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Image360FaceTextureLoader, hasDownloadUrl } from './Image360FaceTextureLoader';
import type { Image360Face } from '@reveal/data-providers';
import { Texture, TextureLoader } from 'three';

// Minimal JPEG bytes with SOF marker in the header: SOI + APP0(len=4) + SOF marker + abbreviated end
const PROGRESSIVE_JPEG_BYTES: Uint8Array<ArrayBuffer> = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc2, 0x00, 0x01, 0xff, 0xd9
]);

const BASELINE_JPEG_BYTES: Uint8Array<ArrayBuffer> = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x01, 0xff, 0xd9
]);

function createStreamingResponse(bytes: Uint8Array<ArrayBuffer>, contentType = 'image/jpeg'): Response {
  let consumed = false;
  const mockReader = {
    read: async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      if (!consumed) {
        consumed = true;
        return { done: false, value: bytes };
      }
      return { done: true, value: undefined };
    },
    releaseLock: () => {},
    cancel: async (_reason?: unknown) => {},
    closed: Promise.resolve(undefined)
  };
  const headers = new Headers({ 'Content-Type': contentType, 'Content-Length': bytes.length.toString() });
  const response = new Response(null, { status: 200, headers });
  Object.defineProperty(response, 'body', { value: { getReader: () => mockReader }, configurable: true });
  return response;
}

function makeStreamingFace(face: Image360Face['face'] = 'front'): Image360Face & { downloadUrl: string } {
  return { face, mimeType: 'image/jpeg', data: new ArrayBuffer(0), downloadUrl: `https://example.com/${face}.jpg` };
}

function makeBufferFace(face: Image360Face['face'] = 'front'): Image360Face {
  return { face, mimeType: 'image/jpeg', data: new ArrayBuffer(100) };
}

describe(Image360FaceTextureLoader.name, () => {
  let loader: Image360FaceTextureLoader;
  let fetchSpy: vi.SpiedFunction<typeof fetch>;

  const device = { deviceType: 'desktop' as const };
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    loader = new Image360FaceTextureLoader(
      device,
      new TextureLoader(),
      vi.fn(),
      vi.fn(),
      vi.fn(() => true)
    );

    fetchSpy = vi.spyOn(global, 'fetch');
    vi.spyOn(globalThis, 'createImageBitmap').mockResolvedValue({ width: 100, height: 100, close: () => {} });

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:mock-url'),
      writable: true,
      configurable: true
    });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { value: originalCreateObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: originalRevokeObjectURL, configurable: true });
    fetchSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('hasDownloadUrl', () => {
    test('returns true when face has a downloadUrl', () => {
      expect(hasDownloadUrl(makeStreamingFace())).toBe(true);
    });

    test('returns false when face has no downloadUrl', () => {
      expect(hasDownloadUrl(makeBufferFace())).toBe(false);
    });
  });

  describe('loadFromBuffer', () => {
    test('returns Image360Texture with correct face label', async () => {
      vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture());

      const result = await loader.loadFromBuffer(makeBufferFace('back'));

      expect(result.face).toBe('back');
    });

    test('revokes blob URL after loading', async () => {
      vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture());

      await loader.loadFromBuffer(makeBufferFace());

      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('loadFromUrl', () => {
    test('calls onJpegTypeDetected with progressive for progressive JPEG bytes', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(PROGRESSIVE_JPEG_BYTES)));

      const onJpegTypeDetected = vi.fn();
      await loader.loadFromUrl(makeStreamingFace(), undefined, onJpegTypeDetected).catch(() => {});

      expect(onJpegTypeDetected).toHaveBeenCalledWith('progressive');
    });

    test('calls onJpegTypeDetected with baseline for baseline JPEG bytes', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(BASELINE_JPEG_BYTES)));

      const onJpegTypeDetected = vi.fn();
      await loader.loadFromUrl(makeStreamingFace(), undefined, onJpegTypeDetected).catch(() => {});

      expect(onJpegTypeDetected).toHaveBeenCalledWith('baseline');
    });

    test('rejects when fetch response is not ok', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' })));

      await expect(loader.loadFromUrl(makeStreamingFace())).rejects.toThrow('404');
    });
  });
});
