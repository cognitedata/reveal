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
  AnnotationsAssetRef,
  AnnotationsInstanceRef
} from '@cognite/sdk';
import { DefaultImage360Collection, Image360Entity, Image360RevisionEntity } from '@reveal/360-images';
import { ClassicDataSourceType } from '../DataSourceType';
import { Image360Descriptor } from '../types';
import { ImageAnnotationObject } from '@reveal/360-images/src/annotation/ImageAnnotationObject';
import { createCursorAndAsyncIterator, createAnnotationModel } from '../../../../test-utilities';
import { Cdf360ImageAnnotationProvider } from './Cdf360ImageAnnotationProvider';

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
    annotatedResourceId: 30,
    annotationType: 'images.InstanceLink',
    data: {
      text: 'hybrid annotation for file ' + ARBITRARY_FILE_ID,
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.1 },
      instanceRef: instanceRef
    },
    status: 'approved'
  });

  const mockReverseLookup = jest.fn<CogniteClient['annotations']['reverseLookup']>().mockImplementation(
    (): CursorAndAsyncIterator<AnnotationsAssetRef> =>
      createCursorAndAsyncIterator({
        items: [
          {
            id: ARBITRARY_FILE_ID
          }
        ]
      })
  );
  const mockAnnotationList = jest.fn<CogniteClient['annotations']['list']>().mockImplementation(
    (): CursorAndAsyncIterator<AnnotationModel> =>
      createCursorAndAsyncIterator({
        items: [matchingAnnotation]
      })
  );

  const sdkMock = new Mock<CogniteClient>()
    .setup(p => p.annotations.reverseLookup)
    .returns(mockReverseLookup)
    .setup(p => p.annotations.list)
    .returns(mockAnnotationList)
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
    const getAllFileDescriptors = new Mock<() => Image360Descriptor<ClassicDataSourceType>>()
      .setup(f => f().faceDescriptors)
      .returns(
        entities.flatMap(entity => entity.getRevisions().flatMap(revision => revision.getDescriptors().faceDescriptors))
      )
      .object();

    const collection = new Mock<DefaultImage360Collection<ClassicDataSourceType>>()
      .setup(c => c.image360Entities)
      .returns(entities)
      .setup(c => c.getAllFileDescriptors)
      .returns(() => getAllFileDescriptors().faceDescriptors)
      .object();

    return collection;
  }

  describe('findImageAnnotationsForInstance', () => {
    test('returns annotations matching asset ref and image fileIds', async () => {
      const client = sdkMock;
      const provider = new Cdf360ImageAnnotationProvider(client);

      const revision = createMockRevision(10, [matchingAnnotation, nonMatchingAnnotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(assetRef, collection);

      expect(results[0].annotation.annotation).toEqual(matchingAnnotation);
    });

    test('returns annotations matching instance ref and image fileIds', async () => {
      const client = sdkMock;
      const provider = new Cdf360ImageAnnotationProvider(client);

      const revision = createMockRevision(10, [matchingHybridAnnotation, nonMatchingAnnotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(instanceRef, collection);

      expect(results[0].annotation.annotation).toEqual(matchingHybridAnnotation);
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
