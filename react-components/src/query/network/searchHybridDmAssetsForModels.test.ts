import { describe, expect, test, vi } from 'vitest';
import { searchHybridDmAssetsForModels } from './searchHybridDmAssetsForModels';
import { viewDefinitionMock } from '#test-utils/fixtures/dm/viewDefinitions';
import { Mock } from 'moq.ts';
import {
  type CursorAndAsyncIterator,
  type AssetMapping3D,
  type CogniteClient,
  type HttpResponse,
  type ListResponse,
  type TableExpressionFilterDefinition
} from '@cognite/sdk';
import { type DmsUniqueIdentifier, type NodeItem } from '../../data-providers';
import { createDmsNodeItem } from '#test-utils/dms/createDmsNodeItem';
import { restrictToViewReference } from '../../utilities/restrictToViewReference';
import { type ClassicCadAssetMappingCache } from '../../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';
import { createRawDmHybridAssetMappingMock } from '#test-utils/fixtures/cadAssetMapping';
import { isDmsInstance } from '../../utilities/instanceIds';
import { createFdmKey } from '../../components';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { type PointCloudAnnotationCache } from '../../components/CacheProvider/PointCloudAnnotationCache';

const COGNITE_ASSET_DMS_VIEW = { rawView: viewDefinitionMock } as const;
const BASE_URL = 'dummy.cognite.com';
const PROJECT = 'dummy';

const instancesByExternalIdEndpointPath = `${BASE_URL}/api/v1/projects/${PROJECT}/models/instances/byids`;
const instancesSearchEndpointPath = `${BASE_URL}/api/v1/projects/${PROJECT}/models/instances/search`;

const DMS_IDS = [
  {
    externalId: 'externalId0',
    space: 'space0'
  },
  {
    externalId: 'externalId1',
    space: 'space1'
  },
  { externalId: 'externalId2', space: 'space2' }
];

describe(searchHybridDmAssetsForModels.name, () => {
  describe('CAD', () => {
    const MODEL = { modelId: 123, revisionId: 234 };
    const TAGGED_MODEL = { type: 'cad', addOptions: MODEL } as const;

    const HYBRID_ASSET_MAPPINGS = DMS_IDS.map((id) =>
      createRawDmHybridAssetMappingMock({ assetInstanceId: id })
    );

    const mockSdkPost = vi.fn<CogniteClient['post']>(
      defaultPostImplementation as CogniteClient['post']
    );
    const mockAssetMappingsList = vi.fn<CogniteClient['assetMappings3D']['list']>(
      (): CursorAndAsyncIterator<AssetMapping3D> =>
        createCursorAndAsyncIteratorMock({
          items: HYBRID_ASSET_MAPPINGS as AssetMapping3D[]
        })
    );
    const mockCadCacheGetNodesForInstanceIds = vi.fn<
      ClassicCadAssetMappingCache['getNodesForInstanceIds']
    >(
      async (_modelId, _revisionId, instanceIds) =>
        await Promise.resolve(
          new Map(
            instanceIds.filter(isDmsInstance).map((id) => [createFdmKey(id), [createCadNodeMock()]])
          )
        )
    );

    const sdkMock = new Mock<CogniteClient>()
      .setup((p) => p.getBaseUrl())
      .returns(BASE_URL)
      .setup((p) => p.project)
      .returns(PROJECT)
      .setup((p) => p.post)
      .returns(
        mockSdkPost as <T = unknown>(
          path: string,
          options?: { data?: unknown }
        ) => Promise<HttpResponse<T>>
      )
      .setup((p) => p.assetMappings3D.list)
      .returns(mockAssetMappingsList)
      .object();

    const classicCadCacheMock = new Mock<ClassicCadAssetMappingCache>()
      .setup((p) => p.getNodesForInstanceIds)
      .returns(mockCadCacheGetNodesForInstanceIds)
      .object();

    const pointCloudAnnotationCacheMock = new Mock<PointCloudAnnotationCache>().object();

    describe('without filter', () => {
      test("returns empty result when no models are supplied, calling the fdmSdk's by-ID method with empty list", async () => {
        const result = await searchHybridDmAssetsForModels(
          [],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(mockSdkPost).toHaveBeenCalledWith(instancesByExternalIdEndpointPath, {
          data: {
            items: [],
            sources: [
              {
                source: restrictToViewReference(viewDefinitionMock)
              }
            ],
            includeTyping: true
          }
        });
        expect(result).toEqual([]);
      });

      test('returns no result when model has no asset mappings', async () => {
        mockAssetMappingsList.mockReturnValue(createCursorAndAsyncIteratorMock({ items: [] }));
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns result with assets when models has asset mappings', async () => {
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        const expectedResultInstances = DMS_IDS.map((item) => createDmsNodeItem({ id: item }));
        expect(result).toEqual(expectedResultInstances);
      });
    });

    describe('with filter', () => {
      test('returns empty when no models are supplied', async () => {
        const result = await searchHybridDmAssetsForModels(
          [],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns empty when search through FDM-SDK returns no result', async () => {
        mockSdkPost.mockResolvedValue({ data: { items: [] }, status: 200, headers: {} });
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('calls FDM SDK search method with filters', async () => {
        const options = {
          filter: {
            in: { property: ['node', 'id'], values: ['id0', 'id1'] }
          },
          query: 'some-query',
          limit: 123
        };

        await searchHybridDmAssetsForModels(
          [TAGGED_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          options,
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(mockSdkPost).toHaveBeenCalledWith(instancesSearchEndpointPath, {
          data: {
            view: restrictToViewReference(viewDefinitionMock),
            query: options.query,
            instanceType: 'node',
            filter: options.filter,
            limit: options.limit
          }
        });
      });

      test('returns search result values filtered by mappings from cache', async () => {
        mockCadCacheGetNodesForInstanceIds.mockResolvedValue(
          new Map([[createFdmKey(DMS_IDS[2]), [createCadNodeMock()]]])
        );
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([createDmsNodeItem({ id: DMS_IDS[2] })]);
      });
    });
  });

  describe('PointCloud', () => {
    const PC_MODEL = { modelId: 456, revisionId: 789 };
    const TAGGED_PC_MODEL = { type: 'pointcloud', addOptions: PC_MODEL } as const;

    const mockSdkPost = vi.fn<CogniteClient['post']>(
      defaultPostImplementation as CogniteClient['post']
    );

    const mockPCCacheGetAnnotationsForInstanceIds =
      vi.fn<PointCloudAnnotationCache['getPointCloudAnnotationsForInstanceIds']>();

    const sdkMock = new Mock<CogniteClient>()
      .setup((p) => p.getBaseUrl())
      .returns(BASE_URL)
      .setup((p) => p.project)
      .returns(PROJECT)
      .setup((p) => p.post)
      .returns(
        mockSdkPost as <T = unknown>(
          path: string,
          options?: { data?: unknown }
        ) => Promise<HttpResponse<T>>
      )
      .object();

    const classicCadCacheMock = new Mock<ClassicCadAssetMappingCache>().object();

    const pointCloudAnnotationCacheMock = new Mock<PointCloudAnnotationCache>()
      .setup((p) => p.getPointCloudAnnotationsForInstanceIds)
      .returns(mockPCCacheGetAnnotationsForInstanceIds)
      .object();

    describe('without filter', () => {
      test('returns empty result when no models are supplied', async () => {
        const result = await searchHybridDmAssetsForModels(
          [],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(mockSdkPost).toHaveBeenCalledWith(instancesByExternalIdEndpointPath, {
          data: {
            items: [],
            sources: [
              {
                source: restrictToViewReference(viewDefinitionMock)
              }
            ],
            includeTyping: true
          }
        });
        expect(result).toEqual([]);
      });

      test('returns no result when model has no annotation mappings', async () => {
        mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(new Map());
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_PC_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns result with assets when models has annotation mappings', async () => {
        // Mock returns only items 0 and 2 (matching defaultPostImplementation behavior for search)
        mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(
          new Map([
            [createFdmKey(DMS_IDS[0]), [123, 456]],
            [createFdmKey(DMS_IDS[2]), [789]]
          ])
        );
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_PC_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        // Should return items 0 and 2 that have annotations
        expect(result).toHaveLength(2);
        expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
        expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[2] }));
      });
    });

    describe('with filter', () => {
      test('returns empty when search through FDM-SDK returns no result', async () => {
        mockSdkPost.mockResolvedValue({ data: { items: [] }, status: 200, headers: {} });
        mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(new Map());
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_PC_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns search result values filtered by annotations from cache', async () => {
        mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(
          new Map([[createFdmKey(DMS_IDS[2]), [123, 456]]])
        );
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_PC_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          classicCadCacheMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([createDmsNodeItem({ id: DMS_IDS[2] })]);
      });
    });
  });

  describe('Combined CAD and PointCloud', () => {
    const CAD_MODEL = { modelId: 123, revisionId: 234 };
    const TAGGED_CAD_MODEL = { type: 'cad', addOptions: CAD_MODEL } as const;
    const PC_MODEL = { modelId: 456, revisionId: 789 };
    const TAGGED_PC_MODEL = { type: 'pointcloud', addOptions: PC_MODEL } as const;

    // CAD model only has mapping for DMS_IDS[0]
    const CAD_HYBRID_ASSET_MAPPINGS = [
      createRawDmHybridAssetMappingMock({ assetInstanceId: DMS_IDS[0] })
    ];

    const mockSdkPost = vi.fn<CogniteClient['post']>(
      defaultPostImplementation as CogniteClient['post']
    );
    const mockAssetMappingsList = vi.fn<CogniteClient['assetMappings3D']['list']>(
      (): CursorAndAsyncIterator<AssetMapping3D> =>
        createCursorAndAsyncIteratorMock({
          items: CAD_HYBRID_ASSET_MAPPINGS as AssetMapping3D[]
        })
    );
    const mockCadCacheGetNodesForInstanceIds = vi.fn<
      ClassicCadAssetMappingCache['getNodesForInstanceIds']
    >(
      async (_modelId, _revisionId) =>
        await Promise.resolve(new Map([[createFdmKey(DMS_IDS[0]), [createCadNodeMock()]]]))
    );

    const mockPCCacheGetAnnotationsForInstanceIds = vi.fn<
      PointCloudAnnotationCache['getPointCloudAnnotationsForInstanceIds']
    >(
      async (_modelId, _revisionId) =>
        // Return DMS_IDS[2] which is in the search results (without filter, search returns [0,2])
        // and doesn't overlap with CAD (which returns DMS_IDS[0])
        await Promise.resolve(new Map([[createFdmKey(DMS_IDS[2]), [123, 456]]]))
    );

    const sdkMock = new Mock<CogniteClient>()
      .setup((p) => p.getBaseUrl())
      .returns(BASE_URL)
      .setup((p) => p.project)
      .returns(PROJECT)
      .setup((p) => p.post)
      .returns(
        mockSdkPost as <T = unknown>(
          path: string,
          options?: { data?: unknown }
        ) => Promise<HttpResponse<T>>
      )
      .setup((p) => p.assetMappings3D.list)
      .returns(mockAssetMappingsList)
      .object();

    const classicCadCacheMock = new Mock<ClassicCadAssetMappingCache>()
      .setup((p) => p.getNodesForInstanceIds)
      .returns(mockCadCacheGetNodesForInstanceIds)
      .object();

    const pointCloudAnnotationCacheMock = new Mock<PointCloudAnnotationCache>()
      .setup((p) => p.getPointCloudAnnotationsForInstanceIds)
      .returns(mockPCCacheGetAnnotationsForInstanceIds)
      .object();

    test('returns combined results from both CAD and PointCloud models', async () => {
      const result = await searchHybridDmAssetsForModels(
        [TAGGED_CAD_MODEL, TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        {},
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );

      // Without filter, PC still calls search (not byids) with empty query, which returns [0,2]
      // CAD returns DMS_IDS[0] (from asset mappings), PC returns DMS_IDS[2] (from annotations)
      // Result should contain both
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[2] }));
    });

    test('returns combined filtered results from both CAD and PointCloud models', async () => {
      const result = await searchHybridDmAssetsForModels(
        [TAGGED_CAD_MODEL, TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        { query: 'some-query' },
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );

      // With filter, search endpoint returns DMS_IDS[0] and DMS_IDS[2]
      // CAD cache has DMS_IDS[0], PC cache has DMS_IDS[2]
      // Result should contain both
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[2] }));
    });

    test('returns only CAD results when PointCloud has no matching annotations', async () => {
      // Update PC cache to return DMS_IDS[1] which is NOT in search results [0,2]
      mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(
        new Map([[createFdmKey(DMS_IDS[1]), [123, 456]]])
      );

      const result = await searchHybridDmAssetsForModels(
        [TAGGED_CAD_MODEL, TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        { query: 'some-query' },
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );

      // With filter, search endpoint returns DMS_IDS[0] and DMS_IDS[2]
      // CAD cache has DMS_IDS[0], PC cache has DMS_IDS[1] (not in search results)
      // Result should only contain DMS_IDS[0] from CAD
      expect(result).toHaveLength(1);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
    });
  });
});

const defaultPostImplementation = async (
  path: string,
  data?: {
    data?:
      | { items: DmsUniqueIdentifier[] }
      | { query: string; filter: TableExpressionFilterDefinition };
  }
): Promise<HttpResponse<ListResponse<NodeItem[]>>> => {
  if (path === instancesByExternalIdEndpointPath) {
    return {
      data: {
        items: (data?.data as { items: DmsUniqueIdentifier[] }).items.map(
          (item: DmsUniqueIdentifier) => createDmsNodeItem({ id: item })
        )
      },
      status: 200,
      headers: {}
    };
  }

  if (path === instancesSearchEndpointPath) {
    return {
      data: {
        items: [DMS_IDS[0], DMS_IDS[2]].map((id) => createDmsNodeItem({ id }))
      },
      status: 200,
      headers: {}
    };
  }

  throw Error();
};
