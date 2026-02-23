/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { Mock } from 'moq.ts';
import {
  CogniteClient,
  AnnotationModel,
  InternalId,
  CursorAndAsyncIterator,
  AnnotationsInstanceRef,
  FileInfo
} from '@cognite/sdk';
import { DefaultImage360Collection, Image360Entity, Image360RevisionEntity } from '@reveal/360-images';
import { ClassicDataSourceType } from '../DataSourceType';
import { Image360Descriptor, Image360FileDescriptor } from '../types';
import { ImageAnnotationObject } from '@reveal/360-images/src/annotation/ImageAnnotationObject';
import { createCursorAndAsyncIterator, createAnnotationModel } from '../../../../test-utilities';
import { Cdf360ImageAnnotationProvider } from './Cdf360ImageAnnotationProvider';
import assert from 'assert';

describe(Cdf360ImageAnnotationProvider.name, () => {
  const ARBITRARY_FILE_ID = 10;

  const assetRef: InternalId = { id: 10 };

  const instanceRef: AnnotationsInstanceRef = {
    externalId: 'instance-1',
    space: 'space-1',
    instanceType: 'node',
    sources: []
  };

  const matchingAnnotation = createAnnotationModel({
    id: 1,
    annotatedResourceId: 10,
    annotationType: 'images.AssetLink',
    data: {
      text: 'a',
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.1 },
      assetRef
    },
    status: 'approved'
  });

  const nonMatchingAnnotation = createAnnotationModel({
    id: 2,
    annotatedResourceId: 20,
    annotationType: 'images.AssetLink',
    data: {
      text: 'b',
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.1 },
      assetRef: { id: 999 }
    },
    status: 'approved'
  });

  const matchingHybridAnnotation = createAnnotationModel({
    id: 3,
    annotatedResourceId: 30,
    annotationType: 'images.InstanceLink',
    data: {
      text: 'hybrid annotation for file ' + ARBITRARY_FILE_ID,
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.1 },
      instanceRef: instanceRef
    },
    status: 'approved'
  });

  const mockAnnotationList = jest.fn<CogniteClient['annotations']['list']>().mockImplementation(
    (): CursorAndAsyncIterator<AnnotationModel> =>
      createCursorAndAsyncIterator({
        items: [matchingAnnotation]
      })
  );

  const mockFilesRetrieve = jest.fn<CogniteClient['files']['retrieve']>().mockResolvedValue([]);

  const sdkMock = new Mock<CogniteClient>()
    .setup(p => p.annotations.list)
    .returns(mockAnnotationList)
    .setup(p => p.files.retrieve)
    .returns(mockFilesRetrieve)
    .object();

  function createMockRevision(
    fileId: number,
    annotations: AnnotationModel[]
  ): Image360RevisionEntity<ClassicDataSourceType> {
    const descriptor = new Mock<Image360Descriptor<ClassicDataSourceType>>()
      .setup(d => d.faceDescriptors)
      .returns([{ fileId, face: 'front', mimeType: 'image/jpeg' }])
      .object();

    const annotationObject1 = new Mock<ImageAnnotationObject<ClassicDataSourceType>>()
      .setup(a => a.annotation)
      .returns(annotations[0])
      .object();

    const annotationObject2 = new Mock<ImageAnnotationObject<ClassicDataSourceType>>()
      .setup(a => a.annotation)
      .returns(annotations[1])
      .object();

    const revision = new Mock<Image360RevisionEntity<ClassicDataSourceType>>()
      .setup(r => r.identifier)
      .returns('revision-' + fileId)
      .setup(r => r.getDescriptors())
      .returns(descriptor)
      .setup(r => r.getAnnotations())
      .returns(Promise.resolve([annotationObject1, annotationObject2]));

    return revision.object();
  }

  function createMockRevisionWithExternalId(
    externalId: string,
    annotations: AnnotationModel[]
  ): Image360RevisionEntity<ClassicDataSourceType> {
    const descriptor = new Mock<Image360Descriptor<ClassicDataSourceType>>()
      .setup(d => d.faceDescriptors)
      .returns([{ externalId, face: 'front', mimeType: 'image/jpeg' }])
      .object();

    const annotationObjects = annotations.map(annotation => {
      return new Mock<ImageAnnotationObject<ClassicDataSourceType>>()
        .setup(a => a.annotation)
        .returns(annotation)
        .object();
    });

    const revision = new Mock<Image360RevisionEntity<ClassicDataSourceType>>()
      .setup(r => r.identifier)
      .returns('revision-' + externalId)
      .setup(r => r.getDescriptors())
      .returns(descriptor)
      .setup(r => r.getAnnotations())
      .returns(Promise.resolve(annotationObjects));

    return revision.object();
  }

  function createMockEntity(
    revisions: Image360RevisionEntity<ClassicDataSourceType>[]
  ): Image360Entity<ClassicDataSourceType> {
    const entity = new Mock<Image360Entity<ClassicDataSourceType>>()
      .setup(e => e.getRevisions)
      .returns(() => revisions as Image360RevisionEntity<ClassicDataSourceType>[])
      .object();
    return entity;
  }

  function createMockCollection(
    entities: Image360Entity<ClassicDataSourceType>[]
  ): DefaultImage360Collection<ClassicDataSourceType> {
    const allFileDescriptors = entities.flatMap(entity =>
      entity.getRevisions().flatMap(revision => revision.getDescriptors().faceDescriptors)
    );

    const collection = new Mock<DefaultImage360Collection<ClassicDataSourceType>>()
      .setup(c => c.sourceId)
      .returns({ site_id: 'collection-id' })
      .setup(c => c.image360Entities)
      .returns(entities)
      .setup(c => c.getAllFileDescriptors)
      .returns(() => allFileDescriptors)
      .object();

    return collection;
  }

  describe('findImageAnnotationsForInstance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('returns annotations matching asset ref and image fileIds', async () => {
      const provider = new Cdf360ImageAnnotationProvider(sdkMock);

      const revision = createMockRevision(10, [matchingAnnotation, nonMatchingAnnotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(assetRef, collection);

      assert(results.length === 1);
      expect(results[0].annotation.annotation).toEqual(matchingAnnotation);
    });

    test('returns annotations matching instance ref and image fileIds', async () => {
      mockAnnotationList.mockImplementation(
        (): CursorAndAsyncIterator<AnnotationModel> =>
          createCursorAndAsyncIterator({
            items: [matchingHybridAnnotation]
          })
      );

      const provider = new Cdf360ImageAnnotationProvider(sdkMock);

      const revision = createMockRevision(30, [matchingHybridAnnotation, nonMatchingAnnotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(instanceRef, collection);

      assert(results.length === 1);
      expect(results[0].annotation.annotation).toEqual(matchingHybridAnnotation);
    });

    test('caches results', async () => {
      mockAnnotationList.mockImplementation(
        (): CursorAndAsyncIterator<AnnotationModel> =>
          createCursorAndAsyncIterator({
            items: [matchingHybridAnnotation]
          })
      );

      const provider = new Cdf360ImageAnnotationProvider(sdkMock);

      const revision = createMockRevision(30, [matchingHybridAnnotation, nonMatchingAnnotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(instanceRef, collection);
      const results2 = await provider.findImageAnnotationsForInstance(instanceRef, collection);

      assert(results.length === 1);
      expect(results2).toEqual(results);
    });

    test('returns annotations for descriptors with externalId', async () => {
      mockAnnotationList.mockImplementation(
        (): CursorAndAsyncIterator<AnnotationModel> =>
          createCursorAndAsyncIterator({
            items: [matchingAnnotation]
          })
      );
      mockFilesRetrieve.mockResolvedValue([{ id: 10, externalId: 'file-external-id', name: 'file1' } as FileInfo]);

      const provider = new Cdf360ImageAnnotationProvider(sdkMock);

      const revision = createMockRevisionWithExternalId('file-external-id', [
        matchingAnnotation,
        nonMatchingAnnotation
      ]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(assetRef, collection);

      assert(results.length === 1);
      expect(results[0].annotation.annotation).toEqual(matchingAnnotation);
    });
  });

  describe('resolveFileIdToExternalIdMapping', () => {
    test('returns mapping from descriptors without API call when descriptors have fileId', async () => {
      const mockFilesRetrieve = jest.fn<CogniteClient['files']['retrieve']>();
      const clientWithFiles = new Mock<CogniteClient>()
        .setup(p => p.annotations.list)
        .returns(mockAnnotationList)
        .setup(p => p.files.retrieve)
        .returns(mockFilesRetrieve)
        .object();

      const provider = new Cdf360ImageAnnotationProvider(clientWithFiles);

      const descriptors: Image360FileDescriptor[] = [
        { fileId: 100, externalId: 'file-100-ext', face: 'front', mimeType: 'image/jpeg' },
        { fileId: 200, externalId: 'file-200-ext', face: 'back', mimeType: 'image/jpeg' }
      ];

      const annotations: AnnotationModel[] = [
        createAnnotationModel({
          annotatedResourceId: 100,
          annotationType: 'images.AssetLink',
          data: {},
          status: 'approved'
        }),
        createAnnotationModel({
          annotatedResourceId: 200,
          annotationType: 'images.AssetLink',
          data: {},
          status: 'approved'
        })
      ];

      const result = await provider.resolveFileIdToExternalIdMapping(annotations, descriptors);

      expect(result.get(100)).toBe('file-100-ext');
      expect(result.get(200)).toBe('file-200-ext');
      expect(mockFilesRetrieve).not.toHaveBeenCalled();
    });

    test('fetches file info via API when descriptors only have externalId', async () => {
      const mockFilesRetrieve = jest
        .fn<CogniteClient['files']['retrieve']>()
        .mockResolvedValue([
          { id: 100, externalId: 'file-100-ext', name: 'file1' } as FileInfo,
          { id: 200, externalId: 'file-200-ext', name: 'file2' } as FileInfo
        ]);

      const clientWithFiles = new Mock<CogniteClient>()
        .setup(p => p.annotations.list)
        .returns(mockAnnotationList)
        .setup(p => p.files.retrieve)
        .returns(mockFilesRetrieve)
        .object();

      const provider = new Cdf360ImageAnnotationProvider(clientWithFiles);

      const descriptors: Image360FileDescriptor[] = [
        { externalId: 'file-100-ext', face: 'front', mimeType: 'image/jpeg' },
        { externalId: 'file-200-ext', face: 'back', mimeType: 'image/jpeg' }
      ];

      const annotations: AnnotationModel[] = [
        createAnnotationModel({
          annotatedResourceId: 100,
          annotationType: 'images.AssetLink',
          data: {},
          status: 'approved'
        }),
        createAnnotationModel({
          annotatedResourceId: 200,
          annotationType: 'images.AssetLink',
          data: {},
          status: 'approved'
        })
      ];

      const result = await provider.resolveFileIdToExternalIdMapping(annotations, descriptors);

      expect(result.get(100)).toBe('file-100-ext');
      expect(result.get(200)).toBe('file-200-ext');
      expect(mockFilesRetrieve).toHaveBeenCalledWith([{ id: 100 }, { id: 200 }]);
    });

    test('uses instanceId.externalId when descriptor has instanceId', async () => {
      const mockFilesRetrieve = jest.fn<CogniteClient['files']['retrieve']>();
      const clientWithFiles = new Mock<CogniteClient>()
        .setup(p => p.annotations.list)
        .returns(mockAnnotationList)
        .setup(p => p.files.retrieve)
        .returns(mockFilesRetrieve)
        .object();

      const provider = new Cdf360ImageAnnotationProvider(clientWithFiles);

      const descriptors: Image360FileDescriptor[] = [
        {
          fileId: 100,
          instanceId: { externalId: 'instance-ext', space: 'space1' },
          face: 'front',
          mimeType: 'image/jpeg'
        }
      ];

      const annotations: AnnotationModel[] = [
        createAnnotationModel({
          annotatedResourceId: 100,
          annotationType: 'images.AssetLink',
          data: {},
          status: 'approved'
        })
      ];

      const result = await provider.resolveFileIdToExternalIdMapping(annotations, descriptors);

      expect(result.get(100)).toBe('instance-ext');
      expect(mockFilesRetrieve).not.toHaveBeenCalled();
    });
  });

  describe('getAllImage360AnnotationInfos', () => {
    test('maps instance link annotations to entity + revision for hybrid', async () => {
      mockAnnotationList.mockImplementation(
        (): CursorAndAsyncIterator<AnnotationModel> =>
          createCursorAndAsyncIterator({
            items: [matchingHybridAnnotation]
          })
      );

      const client = sdkMock;
      const provider = new Cdf360ImageAnnotationProvider(client);

      const revision1 = createMockRevision(30, [matchingHybridAnnotation]);
      const entity = createMockEntity([revision1]);
      const collection = createMockCollection([entity]);

      const results = await provider.getAllImage360AnnotationInfos('hybrid', collection, () => true);

      const annotatedIds = results.map(r => r.annotationInfo.annotatedResourceId).sort();
      expect(annotatedIds).toEqual([30]);
      results.forEach(r => {
        expect(r.imageEntity).toBe(entity);
        expect(r.imageRevision).toBeDefined();
      });
    });

    test('maps asset link annotations to entity + revision for classic', async () => {
      mockAnnotationList.mockImplementation(
        (): CursorAndAsyncIterator<AnnotationModel> =>
          createCursorAndAsyncIterator({
            items: [matchingAnnotation]
          })
      );

      const client = sdkMock;
      const provider = new Cdf360ImageAnnotationProvider(client);

      const revision1 = createMockRevision(10, [matchingHybridAnnotation]);
      const entity = createMockEntity([revision1]);
      const collection = createMockCollection([entity]);

      const results = await provider.getAllImage360AnnotationInfos('assets', collection, () => true);

      const annotatedIds = results.map(r => r.annotationInfo.annotatedResourceId).sort();
      expect(annotatedIds).toEqual([10]);
      results.forEach(r => {
        expect(r.imageEntity).toBe(entity);
        expect(r.imageRevision).toBeDefined();
      });
    });
  });
});
