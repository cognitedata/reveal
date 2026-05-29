/*!
 * Copyright 2026 Cognite AS
 */

import { jest } from '@jest/globals';
import * as THREE from 'three';
import { Mock, IMock, It, Times } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360Face, Image360Texture } from '@reveal/data-providers';

function makeSixTextures(): Image360Texture[] {
  const faceNames: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  return faceNames.map(face => ({ face, texture: new THREE.Texture() }));
}

describe(Image360VisualizationBox.name, () => {
  let sceneHandlerMock: IMock<SceneHandler>;
  let box: Image360VisualizationBox;

  const device = { deviceType: 'desktop' as const };

  beforeEach(() => {
    sceneHandlerMock = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .callback(() => {})
      .setup(s => s.removeObject3D(It.IsAny()))
      .callback(() => {});

    box = new Image360VisualizationBox(new THREE.Matrix4(), sceneHandlerMock.object(), device);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadImages', () => {
    test('creates mesh and adds it to sceneHandler on first call', () => {
      box.loadImages(makeSixTextures());

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });

    test('does not add a second mesh when called again — updates materials instead', () => {
      const textures = makeSixTextures();
      box.loadImages(textures);
      box.loadImages(textures);

      sceneHandlerMock.verify(s => s.addObject3D(It.IsAny()), Times.Once());
    });
  });

  describe('unloadImages', () => {
    test('removes mesh from sceneHandler after loadImages', () => {
      box.loadImages(makeSixTextures());
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

    test('getter reflects the value set', () => {
      box.visible = false;
      expect(box.visible).toBe(false);
    });
  });

  describe('opacity', () => {
    test('getter reflects the value set', () => {
      box.loadImages(makeSixTextures());
      box.opacity = 0.5;
      expect(box.opacity).toBe(0.5);
    });
  });

  describe('loadFaceTextures', () => {
    beforeEach(() => {
      Object.defineProperty(URL, 'createObjectURL', {
        value: jest.fn(() => 'blob:mock-url'),
        writable: true,
        configurable: true
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: jest.fn(),
        writable: true,
        configurable: true
      });
      jest.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(new THREE.Texture());
    });

    test('returns one Image360Texture per input face', async () => {
      const faces: Image360Face[] = [
        { face: 'front', mimeType: 'image/jpeg', data: new ArrayBuffer(10) },
        { face: 'back', mimeType: 'image/jpeg', data: new ArrayBuffer(10) }
      ];

      const result = await box.loadFaceTextures(faces);

      expect(result).toHaveLength(2);
      expect(result[0].face).toBe('front');
      expect(result[1].face).toBe('back');
    });

    test('each returned texture has the correct face label', async () => {
      const faceNames: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
      const faces: Image360Face[] = faceNames.map(face => ({
        face,
        mimeType: 'image/jpeg',
        data: new ArrayBuffer(10)
      }));

      const result = await box.loadFaceTextures(faces);

      faceNames.forEach((face, i) => {
        expect(result[i].face).toBe(face);
      });
    });
  });
});
