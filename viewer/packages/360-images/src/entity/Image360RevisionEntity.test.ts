/*!
 * Copyright 2026 Cognite AS
 */

import { Mock, It, Times } from 'moq.ts';
import * as THREE from 'three';
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
    data: new ArrayBuffer(0),
    downloadUrl: `https://example.com/${face}.jpg`
  }));
}

function makeTextures(count: number): Image360Texture[] {
  const faceNames: Image360Face['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  return faceNames.slice(0, count).map(face => ({
    face,
    texture: new THREE.Texture()
  }));
}

describe(Image360RevisionEntity.name, () => {
  let providerMock: Mock<Image360Provider<ClassicDataSourceType>>;
  let vizBoxMock: Mock<Image360VisualizationBox>;
  let annotationFilterer: Image360AnnotationFilter;
  let descriptor: Image360Descriptor<ClassicDataSourceType>;

  beforeEach(() => {
    providerMock = new Mock<Image360Provider<ClassicDataSourceType>>();
    vizBoxMock = new Mock<Image360VisualizationBox>();

    annotationFilterer = new Image360AnnotationFilter({});

    descriptor = {
      id: 'revision-1',
      faceDescriptors: [{ fileId: 1, face: 'front', mimeType: 'image/jpeg' }]
    } satisfies Image360Descriptor<ClassicDataSourceType>;
  });

  describe('loadTextures', () => {
    test('returns lowResolutionCompleted and fullResolutionCompleted promises', () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));

      const textures = makeTextures(1);
      vizBoxMock.setup(v => v.loadFaceTextures(It.IsAny(), It.IsAny(), It.IsAny())).returns(Promise.resolve(textures));
      vizBoxMock.setup(v => v.loadImages(It.IsAny())).returns(undefined);
      vizBoxMock.setup(v => v.getTransform()).returns(new THREE.Matrix4());

      const entity = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBoxMock.object(),
        annotationFilterer
      );

      const result = entity.loadTextures();

      expect(result.lowResolutionCompleted).toBeInstanceOf(Promise);
      expect(result.fullResolutionCompleted).toBeInstanceOf(Promise);
    });

    test('calls get360ImageFiles on the provider', async () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));

      const textures = makeTextures(1);
      vizBoxMock.setup(v => v.loadFaceTextures(It.IsAny(), It.IsAny(), It.IsAny())).returns(Promise.resolve(textures));
      vizBoxMock.setup(v => v.loadImages(It.IsAny())).returns(undefined);
      vizBoxMock.setup(v => v.getTransform()).returns(new THREE.Matrix4());

      const entity = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBoxMock.object(),
        annotationFilterer
      );

      const { fullResolutionCompleted } = entity.loadTextures();
      await fullResolutionCompleted.catch(() => {});

      providerMock.verify(p => p.get360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
    });

    test('fullResolutionCompleted rejects when provider throws', async () => {
      providerMock
        .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.reject(new Error('fetch failed')));

      vizBoxMock.setup(v => v.loadImages(It.IsAny())).returns(undefined);
      vizBoxMock.setup(v => v.getTransform()).returns(new THREE.Matrix4());

      const entity = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBoxMock.object(),
        annotationFilterer
      );

      const { fullResolutionCompleted } = entity.loadTextures();

      await expect(fullResolutionCompleted).rejects.toThrow('fetch failed');
    });

    test('getLowResolution360ImageFiles is NOT called for progressive JPEG', async () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));

      // getLowResolution360ImageFiles should NOT be called — set it up to detect calls
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(makeFaces(1)));

      const textures = makeTextures(6);

      // loadFaceTextures immediately calls onFirstFaceTypeDetected('progressive') and onFirstFaceReady
      vizBoxMock
        .setup(v => v.loadFaceTextures(It.IsAny(), It.IsAny(), It.IsAny()))
        .callback(({ args }) => {
          const onFirstFaceReady = args[1] as (() => void) | undefined;
          const onFirstFaceTypeDetected = args[2] as ((type: 'progressive' | 'baseline') => void) | undefined;
          onFirstFaceTypeDetected?.('progressive');
          onFirstFaceReady?.();
          return Promise.resolve(textures);
        });

      vizBoxMock.setup(v => v.loadImages(It.IsAny())).returns(undefined);
      vizBoxMock.setup(v => v.getTransform()).returns(new THREE.Matrix4());

      const entity = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBoxMock.object(),
        annotationFilterer
      );

      const { fullResolutionCompleted } = entity.loadTextures();
      await fullResolutionCompleted;

      // getLowResolution360ImageFiles must NOT have been called for progressive JPEG
      providerMock.verify(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()), Times.Never());
    });

    test('getLowResolution360ImageFiles IS called for baseline JPEG', async () => {
      providerMock.setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny())).returns(Promise.resolve(makeFaces(1)));

      const lowResFaces = makeFaces(6);
      providerMock
        .setup(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(lowResFaces));

      const textures = makeTextures(6);

      // loadFaceTextures immediately calls onFirstFaceTypeDetected('baseline') and onFirstFaceReady
      vizBoxMock
        .setup(v => v.loadFaceTextures(It.IsAny(), It.IsAny(), It.IsAny()))
        .callback(({ args }) => {
          const onFirstFaceReady = args[1] as (() => void) | undefined;
          const onFirstFaceTypeDetected = args[2] as ((type: 'progressive' | 'baseline') => void) | undefined;
          onFirstFaceTypeDetected?.('baseline');
          onFirstFaceReady?.();
          return Promise.resolve(textures);
        });

      vizBoxMock.setup(v => v.loadImages(It.IsAny())).returns(undefined);
      vizBoxMock.setup(v => v.getTransform()).returns(new THREE.Matrix4());

      const entity = new Image360RevisionEntity(
        providerMock.object(),
        descriptor,
        vizBoxMock.object(),
        annotationFilterer
      );

      const { fullResolutionCompleted } = entity.loadTextures();
      await fullResolutionCompleted;

      // getLowResolution360ImageFiles MUST have been called for baseline JPEG
      providerMock.verify(p => p.getLowResolution360ImageFiles(It.IsAny(), It.IsAny()), Times.Once());
    });
  });
});
