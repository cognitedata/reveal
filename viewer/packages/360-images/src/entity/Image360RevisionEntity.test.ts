/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4, Texture, TextureLoader } from 'three';
import type { IMock } from 'moq.ts';
import { Mock, It, Times } from 'moq.ts';
import type { SceneHandler } from '@reveal/utilities';
import { Image360RevisionEntity } from './Image360RevisionEntity';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import type { ClassicDataSourceType } from '@reveal/data-providers';
import type { Image360Descriptor, Image360Texture } from '@reveal/data-providers';
import type { Image360Provider } from '../providers/Image360Provider';
import { createImage360StreamingFaces, createImage360Textures } from '../../../../test-utilities';
import type { AnnotationModel } from '@cognite/sdk';

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

    vizBox = new Image360VisualizationBox(new Matrix4(), sceneHandlerMock.object(), device);

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:mock-url'),
      writable: true,
      configurable: true
    });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true, configurable: true });
    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture());

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
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces(1)));
      vi.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(createImage360Textures(1));
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
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces(1)));
      vi.spyOn(vizBox, 'loadFaceTextures').mockResolvedValue(createImage360Textures(1));
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
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces(1)));

      let previewAbortSignal: AbortSignal | undefined;
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .callback(({ args }) => {
          previewAbortSignal = args[1] as AbortSignal | undefined;
          return Promise.resolve(createImage360StreamingFaces(6));
        });

      const textures = createImage360Textures(6);
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
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces(1)));
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces(6)));

      const textures = createImage360Textures(6);
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

  describe('loadTextures — aborted', () => {
    let abortController: AbortController;
    let textures: Image360Texture[];

    beforeEach(() => {
      abortController = new AbortController();
      textures = createImage360Textures();
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces()))
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(new Promise(() => {}));
    });

    function loadFullResolutionTextures(): Promise<void> {
      const { fullResolutionCompleted, lowResolutionCompleted } = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBox,
        annotationFilterer
      ).loadTextures(abortController.signal);
      lowResolutionCompleted.catch(() => {});
      return fullResolutionCompleted;
    }

    function abortWhileLoadingFaceTextures(): void {
      vi.spyOn(vizBox, 'loadFaceTextures').mockImplementation(async () => {
        abortController.abort();
        return textures;
      });
    }

    test('does not load face textures when aborted while fetching the image files', async () => {
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .callback(() => {
          abortController.abort();
          return Promise.resolve(createImage360StreamingFaces());
        });
      const loadFaceTexturesSpy = vi.spyOn(vizBox, 'loadFaceTextures');

      await expect(loadFullResolutionTextures()).rejects.toMatchObject({ name: 'AbortError' });

      expect(loadFaceTexturesSpy).not.toHaveBeenCalled();
    });

    test('disposes the full resolution textures instead of applying them when aborted while loading', async () => {
      const disposeSpies = textures.map(({ texture }) => vi.spyOn(texture, 'dispose'));
      const setImagesSpy = vi.spyOn(vizBox, 'setImages');
      abortWhileLoadingFaceTextures();

      await expect(loadFullResolutionTextures()).rejects.toMatchObject({ name: 'AbortError' });

      expect(setImagesSpy).not.toHaveBeenCalled();
      disposeSpies.forEach(disposeSpy => expect(disposeSpy).toHaveBeenCalledOnce());
    });

    test('disposes the preview textures when aborted while loading them', async () => {
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(new Promise(() => {}))
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces()));
      const disposeSpies = textures.map(({ texture }) => vi.spyOn(texture, 'dispose'));
      abortWhileLoadingFaceTextures();

      void loadFullResolutionTextures();

      await vi.waitFor(() => disposeSpies.forEach(disposeSpy => expect(disposeSpy).toHaveBeenCalledOnce()));
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
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny()))
        .returns(Promise.resolve(createImage360StreamingFaces(1)));

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

  test('disposeGpuResources does not dispose annotation cache', async () => {
    providerMock
      .setup(p => p.resolveFileIdToExternalIdMapping)
      .returns(() => Promise.resolve(new Map<number, string>([[123, 'some-file']])));

    const entity = new Image360RevisionEntity(providerMock.object(), descriptor, vizBox, annotationFilterer);

    const classicAnnotation: AnnotationModel = {
      id: 345,
      annotatedResourceId: 123,
      annotatedResourceType: 'file',
      annotationType: 'Images.assetLink',
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
      status: 'approved',
      creatingUser: 'me',
      creatingAppVersion: '1.0',
      creatingApp: 'some-app',
      data: {
        label: 'label',
        polygon: { vertices: [] },
        text: 'annotation-text',
        textRegion: { xMax: 1, yMax: 1, xMin: 0, yMin: 0 },
        assetRef: { id: 345 }
      }
    };

    const annotation0 = (await entity.createAndAddAnnotationObjects([classicAnnotation]))[0];
    const annotation1 = (await entity.createAndAddAnnotationObjects([classicAnnotation]))[0];

    expect(annotation0).toBe(annotation1);

    entity.disposeGpuResources();

    const annotation2 = (await entity.createAndAddAnnotationObjects([classicAnnotation]))[0];
    expect(annotation0).toBe(annotation2);

    entity.dispose();

    const annotation3 = (await entity.createAndAddAnnotationObjects([classicAnnotation]))[0];

    expect(annotation0).not.toBe(annotation3);
  });
});
