import { describe, vi, it, expect } from 'vitest';
import { getCadModelsForHybridDmInstance } from './getCadModelsForHybridDmInstance';
import { type HttpResponse, type CogniteClient } from '@cognite/sdk';
import { Mock } from 'moq.ts';

describe(getCadModelsForHybridDmInstance.name, () => {
  const dmsInstance = { externalId: 'ext-id', space: 'space-id' };
  const project = 'test-project';

  const mockUrl = `api/v1/projects/${project}/3d/mappings/modelnodes/filter`;

  type MockResponseType = {
    items: Array<{ modelId: number; revisionId: number; nodeId: number }>;
  };

  const sdkMockBase = new Mock<CogniteClient>()
    .setup((p) => p.getBaseUrl())
    .returns('https://api.cognitedata.com')
    .setup((p) => p.project)
    .returns(project);

  it('should return mapped cad model options from sdk response', async () => {
    const mockResponse = vi.fn<() => Promise<HttpResponse<MockResponseType>>>().mockResolvedValue({
      data: {
        items: [
          { modelId: 1, revisionId: 10, nodeId: 100 },
          { modelId: 2, revisionId: 20, nodeId: 200 }
        ]
      },
      status: 200,
      headers: {}
    }) as <T = unknown>() => Promise<HttpResponse<T>>;

    const sdkMock = sdkMockBase
      .setup((p) => p.post)
      .returns(mockResponse)
      .object();

    const result = await getCadModelsForHybridDmInstance(dmsInstance, sdkMock);

    expect(sdkMock.post).toHaveBeenCalledWith(mockUrl, {
      data: { limit: 1000, filter: { assetInstanceId: dmsInstance } }
    });
    expect(result).toEqual([
      { type: 'cad', addOptions: { modelId: 1, revisionId: 10 } },
      { type: 'cad', addOptions: { modelId: 2, revisionId: 20 } }
    ]);
  });

  it('should return an empty array if sdk returns no items', async () => {
    const mockResponse = vi.fn<() => Promise<HttpResponse<MockResponseType>>>().mockResolvedValue({
      data: {
        items: []
      },
      status: 200,
      headers: {}
    }) as <T = unknown>() => Promise<HttpResponse<T>>;

    const sdkMock = sdkMockBase
      .setup((p) => p.post)
      .returns(mockResponse)
      .object();
    const result = await getCadModelsForHybridDmInstance(dmsInstance, sdkMock);

    expect(result).toEqual([]);
  });

  it('should throw an error if the response status is not 200', async () => {
    const mockResponse = vi.fn<() => Promise<HttpResponse<MockResponseType>>>().mockResolvedValue({
      data: {
        items: []
      },
      status: 500,
      headers: {}
    }) as <T = unknown>() => Promise<HttpResponse<T>>;

    const sdkMock = sdkMockBase
      .setup((p) => p.post)
      .returns(mockResponse)
      .object();

    await expect(getCadModelsForHybridDmInstance(dmsInstance, sdkMock)).rejects.toThrow(
      `Failed to fetch CAD models for DMS instance ${dmsInstance.externalId}. Status: 500`
    );
  });
});
