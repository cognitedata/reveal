import { describe, expect, test, vi } from 'vitest';
import { searchHybridPointCloudDmAssetsForModels } from './searchHybridPointCloudDmAssetsForModels';
import { viewDefinitionMock } from '#test-utils/fixtures/dm/viewDefinitions';
import { Mock } from 'moq.ts';
import {
  type CogniteClient,
  type HttpResponse,
  type ListResponse,
  type TableExpressionFilterDefinition
} from '@cognite/sdk';
import { type DmsUniqueIdentifier, type NodeItem } from '../../../data-providers';
import { createDmsNodeItem } from '#test-utils/dms/createDmsNodeItem';
import { restrictToViewReference } from '../../../utilities/restrictToViewReference';
import { type PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { createFdmKey } from '../../../components';
import { isDmsInstance } from '../../../utilities/instanceIds';

describe(searchHybridPointCloudDmAssetsForModels.name, () => {
  const COGNITE_ASSET_DMS_VIEW = { rawView: viewDefinitionMock } as const;
  const BASE_URL = 'dummy.cognite.com';
  const PROJECT = 'dummy';

  const instancesByExternalIdEndpointPath = `${BASE_URL}/api/v1/projects/${PROJECT}/models/instances/byids`;
  const instancesSearchEndpointPath = `${BASE_URL}/api/v1/projects/${PROJECT}/models/instances/search`;

  const dmsIndentifiers: DmsUniqueIdentifier[] = [
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

  describe('PointCloud', () => {
    const model = { modelId: 123, revisionId: 234 };
    const typedModel = { type: 'pointcloud', addOptions: model } as const;

    const mockSdkPost = vi.fn<CogniteClient['post']>(
      defaultPostImplementation as CogniteClient['post']
    );
    const mockPointCloudCacheGetAnnotationsForInstanceIds = vi.fn<
      PointCloudAnnotationCache['getPointCloudAnnotationsForInstanceIds']
    >(
      async (_modelId, _revisionId, instanceIds) =>
        await Promise.resolve(
          new Map(
            instanceIds.filter(isDmsInstance).map((id) => [
              createFdmKey(id),
              [1] // annotation IDs
            ])
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
      .object();

    const pointCloudAnnotationCacheMock = new Mock<PointCloudAnnotationCache>()
      .setup((p) => p.getPointCloudAnnotationsForInstanceIds)
      .returns(mockPointCloudCacheGetAnnotationsForInstanceIds)
      .object();

    describe('without filter', () => {
      test('returns empty result when no models are supplied', async () => {
        const result = await searchHybridPointCloudDmAssetsForModels(
          [],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns no result when model has no annotation mappings', async () => {
        mockPointCloudCacheGetAnnotationsForInstanceIds.mockResolvedValue(new Map());
        const result = await searchHybridPointCloudDmAssetsForModels(
          [typedModel],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns result with assets when models has annotation mappings', async () => {
        mockPointCloudCacheGetAnnotationsForInstanceIds.mockResolvedValue(
          new Map([
            [createFdmKey(dmsIndentifiers[0]), [123, 456]],
            [createFdmKey(dmsIndentifiers[2]), [789]]
          ])
        );
        const result = await searchHybridPointCloudDmAssetsForModels(
          [typedModel],
          COGNITE_ASSET_DMS_VIEW,
          {},
          sdkMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toHaveLength(2);
        expect(result).toContainEqual(createDmsNodeItem({ id: dmsIndentifiers[0] }));
        expect(result).toContainEqual(createDmsNodeItem({ id: dmsIndentifiers[2] }));
      });
    });

    describe('with filter', () => {
      test('returns empty when no models are supplied', async () => {
        const result = await searchHybridPointCloudDmAssetsForModels(
          [],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([]);
      });

      test('returns empty when search through FDM-SDK returns no result', async () => {
        mockSdkPost.mockResolvedValue({ data: { items: [] }, status: 200, headers: {} });
        mockPointCloudCacheGetAnnotationsForInstanceIds.mockResolvedValue(new Map());
        const result = await searchHybridPointCloudDmAssetsForModels(
          [typedModel],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
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
          limit: 1000
        };

        await searchHybridPointCloudDmAssetsForModels(
          [typedModel],
          COGNITE_ASSET_DMS_VIEW,
          options,
          sdkMock,
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

      test('returns search result values filtered by annotations from cache', async () => {
        mockPointCloudCacheGetAnnotationsForInstanceIds.mockResolvedValue(
          new Map([[createFdmKey(dmsIndentifiers[2]), [123, 456]]])
        );
        const result = await searchHybridPointCloudDmAssetsForModels(
          [typedModel],
          COGNITE_ASSET_DMS_VIEW,
          { query: 'some-query' },
          sdkMock,
          pointCloudAnnotationCacheMock
        );

        expect(result).toEqual([createDmsNodeItem({ id: dmsIndentifiers[2] })]);
      });
    });
  });

  function isItemsData(data: unknown): data is { items: DmsUniqueIdentifier[] } {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    if (!('items' in data)) {
      return false;
    }
    return Array.isArray(data.items);
  }

  const defaultPostImplementation = async (
    path: string,
    data?: {
      data?:
        | { items: DmsUniqueIdentifier[] }
        | { query: string; filter: TableExpressionFilterDefinition };
    }
  ): Promise<HttpResponse<ListResponse<NodeItem[]>>> => {
    if (path === instancesByExternalIdEndpointPath) {
      const requestData = data?.data;
      if (isItemsData(requestData)) {
        return {
          data: {
            items: requestData.items.map((item) => createDmsNodeItem({ id: item }))
          },
          status: 200,
          headers: {}
        };
      }
    }

    if (path === instancesSearchEndpointPath) {
      return {
        data: {
          items: [dmsIndentifiers[0], dmsIndentifiers[2]].map((id) => createDmsNodeItem({ id }))
        },
        status: 200,
        headers: {}
      };
    }

    throw Error();
  };
});
