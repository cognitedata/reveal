import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getAssetsMappedPointCloudAnnotations } from './getAssetMappedPointCloudAnnotations';
import { Mock } from 'moq.ts';
import {
  type AnnotationModel,
  type CogniteClient,
  type AnnotationFilterProps,
  type CursorAndAsyncIterator
} from '@cognite/sdk';
import { type ClassicDataSourceType } from '@cognite/reveal';
import { type AddPointCloudResourceOptions } from '../../components';
import { createAssetMock } from '../../../tests/tests-utilities/fixtures/assets';
import { createPointCloudAnnotationMock } from '../../../tests/tests-utilities/fixtures/pointCloudAnnotation';
import { type FdmSDK } from '../../data-providers/FdmSDK';
import { createCursorAndAsyncIteratorMock } from '../../../tests/tests-utilities/fixtures/cursorAndIterator';

import { getAssetsForIds } from './common/getAssetsForIds';

// Mock the dependencies
vi.mock(import('./common/getAssetsForIds'), () => ({
  getAssetsForIds: vi.fn<typeof getAssetsForIds>()
}));

const mockGetAssetsForIds = vi.mocked(getAssetsForIds);

describe(getAssetsMappedPointCloudAnnotations.name, () => {
  let mockSdk: CogniteClient;
  let mockFdmSdk: FdmSDK;

  const mockModelId1 = 123;
  const mockModelId2 = 789;
  const mockModelId3 = 456;
  const mockRevisionId1 = 456;
  const mockRevisionId2 = 101;

  const annotationsMock = vi.fn<CogniteClient['annotations']['list']>(
    (): CursorAndAsyncIterator<AnnotationModel> => createCursorAndAsyncIteratorMock({ items: [] })
  );

  const mockModels = [
    { modelId: mockModelId1, revisionId: mockRevisionId1 },
    { modelId: mockModelId2, revisionId: mockRevisionId2 }
  ] as Array<AddPointCloudResourceOptions<ClassicDataSourceType>>;

  const mockAssets = [createAssetMock(1, 'Asset 1'), createAssetMock(2, 'Asset 2')];

  const mockDmsInstances = [
    {
      instanceType: 'node' as const,
      version: 1,
      space: 'test-space',
      externalId: 'test-external-id',
      createdTime: 123456,
      lastUpdatedTime: 987654,
      properties: {
        name: 'DMS Asset 1',
        description: 'Test DMS asset'
      }
    }
  ];

  const mockDmsResult = {
    items: [
      {
        ...mockDmsInstances[0],
        properties: {
          cdf_cdm: {
            'CogniteAsset/v1': mockDmsInstances[0].properties
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

  beforeEach(() => {
    vi.clearAllMocks();

    const annotationRetrieveMock = new Mock<CogniteClient['annotations']>()
      .setup((p) => p.list)
      .returns(annotationsMock)
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
      .setup((p) => p.getByExternalIds)
      .returns(vi.fn())
      .object();

    mockGetAssetsForIds.mockResolvedValue(mockAssets);
  });

  describe('basic functionality', () => {
    test('returns assets from point cloud annotations without filters', async () => {
      const result = await getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk);

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
          space: mockDmsInstances[0].space,
          externalId: mockDmsInstances[0].externalId
        }
      });

      const mixedAnnotations = [annotationWithAssetRef, annotationWithDmsRef];

      annotationsMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({ items: mixedAnnotations })
      );

      vi.mocked(mockFdmSdk.getByExternalIds).mockResolvedValue(mockDmsResult);

      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        mockFdmSdk
      );

      const expectedDmsInstanceResult = {
        ...mockDmsResult.items[0],
        properties: mockDmsInstances[0].properties
      };

      expect(result).toEqual([...mockAssets, expectedDmsInstanceResult]);
    });

    test('returns only classic assets when FDM SDK not provided', async () => {
      const result = await getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk);

      expect(result).toEqual(mockAssets);
      expect(result).toHaveLength(mockAssets.length);
    });

    test('handles empty models array', async () => {
      mockGetAssetsForIds.mockResolvedValue([]);

      const result = await getAssetsMappedPointCloudAnnotations([], undefined, mockSdk);

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
      const largeModelList = Array.from({ length: 1500 }, (_, i) => ({
        modelId: i,
        revisionId: i + 1000
      })) as Array<AddPointCloudResourceOptions<ClassicDataSourceType>>;

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

      await getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk);
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

      vi.mocked(mockFdmSdk.getByExternalIds).mockResolvedValue(mockDmsResult);

      mockGetAssetsForIds.mockResolvedValue([]);

      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        mockFdmSdk
      );

      expect(mockFdmSdk.getByExternalIds).toHaveBeenCalled();

      const expectedDmsInstanceResult = {
        ...mockDmsResult.items[0],
        properties: mockDmsInstances[0].properties
      };
      expect(result).toEqual([expectedDmsInstanceResult]);
    });

    test('handles empty DMS instances gracefully', async () => {
      const mockDmsResult = { items: [] };
      vi.mocked(mockFdmSdk.getByExternalIds).mockResolvedValue(mockDmsResult);

      const result = await getAssetsMappedPointCloudAnnotations(
        mockModels,
        undefined,
        mockSdk,
        mockFdmSdk
      );

      expect(result).toEqual(mockAssets);
    });
  });

  describe('error handling', () => {
    test('propagates errors from annotations API', async () => {
      const mockErrorIterator = createCursorAndAsyncIteratorMock({ items: [] });
      mockErrorIterator.autoPagingToArray = vi
        .fn()
        .mockRejectedValue(new Error('Annotations API error'));
      vi.mocked(mockSdk.annotations.list).mockReturnValue(mockErrorIterator);

      await expect(
        getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk)
      ).rejects.toThrow('Annotations API error');
    });

    test('propagates errors from assets API', async () => {
      mockGetAssetsForIds.mockRejectedValue(new Error('Assets API error'));

      await expect(
        getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk)
      ).rejects.toThrow('Assets API error');
    });

    test('propagates errors from FDM SDK', async () => {
      const annotationWithDmsRef = createPointCloudAnnotationMock({
        modelId: mockModelId3,
        dmIdentifier: { space: 'test-space', externalId: 'test-external-id' }
      });

      const mockAnnotationsList = createCursorAndAsyncIteratorMock({
        items: [annotationWithDmsRef]
      });
      vi.mocked(mockSdk.annotations.list).mockReturnValue(mockAnnotationsList);

      vi.mocked(mockFdmSdk.getByExternalIds).mockRejectedValue(new Error('FDM SDK error'));

      await expect(
        getAssetsMappedPointCloudAnnotations(mockModels, undefined, mockSdk, mockFdmSdk)
      ).rejects.toThrow('FDM SDK error');
    });
  });
});
