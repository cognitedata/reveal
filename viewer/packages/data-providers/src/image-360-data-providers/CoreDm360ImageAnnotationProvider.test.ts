/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { Mock } from 'moq.ts';
import { CogniteClient, EdgeDefinition, NodeDefinition } from '@cognite/sdk';
import { DefaultImage360Collection, Image360Entity, Image360RevisionEntity } from '@reveal/360-images';
import { DMDataSourceType } from '../DataSourceType';
import { CoreDm360ImageAnnotationProvider } from './CoreDm360ImageAnnotationProvider';
import { ImageAnnotationObject } from '@reveal/360-images/src/annotation/ImageAnnotationObject';
import { DMInstanceRef } from '@reveal/utilities';
import assert from 'assert';

describe(CoreDm360ImageAnnotationProvider.name, () => {
  const instanceFilter: DMInstanceRef = {
    externalId: 'asset-1',
    space: 'space-1'
  };

  const revisionId: DMInstanceRef = {
    externalId: 'revision-1',
    space: 'space-1'
  };

  const annotationId: DMInstanceRef = {
    externalId: 'annotation-1',
    space: 'space-1'
  };

  const otherAnnotationId: DMInstanceRef = {
    externalId: 'other-annotation',
    space: 'space-1'
  };

  function createMockEdge(id: DMInstanceRef): EdgeDefinition {
    return {
      externalId: id.externalId,
      space: id.space,
      instanceType: 'edge',
      createdTime: 0,
      lastUpdatedTime: 0,
      startNode: { space: 'space-1', externalId: 'start-node' },
      endNode: { space: 'space-1', externalId: 'end-node' },
      type: { space: 'space-1', externalId: 'edge-type' },
      version: 1
    };
  }

  function createMockNode(id: DMInstanceRef): NodeDefinition {
    return {
      externalId: id.externalId,
      space: id.space,
      instanceType: 'node',
      createdTime: 0,
      lastUpdatedTime: 0,
      version: 1
    };
  }

  function createQueryResponse(annotationIds: DMInstanceRef[], imageRevisionIds: DMInstanceRef[]) {
    return {
      items: {
        annotation_edges: annotationIds.map(id => createMockEdge(id)),
        image_revisions: imageRevisionIds.map(id => createMockNode(id))
      },
      nextCursor: {}
    };
  }

  const mockInstancesQuery = jest
    .fn<CogniteClient['instances']['query']>()
    .mockResolvedValue(createQueryResponse([annotationId], [revisionId]));

  const sdkMock = new Mock<CogniteClient>()
    .setup(p => p.instances.query)
    .returns(mockInstancesQuery)
    .object();

  function createMockRevision(
    identifier: DMInstanceRef,
    annotationObjects: ImageAnnotationObject<DMDataSourceType>[]
  ): Image360RevisionEntity<DMDataSourceType> {
    const revision = new Mock<Image360RevisionEntity<DMDataSourceType>>()
      .setup(r => r.identifier)
      .returns(identifier)
      .setup(r => r.getAnnotations())
      .returns(Promise.resolve(annotationObjects));

    return revision.object();
  }

  function createMockAnnotationObject(id: DMInstanceRef): ImageAnnotationObject<DMDataSourceType> {
    return new Mock<ImageAnnotationObject<DMDataSourceType>>()
      .setup(a => a.annotation)
      .returns({
        annotationIdentifier: id
      } as DMDataSourceType['image360AnnotationType'])
      .object();
  }

  function createMockEntity(revisions: Image360RevisionEntity<DMDataSourceType>[]): Image360Entity<DMDataSourceType> {
    const entity = new Mock<Image360Entity<DMDataSourceType>>()
      .setup(e => e.getRevisions)
      .returns(() => revisions as Image360RevisionEntity<DMDataSourceType>[])
      .object();
    return entity;
  }

  function createMockCollection(
    entities: Image360Entity<DMDataSourceType>[]
  ): DefaultImage360Collection<DMDataSourceType> {
    const collection = new Mock<DefaultImage360Collection<DMDataSourceType>>()
      .setup(c => c.sourceId)
      .returns({ image360CollectionExternalId: 'collection-1', space: 'space-1' })
      .setup(c => c.image360Entities)
      .returns(entities)
      .setup(c => c.waitForEntities())
      .returns(Promise.resolve([...entities]))
      .setup(c => c.id)
      .returns('collection-1')
      .object();

    return collection;
  }

  function createMutableMockCollection(
    entitiesArray: Image360Entity<DMDataSourceType>[]
  ): DefaultImage360Collection<DMDataSourceType> {
    return new Mock<DefaultImage360Collection<DMDataSourceType>>()
      .setup(p => p.sourceId)
      .returns({ image360CollectionExternalId: 'collection-1', space: 'space-1' })
      .setup(p => p.id)
      .returns('collection-1')
      .setup(p => p.image360Entities)
      .returns(entitiesArray)
      .setup(p => p.waitForEntities())
      .callback(() => Promise.resolve([...entitiesArray]))
      .object();
  }

  function createSdkMockWithQueryResponse(
    annotationIds: DMInstanceRef[],
    imageRevisionIds: DMInstanceRef[]
  ): CogniteClient {
    const mockQuery = jest
      .fn<CogniteClient['instances']['query']>()
      .mockResolvedValue(createQueryResponse(annotationIds, imageRevisionIds));

    return new Mock<CogniteClient>()
      .setup(p => p.instances.query)
      .returns(mockQuery)
      .object();
  }

  describe('findImageAnnotationsForInstance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockInstancesQuery.mockResolvedValue(createQueryResponse([annotationId], [revisionId]));
    });

    test('returns annotations matching instance ref and revision ids', async () => {
      const provider = new CoreDm360ImageAnnotationProvider(sdkMock);

      const matchingAnnotation = createMockAnnotationObject(annotationId);
      const nonMatchingAnnotation = createMockAnnotationObject(otherAnnotationId);
      const revision = createMockRevision(revisionId, [matchingAnnotation, nonMatchingAnnotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(instanceFilter, collection);

      assert(results.length === 1);
      expect(results[0].image).toBe(entity);
      expect(results[0].revision).toBe(revision);
      expect(results[0].annotation).toBe(matchingAnnotation);
    });

    test('returns empty array when collection has no entities', async () => {
      const provider = new CoreDm360ImageAnnotationProvider(sdkMock);

      const collection = createMockCollection([]);

      const results = await provider.findImageAnnotationsForInstance(instanceFilter, collection);

      expect(results).toEqual([]);
    });

    test('returns empty array when no matching revisions found', async () => {
      const sdkMockEmptyResponse = createSdkMockWithQueryResponse([], []);
      const provider = new CoreDm360ImageAnnotationProvider(sdkMockEmptyResponse);

      const annotation = createMockAnnotationObject(annotationId);
      const revision = createMockRevision(revisionId, [annotation]);
      const entity = createMockEntity([revision]);
      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(instanceFilter, collection);

      expect(results).toEqual([]);
    });

    test('clones entities array to protect against disposal during async operations', async () => {
      const annotation = createMockAnnotationObject(annotationId);
      const revision = createMockRevision(revisionId, [annotation]);
      const entity = createMockEntity([revision]);

      // Create a mutable entities array to simulate disposal
      const entitiesArray: Image360Entity<DMDataSourceType>[] = [entity];
      const mutableCollection = createMutableMockCollection(entitiesArray);

      // Mock that clears entities during the async operation
      const mockQueryThatDisposesCollection = jest
        .fn<CogniteClient['instances']['query']>()
        .mockImplementation(async () => {
          // Simulate disposal during async operation
          entitiesArray.splice(0);
          return createQueryResponse([annotationId], [revisionId]);
        });

      const sdkMockWithDisposal = new Mock<CogniteClient>()
        .setup(p => p.instances.query)
        .returns(mockQueryThatDisposesCollection)
        .object();

      const provider = new CoreDm360ImageAnnotationProvider(sdkMockWithDisposal);

      const results = await provider.findImageAnnotationsForInstance(instanceFilter, mutableCollection);

      // Should still return results because we cloned the array before the async operation
      assert(results.length === 1);
      // Original array should be empty (disposed)
      expect(entitiesArray.length).toBe(0);
    });
  });

  describe('waitForEntities behavior', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockInstancesQuery.mockResolvedValue(createQueryResponse([annotationId], [revisionId]));
    });

    test('returns annotations when waitForEntities resolves with entities', async () => {
      const provider = new CoreDm360ImageAnnotationProvider(sdkMock);

      const annotation = createMockAnnotationObject(annotationId);
      const revision = createMockRevision(revisionId, [annotation]);
      const entity = createMockEntity([revision]);

      const collection = createMockCollection([entity]);

      const results = await provider.findImageAnnotationsForInstance(instanceFilter, collection);

      assert(results.length === 1);
      expect(results[0].image).toBe(entity);
    });

    test('returns empty array when waitForEntities resolves with empty array', async () => {
      const provider = new CoreDm360ImageAnnotationProvider(sdkMock);

      const collection = createMockCollection([]);

      const results = await provider.findImageAnnotationsForInstance(instanceFilter, collection);

      expect(results).toEqual([]);
    });
  });
});
