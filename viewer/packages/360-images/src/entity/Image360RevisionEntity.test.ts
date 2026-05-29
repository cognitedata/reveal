/*!
 * Copyright 2026 Cognite AS
 */

import { jest } from '@jest/globals';
import * as THREE from 'three';
import { Mock, IMock, It, Times } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { Image360RevisionEntity } from './Image360RevisionEntity';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { ClassicDataSourceType, Image360Provider } from '@reveal/data-providers';
import { Image360Descriptor, Image360Face, Image360Texture } from '@reveal/data-providers';

function makeFaces(count: number): Image360Face[] {
  const faceNames: Image360Face['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  return faceNames.slice(0, count).map(face => ({
    face,
    mimeType: 'image/jpeg',
    data: new ArrayBuffer(100)
  }));
}

function makeTextures(count: number): Image360Texture[] {
  const faceNames: Image360Face['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  return faceNames.slice(0, count).map(face => ({ face, texture: new THREE.Texture() }));
}

describe(Image360RevisionEntity.name, () => {
  let providerMock: Mock<Image360Provider<ClassicDataSourceType>>;
  let sceneHandlerMock: IMock<SceneHandler>;
  let vizBox: Image360VisualizationBox;
  let annotationFilterer: Image360AnnotationFilter;
  let descriptor: Image360Descriptor<ClassicDataSourceType>;

  const device = { deviceType: 'desktop' as const };

  beforeEach(() => {
    providerMock = new Mock<Image360Provider<ClassicDataSourceType>>();

    sceneHandlerMock = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .callback(() => {})
      .setup(s => s.removeObject3D(It.IsAny()))
      .callback(() => {});

    vizBox = new Image360VisualizationBox(new THREE.Matrix4(), sceneHandlerMock.object(), device);

    Object.defineProperty(URL, 'createObjectURL', {
      value: jest.fn(() => 'blob:mock-url'),
      writable: true,
      configurable: true
    });
    Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), writable: true, configurable: true });
    jest.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(new THREE.Texture());

    annotationFilterer = new Image360AnnotationFilter({});

    descriptor = {
      id: 'revision-1',
      faceDescriptors: [{ fileId: 1, face: 'front', mimeType: 'image/jpeg' }]
    } satisfies Image360Descriptor<ClassicDataSourceType>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createEntity(): Image360RevisionEntity<ClassicDataSourceType> {
    return new Image360RevisionEntity(providerMock.object(), descriptor, vizBox, annotationFilterer);
  }

  describe('loadTextures', () => {
    test('returns lowResolutionCompleted and fullResolutionCompleted promises', () => {
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(makeFaces(1)));
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));
      jest.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(makeTextures(1));

      const result = createEntity().loadTextures();

      expect(result.lowResolutionCompleted).toBeInstanceOf(Promise);
      expect(result.fullResolutionCompleted).toBeInstanceOf(Promise);
    });

    test('calls getLowResolution360ImageFiles for the preview tier', async () => {
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(makeFaces(1)));
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));
      jest.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(makeTextures(1));

      const { lowResolutionCompleted, fullResolutionCompleted } = createEntity().loadTextures();
      await Promise.allSettled([lowResolutionCompleted, fullResolutionCompleted]);

      providerMock.verify(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
    });

    test('calls get360ImageFiles for full resolution', async () => {
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(makeFaces(1)));
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));
      jest.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(makeTextures(1));

      const { fullResolutionCompleted } = createEntity().loadTextures();
      await fullResolutionCompleted.catch(() => {});

      providerMock.verify(p => p.get360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
    });

    test('fullResolutionCompleted rejects when get360ImageFiles throws', async () => {
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(makeFaces(1)));
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.reject(new Error('fetch failed')));

      const { fullResolutionCompleted } = createEntity().loadTextures();

      await expect(fullResolutionCompleted).rejects.toThrow('fetch failed');
    });
  });

  describe('getPreviewThumbnailUrl', () => {
    test('returns undefined when the requested face descriptor does not exist', async () => {
      const descriptorWithNoFront = {
        id: 'revision-1',
        faceDescriptors: [{ fileId: 1, face: 'back' as const, mimeType: 'image/jpeg' as const }]
      } satisfies Image360Descriptor<ClassicDataSourceType>;

      const entity = new Image360RevisionEntity(
        providerMock.object(),
        descriptorWithNoFront,
        vizBox,
        annotationFilterer
      );

      const url = await entity.getPreviewThumbnailUrl('front');

      expect(url).toBeUndefined();
    });

    test('returns a blob URL when face descriptor is found', async () => {
      providerMock.setup(p => p.getLowResolution360ImageFiles(It.IsAny())).returns(Promise.resolve(makeFaces(1)));

      const url = await createEntity().getPreviewThumbnailUrl('front');

      expect(url).toBe('blob:mock-url');
    });

    test('returns undefined when provider returns no files for the face', async () => {
      providerMock.setup(p => p.getLowResolution360ImageFiles(It.IsAny())).returns(Promise.resolve([]));

      const url = await createEntity().getPreviewThumbnailUrl('front');

      expect(url).toBeUndefined();
    });
  });
});
