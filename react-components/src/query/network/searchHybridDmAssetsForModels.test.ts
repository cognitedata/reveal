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
  { externalId: 'externalId0', space: 'space0' },
  { externalId: 'externalId1', space: 'space1' },
  { externalId: 'externalId2', space: 'space2' }
];

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
        items: ((data?.data as { items: DmsUniqueIdentifier[] }).items ?? []).map((item) =>
          createDmsNodeItem({ id: item })
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

    test('returns empty when no models and calls byIds endpoint', async () => {
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
          sources: [{ source: restrictToViewReference(viewDefinitionMock) }],
          includeTyping: true
        }
      });
      expect(result).toEqual([]);
    });

    test('returns results based on asset mappings and filters correctly', async () => {
      mockAssetMappingsList.mockReturnValue(createCursorAndAsyncIteratorMock({ items: [] }));
      let result = await searchHybridDmAssetsForModels(
        [TAGGED_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        {},
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toEqual([]);

      mockAssetMappingsList.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          items: HYBRID_ASSET_MAPPINGS as AssetMapping3D[]
        })
      );
      result = await searchHybridDmAssetsForModels(
        [TAGGED_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        {},
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );

      expect(result).toEqual(DMS_IDS.map((item) => createDmsNodeItem({ id: item })));

      mockCadCacheGetNodesForInstanceIds.mockResolvedValue(
        new Map([[createFdmKey(DMS_IDS[2]), [createCadNodeMock()]]])
      );
      result = await searchHybridDmAssetsForModels(
        [TAGGED_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        { query: 'some-query' },
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );

      expect(result).toEqual([createDmsNodeItem({ id: DMS_IDS[2] })]);
    });

    test('handles empty search results and calls FDM SDK with filters', async () => {
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

      const options = {
        filter: { in: { property: ['node', 'id'], values: ['id0', 'id1'] } },
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

    test('returns annotations based on cache and filters correctly', async () => {
      mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(new Map());
      let result = await searchHybridDmAssetsForModels(
        [TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        {},
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toEqual([]);

      mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(
        new Map([
          [createFdmKey(DMS_IDS[0]), [123, 456]],
          [createFdmKey(DMS_IDS[2]), [789]]
        ])
      );
      result = await searchHybridDmAssetsForModels(
        [TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        {},
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[2] }));

      mockSdkPost.mockResolvedValue({ data: { items: [] }, status: 200, headers: {} });
      result = await searchHybridDmAssetsForModels(
        [TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        { query: 'some-query' },
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toEqual([]);
    });
  });

  describe('Combined CAD and PointCloud', () => {
    const CAD_MODEL = { modelId: 123, revisionId: 234 };
    const TAGGED_CAD_MODEL = { type: 'cad', addOptions: CAD_MODEL } as const;
    const PC_MODEL = { modelId: 456, revisionId: 789 };
    const TAGGED_PC_MODEL = { type: 'pointcloud', addOptions: PC_MODEL } as const;

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
      async () =>
        await Promise.resolve(new Map([[createFdmKey(DMS_IDS[0]), [createCadNodeMock()]]]))
    );

    const mockPCCacheGetAnnotationsForInstanceIds = vi.fn<
      PointCloudAnnotationCache['getPointCloudAnnotationsForInstanceIds']
    >(async () => await Promise.resolve(new Map([[createFdmKey(DMS_IDS[2]), [123, 456]]])));

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

    test('returns combined and filtered results from both CAD and PointCloud models', async () => {
      let result = await searchHybridDmAssetsForModels(
        [TAGGED_CAD_MODEL, TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        {},
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[2] }));

      result = await searchHybridDmAssetsForModels(
        [TAGGED_CAD_MODEL, TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        { query: 'some-query' },
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[2] }));

      mockPCCacheGetAnnotationsForInstanceIds.mockResolvedValue(
        new Map([[createFdmKey(DMS_IDS[1]), [123, 456]]])
      );
      result = await searchHybridDmAssetsForModels(
        [TAGGED_CAD_MODEL, TAGGED_PC_MODEL],
        COGNITE_ASSET_DMS_VIEW,
        { query: 'some-query' },
        sdkMock,
        classicCadCacheMock,
        pointCloudAnnotationCacheMock
      );
      expect(result).toHaveLength(1);
      expect(result).toContainEqual(createDmsNodeItem({ id: DMS_IDS[0] }));
    });
  });
});
