import { describe, expect, test, vi } from 'vitest';
import { searchHybridPointCloudDmAssetsForModels } from './searchHybridPointCloudDmAssetsForModels';
import { viewDefinitionMock } from '#test-utils/fixtures/dm/viewDefinitions';
import { Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { createDmsNodeItem } from '#test-utils/dms/createDmsNodeItem';
import { type PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';

describe(searchHybridPointCloudDmAssetsForModels.name, () => {
  const COGNITE_ASSET_DMS_VIEW = { rawView: viewDefinitionMock } as const;

  const dmsIdentifiers: DmsUniqueIdentifier[] = [
    { externalId: 'externalId0', space: 'space0' },
    { externalId: 'externalId1', space: 'space1' }
  ];

  const pointCloudModel = { modelId: 123, revisionId: 234 };
  const cadModel = { modelId: 456, revisionId: 789 };
  const taggedPointCloudModel = { type: 'pointcloud', addOptions: pointCloudModel } as const;
  const taggedCadModel = { type: 'cad', addOptions: cadModel } as const;

  const sdkMock = new Mock<CogniteClient>().object();
  const pointCloudAnnotationCacheMock = new Mock<PointCloudAnnotationCache>().object();

  test('filters pointcloud resources and delegates to searchHybridDmPointCloudAssetMappingsWithFilters', async () => {
    const mockDependency = vi.fn(
      async () => await Promise.resolve(dmsIdentifiers.map((id) => createDmsNodeItem({ id })))
    );

    const result = await searchHybridPointCloudDmAssetsForModels(
      [taggedPointCloudModel, taggedCadModel],
      COGNITE_ASSET_DMS_VIEW,
      { query: 'test-query', limit: 100 },
      sdkMock,
      pointCloudAnnotationCacheMock,
      { searchHybridDmPointCloudAssetMappingsWithFilters: mockDependency }
    );

    expect(mockDependency).toHaveBeenCalledTimes(1);
    expect(mockDependency).toHaveBeenCalledWith(
      [pointCloudModel],
      viewDefinitionMock,
      { query: 'test-query', limit: 100 },
      sdkMock,
      pointCloudAnnotationCacheMock
    );
    expect(result).toHaveLength(2);
  });

  test('returns empty array when no pointcloud resources are provided', async () => {
    const mockDependency = vi.fn(async () => await Promise.resolve([]));

    const result = await searchHybridPointCloudDmAssetsForModels(
      [taggedCadModel],
      COGNITE_ASSET_DMS_VIEW,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock,
      { searchHybridDmPointCloudAssetMappingsWithFilters: mockDependency }
    );

    expect(mockDependency).toHaveBeenCalledWith(
      [],
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );
    expect(result).toEqual([]);
  });

  test('extracts rawView from view object and passes it to dependency', async () => {
    const mockDependency = vi.fn(async () => await Promise.resolve([]));

    await searchHybridPointCloudDmAssetsForModels(
      [taggedPointCloudModel],
      COGNITE_ASSET_DMS_VIEW,
      { filter: { in: { property: ['node', 'id'], values: ['id1'] } } },
      sdkMock,
      pointCloudAnnotationCacheMock,
      { searchHybridDmPointCloudAssetMappingsWithFilters: mockDependency }
    );

    expect(mockDependency).toHaveBeenCalledWith(
      [pointCloudModel],
      viewDefinitionMock,
      expect.objectContaining({
        filter: { in: { property: ['node', 'id'], values: ['id1'] } }
      }),
      sdkMock,
      pointCloudAnnotationCacheMock
    );
  });
});
