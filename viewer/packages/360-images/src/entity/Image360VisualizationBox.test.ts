/*!
 * Copyright 2026 Cognite AS
 */

import type { Mock as ViMock } from 'vitest';
import { vi } from 'vitest';
import { Matrix4, Texture } from 'three';
import type { IMock } from 'moq.ts';
import { Mock, It, Times } from 'moq.ts';
import type { SceneHandler } from '@reveal/utilities';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import type { FaceTextureLoader } from './Image360FaceTextureLoader';
import type { Image360Face } from '@reveal/data-providers';
import type { JpegType } from '../utils/JpegDataStreamParser';
import {
  createImage360BufferFace,
  createImage360StreamingFace,
  createImage360Textures
} from '../../../../test-utilities';

describe(Image360VisualizationBox.name, () => {
  let sceneHandlerMock: IMock<SceneHandler>;
  let box: Image360VisualizationBox;
  let loaderMock: { load: ViMock<FaceTextureLoader['load']> };
  let requestRedraw: ViMock<() => void>;

  const device = { deviceType: 'desktop' as const };

  beforeEach(() => {
    sceneHandlerMock = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .callback(() => {})
      .setup(s => s.removeObject3D(It.IsAny()))
      .callback(() => {});

    requestRedraw = vi.fn<() => void>();
    loaderMock = {
      load: vi.fn<FaceTextureLoader['load']>().mockImplementation(async (face, onFirstFaceReady) => {
        onFirstFaceReady?.();
        return { face: face.face, texture: new Texture() };
      })
    };
    box = new Image360VisualizationBox(new Matrix4(), sceneHandlerMock.object(), device, requestRedraw, loaderMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setImages', () => {
    test('creates mesh and adds it to sceneHandler on first call', () => {
      box.setImages(createImage360Textures());

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });

    test('does not add a second mesh when called again — updates materials instead', () => {
      const textures1 = createImage360Textures();
      const textures2 = createImage360Textures();
      box.setImages(textures1);
      box.setImages(textures2);

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
      box['_faceMaterials'].forEach((material, index) => {
        expect(material.map).toBe(textures2[index].texture);
      });
    });

    test('calls requestRedraw when updating an existing mesh', () => {
      const textures = createImage360Textures();
      box.setImages(textures);
      requestRedraw.mockClear();
      box.setImages(textures);

      expect(requestRedraw).toHaveBeenCalledTimes(1);
    });
  });

  describe('unloadImages', () => {
    test('removes mesh from sceneHandler after setImages', () => {
      box.setImages(createImage360Textures());
      box.unloadImages();

      sceneHandlerMock.verify(s => s.removeObject3D(It.IsAny()), Times.Once());
    });

    test('disposes the texture of every face', () => {
      const textures = createImage360Textures();
      const disposeSpies = textures.map(({ texture }) => vi.spyOn(texture, 'dispose'));
      box.setImages(textures);

      box.unloadImages();

      disposeSpies.forEach(disposeSpy => expect(disposeSpy).toHaveBeenCalledOnce());
    });

    test('is a no-op when no mesh exists', () => {
      box.unloadImages();

      sceneHandlerMock.verify(s => s.removeObject3D(It.IsAny()), Times.Never());
    });
  });

  describe('getTransform', () => {
    test('returns a Matrix4', () => {
      expect(box.getTransform()).toBeInstanceOf(Matrix4);
    });
  });

  describe('visible', () => {
    test('setter does not throw when no mesh exists', () => {
      expect(() => {
        box.visible = false;
      }).not.toThrow();
    });

    test('getter reflects the value set and updates material opacities', () => {
      box.setImages(createImage360Textures());
      box.opacity = 0.5;
      expect(box.opacity).toBe(0.5);
      box['_faceMaterials'].forEach(material => {
        expect(material.opacity).toBe(0.5);
      });
    });
  });

  describe('opacity', () => {
    test('getter reflects the value set', () => {
      box.setImages(createImage360Textures());
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
      expect(() => box.updateFaceTexture('front', new Texture())).not.toThrow();
    });
  });

  describe('loadFaceTextures', () => {
    test('creates placeholder mesh when any face has downloadUrl', async () => {
      await box.loadFaceTextures([createImage360StreamingFace()]);

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });

    test('does not create placeholder mesh when all faces have only data buffers', async () => {
      await box.loadFaceTextures([createImage360BufferFace()]);

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Never());
    });

    test('calls onFirstFaceReady after all faces resolve', async () => {
      const onFirstFaceReady = vi.fn();
      await box.loadFaceTextures([createImage360BufferFace()], onFirstFaceReady);

      expect(onFirstFaceReady).toHaveBeenCalledTimes(1);
    });

    test('calls onFirstFaceReady only once when multiple faces resolve', async () => {
      const faces = [
        createImage360BufferFace('front'),
        createImage360BufferFace('back'),
        createImage360BufferFace('left')
      ];
      const onFirstFaceReady = vi.fn();
      await box.loadFaceTextures(faces, onFirstFaceReady);

      expect(onFirstFaceReady).toHaveBeenCalledTimes(1);
    });

    test('calls onJpegTypeDetected once even when multiple faces report a type', async () => {
      loaderMock.load.mockImplementation(
        async (face: Image360Face, _onFirstFaceReady?: () => void, onJpegTypeDetected?: (type: JpegType) => void) => {
          onJpegTypeDetected?.('progressive');
          return { face: face.face, texture: new Texture() };
        }
      );

      const onJpegTypeDetected = vi.fn();
      const faces = [createImage360StreamingFace('front'), createImage360StreamingFace('back')];
      await box.loadFaceTextures(faces, undefined, onJpegTypeDetected);

      expect(onJpegTypeDetected).toHaveBeenCalledTimes(1);
      expect(onJpegTypeDetected).toHaveBeenCalledWith('progressive');
    });

    test('rejects when loader rejects', async () => {
      loaderMock.load.mockRejectedValue(new Error('fetch failed'));

      await expect(box.loadFaceTextures([createImage360StreamingFace()])).rejects.toThrow('fetch failed');
    });
  });
});
