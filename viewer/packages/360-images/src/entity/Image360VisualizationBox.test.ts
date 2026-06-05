/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import * as THREE from 'three';
import type { IMock } from 'moq.ts';
import { Mock, It, Times } from 'moq.ts';
import type { SceneHandler } from '@reveal/utilities';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import type { Image360Face, Image360Texture } from '@reveal/data-providers';

// Minimal JPEG bytes that carry the SOF marker in the header: SOI + APP0(len=4) + SOF marker + abbreviated end
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

function makeSixTextures(): Image360Texture[] {
  const faceNames: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  return faceNames.map(face => ({ face, texture: new THREE.Texture() }));
}

function makeStreamingFace(face: Image360Face['face'] = 'front'): Image360Face {
  return { face, mimeType: 'image/jpeg', data: new ArrayBuffer(0), downloadUrl: `https://example.com/${face}.jpg` };
}

function makeBufferFace(face: Image360Face['face'] = 'front'): Image360Face {
  return { face, mimeType: 'image/jpeg', data: new ArrayBuffer(100) };
}

describe(Image360VisualizationBox.name, () => {
  let sceneHandlerMock: IMock<SceneHandler>;
  let box: Image360VisualizationBox;
  let fetchSpy: vi.SpiedFunction<typeof fetch>;
  let requestRedraw: vi.Mock;

  const device = { deviceType: 'desktop' as const };
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    sceneHandlerMock = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .callback(() => {})
      .setup(s => s.removeObject3D(It.IsAny()))
      .callback(() => {});

    requestRedraw = vi.fn();
    box = new Image360VisualizationBox(new THREE.Matrix4(), sceneHandlerMock.object(), device, requestRedraw);
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
    vi.restoreAllMocks();
  });

  describe('setImages', () => {
    test('creates mesh and adds it to sceneHandler on first call', () => {
      box.setImages(makeSixTextures());

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });

    test('does not add a second mesh when called again — updates materials instead', () => {
      const textures1 = makeSixTextures();
      const textures2 = makeSixTextures();
      box.setImages(textures1);
      box.setImages(textures2);

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
      box['_faceMaterials'].forEach((material, index) => {
        expect(material.map).toBe(textures2[index].texture);
      });
    });

    test('calls requestRedraw when updating an existing mesh', () => {
      const textures = makeSixTextures();
      box.setImages(textures);
      requestRedraw.mockClear();
      box.setImages(textures);

      expect(requestRedraw).toHaveBeenCalledTimes(1);
    });
  });

  describe('unloadImages', () => {
    test('removes mesh from sceneHandler after setImages', () => {
      box.setImages(makeSixTextures());
      box.unloadImages();

      sceneHandlerMock.verify(s => s.removeObject3D(It.IsAny()), Times.Once());
    });

    test('is a no-op when no mesh exists', () => {
      box.unloadImages();

      sceneHandlerMock.verify(s => s.removeObject3D(It.IsAny()), Times.Never());
    });
  });

  describe('getTransform', () => {
    test('returns a Matrix4', () => {
      expect(box.getTransform()).toBeInstanceOf(THREE.Matrix4);
    });
  });

  describe('visible', () => {
    test('setter does not throw when no mesh exists', () => {
      expect(() => {
        box.visible = false;
      }).not.toThrow();
    });

    test('getter reflects the value set and updates material opacities', () => {
      box.setImages(makeSixTextures());
      box.opacity = 0.5;
      expect(box.opacity).toBe(0.5);
      box['_faceMaterials'].forEach(material => {
        expect(material.opacity).toBe(0.5);
      });
    });
  });

  describe('opacity', () => {
    test('getter reflects the value set', () => {
      box.setImages(makeSixTextures());
      box.opacity = 0.5;
      expect(box.opacity).toBe(0.5);
    });
  });

  describe('createPlaceholderMesh', () => {
    test('adds mesh to sceneHandler via addObject3D', () => {
      box['createPlaceholderMesh']();

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });

    test('is idempotent — addObject3D called only once even when called twice', () => {
      box['createPlaceholderMesh']();
      box['createPlaceholderMesh']();

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });
  });

  describe('updateFaceTexture', () => {
    test('does not throw when mesh does not exist', () => {
      expect(() => box.updateFaceTexture('front', new THREE.Texture())).not.toThrow();
    });
  });

  describe('loadFaceTextures', () => {
    test('creates placeholder mesh when any face has downloadUrl', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(BASELINE_JPEG_BYTES)));

      await box.loadFaceTextures([makeStreamingFace()]).catch(() => {});

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });

    test('does not create placeholder mesh when all faces have only data buffers', async () => {
      vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(new THREE.Texture());

      await box.loadFaceTextures([makeBufferFace()]);

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Never());
    });

    test('calls onFirstFaceReady after the first face resolves via buffer path', async () => {
      vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(new THREE.Texture());

      const onFirstFaceReady = vi.fn();
      await box.loadFaceTextures([makeBufferFace()], onFirstFaceReady);

      expect(onFirstFaceReady).toHaveBeenCalledTimes(1);
    });

    test('calls onFirstFaceReady only once when multiple faces resolve', async () => {
      vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(new THREE.Texture());

      const faces = (['front', 'back', 'left'] as Image360Face['face'][]).map(makeBufferFace);
      const onFirstFaceReady = vi.fn();
      await box.loadFaceTextures(faces, onFirstFaceReady);

      expect(onFirstFaceReady).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadFaceTextureStream (via loadFaceTextures)', () => {
    test('calls onJpegTypeDetected with progressive for progressive JPEG bytes', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(PROGRESSIVE_JPEG_BYTES)));

      const onJpegTypeDetected = vi.fn();
      await box.loadFaceTextures([makeStreamingFace()], undefined, onJpegTypeDetected).catch(() => {});

      expect(onJpegTypeDetected).toHaveBeenCalledWith('progressive');
    });

    test('calls onJpegTypeDetected with baseline for baseline JPEG bytes', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(createStreamingResponse(BASELINE_JPEG_BYTES)));

      const onJpegTypeDetected = vi.fn();
      await box.loadFaceTextures([makeStreamingFace()], undefined, onJpegTypeDetected).catch(() => {});

      expect(onJpegTypeDetected).toHaveBeenCalledWith('baseline');
    });

    test('rejects when fetch response is not ok', async () => {
      fetchSpy.mockReturnValueOnce(Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' })));

      await expect(box.loadFaceTextures([makeStreamingFace()])).rejects.toThrow('404');
    });
  });
});
