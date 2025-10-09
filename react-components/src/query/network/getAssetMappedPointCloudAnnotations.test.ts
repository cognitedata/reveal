import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getAssetsMappedPointCloudAnnotations } from './getAssetMappedPointCloudAnnotations';
import { It, Mock } from 'moq.ts';
import { type CogniteClient, type AnnotationFilterProps } from '@cognite/sdk';
import { type ClassicModelIdentifierType, type ClassicDataSourceType } from '@cognite/reveal';
import { type AddPointCloudResourceOptions } from '../../components';
import { createAssetMock, createFdmNodeItem } from '../../../tests/tests-utilities/fixtures/assets';
import { createPointCloudAnnotationMock } from '../../../tests/tests-utilities/fixtures/pointCloudAnnotation';
import { type FdmNode, type FdmSDK } from '../../data-providers/FdmSDK';
import { createCursorAndAsyncIteratorMock } from '../../../tests/tests-utilities/fixtures/cursorAndIterator';

import { type getAssetsForIds } from './common/getAssetsForIds';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { annotationsListMock } from '#test-utils/fixtures/sdk';

describe(getAssetsMappedPointCloudAnnotations.name, () => {
  let mockSdk: CogniteClient;
  let mockFdmSdk: FdmSDK;

  const mockGetAssetsForIds = vi.fn<typeof getAssetsForIds>();

  const mockModelId1 = 123;
  const mockModelId2 = 789;
  const mockModelId3 = 456;
  const mockRevisionId1 = 456;
  const mockRevisionId2 = 101;

  const mockModels = [
    { modelId: mockModelId1, revisionId: mockRevisionId1 },
    { modelId: mockModelId2, revisionId: mockRevisionId2 }
  ] as Array<AddPointCloudResourceOptions<ClassicDataSourceType>>;

  const mockAssets = [createAssetMock(1, 'Asset 1'), createAssetMock(2, 'Asset 2')];

  const mockDmsInstances = createFdmNodeItem({
    externalId: 'test-external-id',
    space: 'test-space'
  });

  const mockDmsResult = {
    items: [
      {
        ...mockDmsInstances,
        properties: {
          cdf_cdm: {
            'CogniteAsset/v1': mockDmsInstances.properties
          }
        },
        sources: [
          {
            externalId: 'source-external-id',
            space: 'source-space',
            type: 'view' as const,
            version: '1'
          }
        ]
      }
    ]
  };

  beforeEach(async () => {
    const annotationRetrieveMock = new Mock<CogniteClient['annotations']>()
      .setup((p) => p.list)
      .returns(annotationsListMock)
      .object();
    mockSdk = new Mock<CogniteClient>()
      .setup((p) => p.getBaseUrl())
      .returns('https://api.cognitedata.com')
      .setup((p) => p.project)
      .returns('test-project')
      .setup((p) => p.annotations)
      .returns(annotationRetrieveMock)
      .object();

    mockFdmSdk = new Mock<FdmSDK>()
      .setup(async (p) => await p.getByExternalIds<AssetProperties>(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(mockDmsResult))
      .object();

    mockGetAssetsForIds.mockResolvedValue(mockAssets);
  });

  describe('basic functionality', () => {
    test('returns assets from point cloud annotations without filters', async () => {
      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        undefined,
        { getAssetsByIds: mockGetAssetsForIds }
      );

      expect(result).toEqual(mockAssets);
    });

    test('returns both classic assets and DMS instances when FDM SDK provided', async () => {
      const annotationWithAssetRef = createPointCloudAnnotationMock({
        assetId: 1,
        modelId: mockModelId1
      });
      const annotationWithDmsRef = createPointCloudAnnotationMock({
        modelId: mockModelId3,
        dmIdentifier: {
          space: mockDmsInstances.space,
          externalId: mockDmsInstances.externalId
        }
      });

      const mixedAnnotations = [annotationWithAssetRef, annotationWithDmsRef];

      annotationsListMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({ items: mixedAnnotations })
      );

      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        mockFdmSdk,
        { getAssetsByIds: mockGetAssetsForIds }
      );

      const expectedDmsInstanceResult: FdmNode<AssetProperties> = {
        ...mockDmsResult.items[0],
        properties: mockDmsInstances.properties
      };

      expect(result).toEqual([...mockAssets, expectedDmsInstanceResult]);
    });

    test('returns only classic assets when FDM SDK not provided', async () => {
      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        undefined,
        {
          getAssetsByIds: mockGetAssetsForIds
        }
      );

      expect(result).toEqual(mockAssets);
      expect(result).toHaveLength(mockAssets.length);
    });

    test('handles empty models array', async () => {
      mockGetAssetsForIds.mockResolvedValue([]);

      const result = await getAssetsMappedPointCloudAnnotations([], undefined, mockSdk, undefined, {
        getAssetsByIds: mockGetAssetsForIds
      });

      expect(result).toEqual([]);
      expect(mockSdk.annotations.list).toHaveBeenCalledTimes(0);
    });
  });

  describe('annotation filtering', () => {
    test('fetches annotations with correct filter parameters', async () => {
      await getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk);

      const expectedFilter: AnnotationFilterProps = {
        annotatedResourceIds: [{ id: mockModelId1 }, { id: mockModelId2 }],
        annotatedResourceType: 'threedmodel',
        annotationType: 'pointcloud.BoundingVolume'
      };

      expect(mockSdk.annotations.list).toHaveBeenCalledWith({
        filter: expectedFilter,
        limit: 1000
      });
    });

    test('handles large number of models by chunking requests', async () => {
      // Create more than 1000 models to test chunking
      const largeModelList: ClassicModelIdentifierType[] = Array.from({ length: 1500 }, (_, i) => ({
        modelId: i,
        revisionId: i + 1000
      }));

      await getAssetsMappedPointCloudAnnotations(largeModelList, undefined, mockSdk);

      // Should be called twice due to chunking (1000 + 500)
      expect(mockSdk.annotations.list).toHaveBeenCalledTimes(2);
    });
  });

  describe('asset filtering', () => {
    test('filters out annotations without asset references', async () => {
      const annotationsWithoutAssets = [
        createPointCloudAnnotationMock({ assetId: 1, modelId: 123 }),
        {
          ...createPointCloudAnnotationMock({ modelId: 789 }),
          data: { region: [] }
        }
      ];

      const mockAnnotationsList = createCursorAndAsyncIteratorMock({
        items: annotationsWithoutAssets
      });
      vi.mocked(mockSdk.annotations.list).mockReturnValue(mockAnnotationsList);

      await getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk, undefined, {
        getAssetsByIds: mockGetAssetsForIds
      });
    });
  });

  describe('DMS instance handling', () => {
    test('processes DMS instances correctly', async () => {
      const annotationWithDmsRef = createPointCloudAnnotationMock({
        modelId: mockModelId3,
        dmIdentifier: { space: 'test-space', externalId: 'test-external-id' }
      });

      const mockAnnotationsList = createCursorAndAsyncIteratorMock({
        items: [annotationWithDmsRef]
      });
      vi.mocked(mockSdk.annotations.list).mockReturnValue(mockAnnotationsList);

      mockGetAssetsForIds.mockResolvedValue([]);

      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        mockFdmSdk,
        { getAssetsByIds: mockGetAssetsForIds }
      );

      const expectedDmsInstanceResult: FdmNode<AssetProperties> = {
        ...mockDmsResult.items[0],
        properties: mockDmsInstances.properties
      };
      expect(result).toEqual([expectedDmsInstanceResult]);
    });

    test('handles empty DMS instances gracefully', async () => {
      const mockDmsResult = { items: [] };

      mockFdmSdk = new Mock<FdmSDK>()
        .setup(async (p) => await p.getByExternalIds<AssetProperties>(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(mockDmsResult))
        .object();

      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        mockFdmSdk,
        { getAssetsByIds: mockGetAssetsForIds }
      );

      expect(result).toEqual(mockAssets);
    });
  });

  describe('error handling', () => {
    test('propagates errors from annotations API', async () => {
      const mockErrorIterator = createCursorAndAsyncIteratorMock({ items: [] });
      mockErrorIterator.autoPagingToArray = vi.fn(
        async () => await Promise.reject(new Error('Annotations API error'))
      );
      vi.mocked(mockSdk.annotations.list).mockReturnValue(mockErrorIterator);

      await expect(
        getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk)
      ).rejects.toThrow('Annotations API error');
    });

    test('propagates errors from assets API', async () => {
      mockGetAssetsForIds.mockRejectedValue(new Error('Assets API error'));

      await expect(
        getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk, undefined, {
          getAssetsByIds: mockGetAssetsForIds
        })
      ).rejects.toThrow('Assets API error');
    });

    test('propagates errors from FDM SDK', async () => {
      const annotationWithDmsRef = createPointCloudAnnotationMock({
        modelId: mockModelId3,
        dmIdentifier: { space: 'test-space', externalId: 'test-external-id' }
      });

      annotationsListMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          items: [annotationWithDmsRef]
        })
      );

      mockFdmSdk = new Mock<FdmSDK>()
        .setup((p) => p.getByExternalIds)
        .returns(async () => await Promise.reject(new Error('FDM SDK error')))
        .object();

      await expect(
        getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk, mockFdmSdk, {
          getAssetsByIds: mockGetAssetsForIds
        })
      ).rejects.toThrow('FDM SDK error');
    });
  });
});
