import { describe, expect, test, vi } from 'vitest';
import { searchHybridDmAssetsForModels } from './searchHybridDmAssetsForModels';
import { viewDefinitionMock } from '#test-utils/fixtures/dm/viewDefinitions';
import { Mock } from 'moq.ts';
import {
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
    const mockAssetMappingsList = vi.fn<CogniteClient['assetMappings3D']['list']>(() =>
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

    describe('without filter', () => {
      test("returns empty result when no models are supplied, calling the fdmSdk's by-ID method with empty list", async () => {
        const result = await searchHybridDmAssetsForModels(
          [],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock
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
          classicCadCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns result with assets when models has asset mappings', async () => {
        const result = await searchHybridDmAssetsForModels(
          [TAGGED_MODEL],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          classicCadCacheMock
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
          classicCadCacheMock
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
          classicCadCacheMock
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
          classicCadCacheMock
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
          classicCadCacheMock
        );

        expect(result).toEqual([createDmsNodeItem({ id: DMS_IDS[2] })]);
      });
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
