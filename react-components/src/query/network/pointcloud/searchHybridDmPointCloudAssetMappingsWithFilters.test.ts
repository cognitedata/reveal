import { beforeEach, describe, expect, test, vi } from 'vitest';
import { searchHybridDmPointCloudAssetMappingsWithFilters } from './searchHybridDmPointCloudAssetMappingsWithFilters';
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

describe(searchHybridDmPointCloudAssetMappingsWithFilters.name, () => {
  const baseUrl = 'dummy.cognite.com';
  const project = 'dummy';
  const instancesSearchEndpointPath = `${baseUrl}/api/v1/projects/${project}/models/instances/search`;

  const dmsIdentifiers: DmsUniqueIdentifier[] = [
    { externalId: 'externalId0', space: 'space0' },
    { externalId: 'externalId1', space: 'space1' },
    { externalId: 'externalId2', space: 'space2' }
  ];

  const models = [
    { modelId: 123, revisionId: 234 },
    { modelId: 456, revisionId: 789 }
  ];

  function isSearchData(
    data: unknown
  ): data is { query: string; filter?: TableExpressionFilterDefinition; limit?: number } {
    return typeof data === 'object' && data !== null && 'query' in data;
  }

  const defaultPostImplementation = async (
    path: string,
    options?: {
      data?:
        | { items: DmsUniqueIdentifier[] }
        | { query: string; filter?: TableExpressionFilterDefinition; limit?: number };
    }
  ): Promise<HttpResponse<ListResponse<NodeItem[]>>> => {
    if (path === instancesSearchEndpointPath && isSearchData(options?.data)) {
      return {
        data: {
          items: [dmsIdentifiers[0], dmsIdentifiers[2]].map((id) => createDmsNodeItem({ id }))
        },
        status: 200,
        headers: {}
      };
    }
    throw Error('Unexpected path or data');
  };

  const mockSdkPost = vi.fn<CogniteClient['post']>(
    defaultPostImplementation as CogniteClient['post']
  );

  const mockGetAnnotations = vi.fn<
    PointCloudAnnotationCache['getPointCloudAnnotationsForInstanceIds']
  >(
    async (_modelId, _revisionId, instanceIds) =>
      await Promise.resolve(
        new Map(instanceIds.filter(isDmsInstance).map((id) => [createFdmKey(id), [123, 456]]))
      )
  );

  const sdkMock = new Mock<CogniteClient>()
    .setup((p) => p.getBaseUrl())
    .returns(baseUrl)
    .setup((p) => p.project)
    .returns(project)
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
    .returns(mockGetAnnotations)
    .object();

  beforeEach(() => {
    mockSdkPost.mockClear();
    mockGetAnnotations.mockClear();
    mockSdkPost.mockImplementation(defaultPostImplementation as CogniteClient['post']);
    mockGetAnnotations.mockImplementation(
      async (_modelId, _revisionId, instanceIds) =>
        await Promise.resolve(
          new Map(instanceIds.filter(isDmsInstance).map((id) => [createFdmKey(id), [123, 456]]))
        )
    );
  });

  test('returns empty array when no models are provided', async () => {
    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      [],
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toEqual([]);
    expect(mockSdkPost).not.toHaveBeenCalled();
  });

  test('returns empty array when search returns no instances', async () => {
    mockSdkPost.mockResolvedValue({
      data: { items: [] },
      status: 200,
      headers: {}
    });

    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toEqual([]);
  });

  test('returns empty array when cache has no annotations for instances', async () => {
    mockGetAnnotations.mockResolvedValue(new Map());

    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toEqual([]);
  });

  test('returns instances that have annotations', async () => {
    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[0] }));
    expect(result).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[2] }));
  });

  test('returns only instances with annotations when partial match', async () => {
    mockGetAnnotations.mockImplementation(
      async (_modelId, _revisionId, instanceIds) =>
        await Promise.resolve(
          new Map(
            instanceIds
              .filter(isDmsInstance)
              .filter((id) => id.externalId === 'externalId2')
              .map((id) => [createFdmKey(id), [789]])
          )
        )
    );

    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toHaveLength(1);
    expect(result).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[2] }));
  });

  test('calls FDM SDK with query parameter', async () => {
    mockGetAnnotations.mockResolvedValue(new Map());
    const options = { query: 'test-query' };

    await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      options,
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(mockSdkPost).toHaveBeenCalledWith(instancesSearchEndpointPath, {
      data: {
        view: restrictToViewReference(viewDefinitionMock),
        query: options.query,
        instanceType: 'node',
        filter: undefined,
        properties: undefined,
        limit: 1000
      }
    });
  });

  test('calls FDM SDK with filter parameter', async () => {
    mockGetAnnotations.mockResolvedValue(new Map());
    const options = {
      filter: {
        in: { property: ['node', 'externalId'], values: ['id1', 'id2'] }
      }
    };

    await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      options,
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(mockSdkPost).toHaveBeenCalledWith(instancesSearchEndpointPath, {
      data: {
        view: restrictToViewReference(viewDefinitionMock),
        query: '',
        instanceType: 'node',
        filter: options.filter,
        properties: undefined,
        limit: 1000
      }
    });
  });

  test('calls FDM SDK with limit parameter', async () => {
    mockGetAnnotations.mockResolvedValue(new Map());
    const options = { limit: 100 };

    await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      options,
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(mockSdkPost).toHaveBeenCalledWith(instancesSearchEndpointPath, {
      data: {
        view: restrictToViewReference(viewDefinitionMock),
        query: '',
        instanceType: 'node',
        filter: undefined,
        properties: undefined,
        limit: options.limit
      }
    });
  });

  test('calls FDM SDK with all parameters combined', async () => {
    mockGetAnnotations.mockResolvedValue(new Map());
    const options = {
      query: 'test-query',
      filter: {
        in: { property: ['node', 'externalId'], values: ['id1', 'id2'] }
      },
      limit: 100
    };

    await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
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
        properties: undefined,
        limit: options.limit
      }
    });
  });

  test('calls cache for each model', async () => {
    await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(mockGetAnnotations).toHaveBeenCalledTimes(2);
    expect(mockGetAnnotations).toHaveBeenCalledWith(123, 234, expect.anything());
    expect(mockGetAnnotations).toHaveBeenCalledWith(456, 789, expect.anything());
  });

  test('returns unique instances when multiple models have same annotations', async () => {
    mockGetAnnotations.mockImplementation(
      async (_modelId, _revisionId, instanceIds) =>
        await Promise.resolve(
          new Map(
            instanceIds
              .filter(isDmsInstance)
              .filter((id) => id.externalId === 'externalId0')
              .map((id) => [createFdmKey(id), [123]])
          )
        )
    );

    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toHaveLength(1);
    expect(result).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[0] }));
  });

  test('returns instances from different models with different annotations', async () => {
    let callCount = 0;
    mockGetAnnotations.mockImplementation(async (_modelId, _revisionId, instanceIds) => {
      callCount++;
      const targetId = callCount === 1 ? 'externalId0' : 'externalId2';
      return await Promise.resolve(
        new Map(
          instanceIds
            .filter(isDmsInstance)
            .filter((id) => id.externalId === targetId)
            .map((id) => [createFdmKey(id), [123]])
        )
      );
    });

    const result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[0] }));
    expect(result).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[2] }));
  });
});
