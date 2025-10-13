import { beforeEach, describe, expect, test, vi } from 'vitest';
import { searchHybridDmPointCloudAssetMappingsWithFilters } from './searchHybridDmPointCloudAssetMappingsWithFilters';
import { viewDefinitionMock } from '#test-utils/fixtures/dm/viewDefinitions';
import { Mock } from 'moq.ts';
import { type CogniteClient, type HttpResponse, type ListResponse } from '@cognite/sdk';
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

  const defaultPostImplementation = async (): Promise<HttpResponse<ListResponse<NodeItem[]>>> => ({
    data: {
      items: [dmsIdentifiers[0], dmsIdentifiers[2]].map((id) => createDmsNodeItem({ id }))
    },
    status: 200,
    headers: {}
  });

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

  test('returns empty when search returns no instances or cache has no annotations', async () => {
    mockSdkPost.mockResolvedValue({ data: { items: [] }, status: 200, headers: {} });

    let result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );
    expect(result).toEqual([]);

    mockSdkPost.mockImplementation(defaultPostImplementation as CogniteClient['post']);
    mockGetAnnotations.mockResolvedValue(new Map());

    result = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );
    expect(result).toEqual([]);
  });

  test('returns instances that have annotations and filters correctly', async () => {
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

    const filteredResult = await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      {},
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(filteredResult).toHaveLength(1);
    expect(filteredResult).toContainEqual(createDmsNodeItem({ id: dmsIdentifiers[2] }));
  });

  test('calls FDM SDK with query, filter, and limit parameters', async () => {
    mockGetAnnotations.mockResolvedValue(new Map());

    await searchHybridDmPointCloudAssetMappingsWithFilters(
      models,
      viewDefinitionMock,
      { query: 'test-query' },
      sdkMock,
      pointCloudAnnotationCacheMock
    );

    expect(mockSdkPost).toHaveBeenCalledWith(
      instancesSearchEndpointPath,
      expect.objectContaining({
        data: expect.objectContaining({
          query: 'test-query',
          instanceType: 'node'
        })
      })
    );

    const options = {
      query: 'test',
      filter: { in: { property: ['node', 'externalId'], values: ['id1', 'id2'] } },
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

  test('handles multiple models and returns unique instances', async () => {
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
});
