/*!
 * Copyright 2026 Cognite AS
 */

import type { Mock as ViMock } from 'vitest';
import { vi } from 'vitest';
import { Mock, It } from 'moq.ts';
import { Image360FaceTextureLoader, disposeFaceTexture, hasDownloadUrl } from './Image360FaceTextureLoader';
import type { Image360Face } from '@reveal/data-providers';
import { CanvasTexture, Texture, TextureLoader } from 'three';
import { createImage360BufferFace, createImage360StreamingFace } from '../../../../test-utilities';

// Minimal JPEG bytes with SOF marker in the header: SOI + APP0(len=4) + SOF marker + abbreviated end
const PROGRESSIVE_JPEG_BYTES: Uint8Array<ArrayBuffer> = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc2, 0x00, 0x01, 0xff, 0xd9
]);

const BASELINE_JPEG_BYTES: Uint8Array<ArrayBuffer> = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x01, 0xff, 0xd9
]);

// Progressive JPEG with two scans, delivered in two chunks so each chunk completes one scan
const PROGRESSIVE_TWO_SCAN_CHUNKS: Uint8Array<ArrayBuffer>[] = [
  new Uint8Array([0xff, 0xd8, 0xff, 0xc2, 0x00, 0x02, 0xff, 0xda, 0x00, 0x02, 0x11, 0xff, 0xda]),
  new Uint8Array([0x00, 0x02, 0x22, 0xff, 0xd9])
];

function createStreamingResponse(...chunks: Uint8Array<ArrayBuffer>[]): Response {
  const pendingChunks = [...chunks];
  const mockReader = {
    read: async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      const value = pendingChunks.shift();
      return value === undefined ? { done: true, value: undefined } : { done: false, value };
    },
    releaseLock: () => {},
    cancel: async (_reason?: unknown) => {},
    closed: Promise.resolve(undefined)
  };
  const contentLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const headers = new Headers({ 'Content-Type': 'image/jpeg', 'Content-Length': contentLength.toString() });
  const response = new Response(null, { status: 200, headers });
  Object.defineProperty(response, 'body', { value: { getReader: () => mockReader }, configurable: true });
  return response;
}

describe(Image360FaceTextureLoader.name, () => {
  let loader: Image360FaceTextureLoader;
  let fetchSpy: ViMock<typeof fetch>;
  let createImageBitmapSpy: ViMock<typeof createImageBitmap>;

  const device = { deviceType: 'desktop' as const };

  beforeEach(() => {
    loader = new Image360FaceTextureLoader(
      device,
      new TextureLoader(),
      vi.fn(),
      vi.fn(),
      vi.fn(() => true)
    );

    fetchSpy = vi.spyOn(global, 'fetch');
    createImageBitmapSpy = vi
      .spyOn(globalThis, 'createImageBitmap')
      .mockResolvedValue({ width: 100, height: 100, close: () => {} });

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('hasDownloadUrl', () => {
    test('returns true when face has a downloadUrl', () => {
      expect(hasDownloadUrl(createImage360StreamingFace())).toBe(true);
    });

    test('returns false when face has no downloadUrl', () => {
      expect(hasDownloadUrl(createImage360BufferFace())).toBe(false);
    });
  });

  describe('disposeFaceTexture', () => {
    test('disposes the texture without resizing a canvas that was not created for streaming', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const texture = new CanvasTexture(canvas);
      const disposeSpy = vi.spyOn(texture, 'dispose');

      disposeFaceTexture(texture);

      expect(disposeSpy).toHaveBeenCalledOnce();
      expect(canvas).toMatchObject({ width: 8, height: 8 });
    });
  });

  describe('load — buffer path (no downloadUrl)', () => {
    test('returns Image360Texture with correct face label', async () => {
      vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture());

      const result = await loader.load(createImage360BufferFace('back'));

      expect(result.face).toBe('back');
    });

    test('revokes blob URL after loading', async () => {
      vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture());

      await loader.load(createImage360BufferFace());

      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('calls onFirstFaceReady after buffer is decoded', async () => {
      vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture());

      const onFirstFaceReady = vi.fn();
      await loader.load(createImage360BufferFace(), onFirstFaceReady);

      expect(onFirstFaceReady).toHaveBeenCalledTimes(1);
    });
  });

  describe('load — streaming path (with downloadUrl)', () => {
    test('calls onJpegTypeDetected with progressive for progressive JPEG bytes', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(PROGRESSIVE_JPEG_BYTES)));

      const onJpegTypeDetected = vi.fn();
      await loader.load(createImage360StreamingFace(), undefined, onJpegTypeDetected).catch(() => {});

      expect(onJpegTypeDetected).toHaveBeenCalledWith('progressive');
    });

    test('calls onJpegTypeDetected with baseline for baseline JPEG bytes', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(BASELINE_JPEG_BYTES)));

      const onJpegTypeDetected = vi.fn();
      await loader.load(createImage360StreamingFace(), undefined, onJpegTypeDetected).catch(() => {});

      expect(onJpegTypeDetected).toHaveBeenCalledWith('baseline');
    });

    test('rejects when fetch response is not ok', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' })));

      await expect(loader.load(createImage360StreamingFace())).rejects.toThrow('404');
    });
  });

  describe('load — progressive streaming textures', () => {
    let updateFaceTexture: ViMock<(face: Image360Face['face'], texture: Texture) => void>;
    let isMeshAlive: ViMock<() => boolean>;
    let loadAsyncSpy: ViMock<TextureLoader['loadAsync']>;
    let finalTexture: Texture;

    beforeEach(() => {
      updateFaceTexture = vi.fn();
      isMeshAlive = vi.fn(() => true);
      finalTexture = new Texture();
      loader = new Image360FaceTextureLoader(device, new TextureLoader(), vi.fn(), updateFaceTexture, isMeshAlive);

      fetchSpy.mockResolvedValue(createStreamingResponse(PROGRESSIVE_JPEG_BYTES));
      loadAsyncSpy = vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(finalTexture);
      const context = new Mock<CanvasRenderingContext2D>()
        .setup(c => c.drawImage(It.IsAny(), It.IsAny(), It.IsAny()))
        .returns(undefined)
        .object();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    });

    function getIntermediateTexture(): Texture {
      return updateFaceTexture.mock.calls[0][1];
    }

    test('shows the first scan without mipmaps and frees its canvas once the final texture is applied', async () => {
      const result = await loader.load(createImage360StreamingFace());

      const intermediateTexture = getIntermediateTexture();
      expect(intermediateTexture.generateMipmaps).toBe(false);
      expect(intermediateTexture.image).toMatchObject({ width: 0, height: 0 });
      expect(updateFaceTexture).toHaveBeenLastCalledWith('front', finalTexture);
      expect(result.texture).toBe(finalTexture);
    });

    test('applies at most one progressive scan per throttle interval', async () => {
      vi.spyOn(performance, 'now').mockReturnValue(1000);
      fetchSpy.mockResolvedValue(createStreamingResponse(...PROGRESSIVE_TWO_SCAN_CHUNKS));

      await loader.load(createImage360StreamingFace());

      expect(createImageBitmapSpy).toHaveBeenCalledOnce();
    });

    test('frees the intermediate canvas and skips the final decode when the mesh is unloaded mid-stream', async () => {
      updateFaceTexture.mockImplementationOnce(() => {
        isMeshAlive.mockReturnValue(false);
      });

      await expect(loader.load(createImage360StreamingFace())).rejects.toThrow('no longer needed');

      expect(getIntermediateTexture().image).toMatchObject({ width: 0, height: 0 });
      expect(loadAsyncSpy).not.toHaveBeenCalled();
    });

    test('disposes the final texture instead of applying it when aborted while decoding', async () => {
      const abortController = new AbortController();
      loadAsyncSpy.mockImplementation(async () => {
        abortController.abort();
        return finalTexture;
      });
      const disposeSpy = vi.spyOn(finalTexture, 'dispose');

      await expect(
        loader.load(createImage360StreamingFace(), undefined, undefined, abortController.signal)
      ).rejects.toThrow('no longer needed');

      expect(disposeSpy).toHaveBeenCalledOnce();
      expect(updateFaceTexture).not.toHaveBeenCalledWith('front', finalTexture);
    });

    test('keeps the intermediate texture when the final decode fails until disposeFaceTexture frees it', async () => {
      loadAsyncSpy.mockRejectedValue(new Error('decode failed'));

      await expect(loader.load(createImage360StreamingFace())).rejects.toThrow('decode failed');

      const intermediateTexture = getIntermediateTexture();
      expect(intermediateTexture.image).toMatchObject({ width: 100, height: 100 });
      disposeFaceTexture(intermediateTexture);
      expect(intermediateTexture.image).toMatchObject({ width: 0, height: 0 });
    });
  });
});
