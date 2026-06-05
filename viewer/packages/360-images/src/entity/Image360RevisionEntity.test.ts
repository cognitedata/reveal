/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import * as THREE from 'three';
import type { IMock } from 'moq.ts';
import { Mock, It, Times } from 'moq.ts';
import type { SceneHandler } from '@reveal/utilities';
import { Image360RevisionEntity } from './Image360RevisionEntity';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import type { ClassicDataSourceType, Image360Provider } from '@reveal/data-providers';
import type { Image360Descriptor, Image360Face, Image360Texture } from '@reveal/data-providers';

function makeFaces(count: number): Image360Face[] {
  const faceNames: Image360Face['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  return faceNames.slice(0, count).map(face => ({
    face,
    mimeType: 'image/jpeg',
    data: new ArrayBuffer(0),
    downloadUrl: `https://example.com/${face}.jpg`
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
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    providerMock = new Mock<Image360Provider<ClassicDataSourceType>>();

    sceneHandlerMock = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .callback(() => {})
      .setup(s => s.removeObject3D(It.IsAny()))
      .callback(() => {});

    vizBox = new Image360VisualizationBox(new THREE.Matrix4(), sceneHandlerMock.object(), device);

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:mock-url'),
      writable: true,
      configurable: true
    });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true, configurable: true });
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(new THREE.Texture());

    annotationFilterer = new Image360AnnotationFilter({});

    descriptor = {
      id: 'revision-1',
      faceDescriptors: [{ fileId: 1, face: 'front', mimeType: 'image/jpeg' }]
    } satisfies Image360Descriptor<ClassicDataSourceType>;
  });

  afterEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { value: originalCreateObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: originalRevokeObjectURL, configurable: true });
    vi.restoreAllMocks();
  });

  describe('loadTextures', () => {
    test('returns lowResolutionCompleted and fullResolutionCompleted promises', () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));
      vi.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(makeTextures(1));
      vi.spyOn(vizBox, 'setImages').mockImplementation(() => {});

      const result = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBox,
        annotationFilterer
      ).loadTextures();

      expect(result.lowResolutionCompleted).toBeInstanceOf(Promise);
      expect(result.fullResolutionCompleted).toBeInstanceOf(Promise);
    });

    test('calls get360ImageFiles on the provider', async () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));
      vi.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(makeTextures(1));
      vi.spyOn(vizBox, 'setImages').mockImplementation(() => {});

      const { fullResolutionCompleted } = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBox,
        annotationFilterer
      ).loadTextures();
      await fullResolutionCompleted.catch(() => {});

      providerMock.verify(p => p.get360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
    });

    test('both fullResolutionCompleted and lowResolutionCompleted reject when provider throws', async () => {
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.reject(new Error('fetch failed')));
      vi.spyOn(vizBox, 'setImages').mockImplementation(() => {});

      const { fullResolutionCompleted, lowResolutionCompleted } = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBox,
        annotationFilterer
      ).loadTextures();

      await expect(fullResolutionCompleted).rejects.toThrow('fetch failed');
      await expect(lowResolutionCompleted).rejects.toThrow('fetch failed');
    });

    test('preview request is started eagerly but aborted for progressive JPEG', async () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));

      let previewAbortSignal: AbortSignal | undefined;
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .callback(({ args }) => {
          previewAbortSignal = args[1] as AbortSignal | undefined;
          return Promise.resolve(makeFaces(6));
        });

      const textures = makeTextures(6);
      vi.spyOn(vizBox, 'loadFaceTextures').mockImplementation(
        async (_faces, onFirstFaceReady, onFirstFaceTypeDetected) => {
          onFirstFaceTypeDetected?.('progressive');
          onFirstFaceReady?.();
          return textures;
        }
      );
      vi.spyOn(vizBox, 'setImages').mockImplementation(() => {});

      const { fullResolutionCompleted } = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBox,
        annotationFilterer
      ).loadTextures();
      await fullResolutionCompleted;

      providerMock.verify(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
      expect(previewAbortSignal?.aborted).toBe(true);
    });

    test('getLowResolution360ImageFiles is called for baseline JPEG', async () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(makeFaces(6)));

      const textures = makeTextures(6);
      vi.spyOn(vizBox, 'loadFaceTextures').mockImplementation(
        async (_faces, _onFirstFaceReady, onFirstFaceTypeDetected) => {
          onFirstFaceTypeDetected?.('baseline');
          return textures;
        }
      );
      vi.spyOn(vizBox, 'setImages').mockImplementation(() => {});

      const { fullResolutionCompleted, lowResolutionCompleted } = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBox,
        annotationFilterer
      ).loadTextures();
      await Promise.all([fullResolutionCompleted, lowResolutionCompleted]);

      providerMock.verify(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
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

      const entity = new Image360RevisionEntity(providerMock.object(), descriptor, vizBox, annotationFilterer);
      const url = await entity.getPreviewThumbnailUrl('front');

      expect(url).toBe('blob:mock-url');
    });

    test('returns undefined when provider returns no files for the face', async () => {
      providerMock.setup(p => p.getLowResolution360ImageFiles(It.IsAny())).returns(Promise.resolve([]));

      const entity = new Image360RevisionEntity(providerMock.object(), descriptor, vizBox, annotationFilterer);
      const url = await entity.getPreviewThumbnailUrl('front');

      expect(url).toBeUndefined();
    });
  });
});
