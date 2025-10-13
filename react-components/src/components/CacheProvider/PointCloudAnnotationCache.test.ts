import { describe, it, expect, beforeEach, vi, assert } from 'vitest';
import { PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { createAssetMock, createFdmNodeItem } from '#test-utils/fixtures/assets';
import {
  type AnnotationModel,
  type AnnotationsInstanceRef,
  type CogniteClient,
  type CursorAndAsyncIterator,
  type IdEither
} from '@cognite/sdk';
import { type PointCloudAnnotationModel } from './types';
import { type DmsUniqueIdentifier } from '../../data-providers';

import { type fetchPointCloudAnnotationAssets } from './annotationModelUtils';
import { Mock } from 'moq.ts';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';
import { createPointCloudAnnotationMock } from '#test-utils/fixtures/pointCloudAnnotation';
import { type InstanceReference } from '../../utilities/instanceIds';

describe(PointCloudAnnotationCache.name, () => {
  const mockFetchPointCloudAnnotationAssets = vi.fn<typeof fetchPointCloudAnnotationAssets>();

  const modelId = 123;
  const revisionId = 456;
  const annotationId = 789;

  const dmInstanceRef: AnnotationsInstanceRef = {
    externalId: 'test-external-id',
    space: 'test-space',
    instanceType: 'node',
    sources: []
  };

  const mockAnnotations: PointCloudAnnotationModel[] = [
    createPointCloudAnnotationMock({ annotationId, modelId, assetId: 1 }),
    createPointCloudAnnotationMock({ annotationId: annotationId + 1, modelId, assetId: 2 }),
    createPointCloudAnnotationMock({
      annotationId: annotationId + 2,
      modelId,
      dmIdentifier: dmInstanceRef
    })
  ];

  const mockAssetInstances = [createAssetMock(1), createAssetMock(2)];

  const mockAssetMappings = new Map([
    [annotationId, [mockAssetInstances[0]]],
    [annotationId + 1, [mockAssetInstances[1]]]
  ]);
  const dummyAnnotationsResponse = {
    items: mockAnnotations
  };

  const annotationsMock: CogniteClient['annotations'] = new Mock<CogniteClient['annotations']>()
    .setup((p) => p.list)
    .returns(
      (): CursorAndAsyncIterator<PointCloudAnnotationModel> =>
        createCursorAndAsyncIteratorMock({
          items: dummyAnnotationsResponse.items
        })
    )
    .object();
  const sdkMock = new Mock<CogniteClient>().setup((p) => p.annotations).returns(annotationsMock);
  let cache: PointCloudAnnotationCache;

  beforeEach(() => {
    sdkMock.setup((p) => p.annotations).returns(annotationsMock);

    mockFetchPointCloudAnnotationAssets.mockResolvedValue(mockAssetMappings);
    cache = new PointCloudAnnotationCache(sdkMock.object(), {
      fetchAnnotationAssets: mockFetchPointCloudAnnotationAssets
    });
  });

  describe('getPointCloudAnnotationsForModel', () => {
    it('fetches and caches annotations for model', async () => {
      const result = await cache.getPointCloudAnnotationsForModel(modelId, revisionId);

      expect(result).toEqual(mockAnnotations);
    });

    it('throws assertion error if annotations have wrong type', async () => {
      const wrongTypeAnnotation: AnnotationModel = {
        ...createPointCloudAnnotationMock(),
        annotationType: 'wrong-type'
      };
      const annotationsMock: CogniteClient['annotations'] = new Mock<CogniteClient['annotations']>()
        .setup((p) => p.list)
        .returns(
          (): CursorAndAsyncIterator<AnnotationModel> =>
            createCursorAndAsyncIteratorMock({
              items: [wrongTypeAnnotation]
            })
        )
        .object();

      sdkMock.setup((p) => p.annotations).returns(annotationsMock);

      await expect(cache.getPointCloudAnnotationsForModel(modelId, revisionId)).rejects.toThrow();
    });
  });

  describe('matchPointCloudAnnotationsForModel', () => {
    const targetAssetId: IdEither = { id: 1 };

    it('returns matching annotations for asset ID', async () => {
      const result = await cache.matchPointCloudAnnotationsForModel(
        modelId,
        revisionId,
        targetAssetId
      );

      assert(result !== undefined);
      expect(result.size).toBe(1);
      expect(result.has(annotationId)).toBe(true);
      expect(result.get(annotationId)).toEqual([mockAssetInstances[0]]);
    });

    it('returns matching annotations for DMS unique identifier', async () => {
      const dmsIdentifier: DmsUniqueIdentifier = {
        externalId: 'test-external-id',
        space: 'test-space'
      };

      const dmsAssetInstance = createFdmNodeItem(dmsIdentifier);

      const dmsMappings = new Map([[annotationId, [dmsAssetInstance]]]);

      mockFetchPointCloudAnnotationAssets.mockResolvedValue(dmsMappings);

      const result = await cache.matchPointCloudAnnotationsForModel(
        modelId,
        revisionId,
        dmsIdentifier
      );

      assert(result !== undefined);
      expect(result.get(annotationId)).toEqual([dmsAssetInstance]);
      expect(result.size).toBe(1);
      expect(result.has(annotationId)).toBe(true);
    });

    it('returns undefined when no matching annotations found', async () => {
      const nonExistentAssetId: IdEither = { id: 999 };

      const result = await cache.matchPointCloudAnnotationsForModel(
        modelId,
        revisionId,
        nonExistentAssetId
      );

      expect(result).toBeUndefined();
    });

    it('caches asset mappings between calls', async () => {
      await cache.matchPointCloudAnnotationsForModel(modelId, revisionId, targetAssetId);

      mockFetchPointCloudAnnotationAssets.mockClear();

      const differentAssetId: IdEither = { id: 2 };
      await cache.matchPointCloudAnnotationsForModel(modelId, revisionId, differentAssetId);

      expect(mockFetchPointCloudAnnotationAssets).not.toHaveBeenCalled();
    });
  });

  describe('getPointCloudAnnotationsForInstanceIds', () => {
    const classicIds: number[] = [1, 2];
    const classicExternalIds: string[] = ['3', '4'];

    it('returns annotation IDs for classic asset instance IDs', async () => {
      const instanceIds: IdEither[] = [{ id: classicIds[0] }, { id: classicIds[1] }];

      const result = await cache.getPointCloudAnnotationsForInstanceIds(
        modelId,
        revisionId,
        instanceIds
      );

      expect(result.size).toBe(2);
      expect(result.get(classicIds[0])).toEqual([annotationId]);
      expect(result.get(classicIds[1])).toEqual([annotationId + 1]);
    });

    it('returns annotation IDs for external ID instance IDs', async () => {
      const assetWithExternalIds = [
        createAssetMock(1, classicExternalIds[0]),
        createAssetMock(2, classicExternalIds[1])
      ];
      const mappingsWithExternalIds = new Map([
        [annotationId, [assetWithExternalIds[0]]],
        [annotationId + 1, [assetWithExternalIds[1]]]
      ]);

      mockFetchPointCloudAnnotationAssets.mockResolvedValue(mappingsWithExternalIds);

      const instanceIds: IdEither[] = [
        { externalId: classicExternalIds[0] },
        { externalId: classicExternalIds[1] }
      ];

      const result = await cache.getPointCloudAnnotationsForInstanceIds(
        modelId,
        revisionId,
        instanceIds
      );

      expect(result.size).toBe(2);
      expect(result.get(Number(classicExternalIds[0]))).toEqual([annotationId]);
      expect(result.get(Number(classicExternalIds[1]))).toEqual([annotationId + 1]);
    });

    it('returns annotation IDs for DMS instance IDs', async () => {
      const dmsIdentifier: DmsUniqueIdentifier = {
        externalId: 'test-external-id',
        space: 'test-space'
      };
      const dmsAssetInstance = createFdmNodeItem(dmsIdentifier);
      const dmsMappings = new Map([[annotationId, [dmsAssetInstance]]]);

      mockFetchPointCloudAnnotationAssets.mockResolvedValue(dmsMappings);

      const instanceIds: InstanceReference[] = [dmsIdentifier];

      const result = await cache.getPointCloudAnnotationsForInstanceIds(
        modelId,
        revisionId,
        instanceIds
      );

      expect(result.size).toBe(1);
      const instanceKey: `${string}/${string}` = `${dmsIdentifier.space}/${dmsIdentifier.externalId}`;
      expect(result.get(instanceKey)).toEqual([annotationId]);
    });

    it('returns empty map when no matching annotations found', async () => {
      const nonExistentAssetId: IdEither = { id: 999 };
      const instanceIds: InstanceReference[] = [
        nonExistentAssetId,
        { externalId: 'non-existent', space: 'test-space' }
      ];

      const result = await cache.getPointCloudAnnotationsForInstanceIds(
        modelId,
        revisionId,
        instanceIds
      );

      expect(result.size).toBe(0);
    });

    it('handles mixed instance ID types', async () => {
      const dmsAsset = createFdmNodeItem({
        externalId: 'test-external-id-asset-1',
        space: 'test-space'
      });
      const mixedMappings = new Map([
        [annotationId, [mockAssetInstances[0]]],
        [annotationId + 1, [dmsAsset]]
      ]);

      mockFetchPointCloudAnnotationAssets.mockResolvedValue(mixedMappings);

      const instanceIds: InstanceReference[] = [
        { id: 1 },
        { externalId: 'test-external-id-asset-1', space: 'test-space' }
      ];

      const result = await cache.getPointCloudAnnotationsForInstanceIds(
        modelId,
        revisionId,
        instanceIds
      );

      expect(result.size).toBe(2);
      expect(result.get(1)).toEqual([annotationId]);
      expect(result.get('test-space/test-external-id-asset-1')).toEqual([annotationId + 1]);
    });

    it('caches asset mappings between calls', async () => {
      const instanceIds: InstanceReference[] = [{ id: 1 }];

      await cache.getPointCloudAnnotationsForInstanceIds(modelId, revisionId, instanceIds);

      mockFetchPointCloudAnnotationAssets.mockClear();

      await cache.getPointCloudAnnotationsForInstanceIds(modelId, revisionId, [{ id: 2 }]);

      expect(mockFetchPointCloudAnnotationAssets).not.toHaveBeenCalled();
    });
  });
});
