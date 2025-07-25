import { describe, vi, it, expect } from 'vitest';
import { getCadModelsForHybrid } from './getCadModelsForHybrid';
import { type CogniteClient, type HttpResponse } from '@cognite/sdk';
import { Mock } from 'moq.ts';

describe(getCadModelsForHybrid.name, () => {
  const dmsInstance = { externalId: 'ext-id', space: 'space-id' };
  const project = 'test-project';

  const mockUrl = `api/v1/projects/${project}/3d/mappings/modelnodes/filter`;
  type MockResponseType = { items: Array<{ modelId: number; revisionId: number; nodeId: number }> };

  const mockResponse = vi.fn().mockImplementation(async () => {
    return {
      data: {
        items: []
      },
      status: 200,
      headers: {}
    } as const as HttpResponse<MockResponseType>;
  });

  const sdkMock = new Mock<CogniteClient>()
    .setup((p) => p.getBaseUrl())
    .returns('https://api.cognitedata.com')
    .setup((p) => p.project)
    .returns(project)
    .setup((p) => p.post)
    .returns(mockResponse)
    .object();

  it('should return mapped cad model options from sdk response', async () => {
    mockResponse.mockImplementation(async () => {
      return {
        data: {
          items: [
            { modelId: 1, revisionId: 10, nodeId: 100 },
            { modelId: 2, revisionId: 20, nodeId: 200 }
          ]
        },
        status: 200,
        headers: {}
      } as const as HttpResponse<MockResponseType>;
    });

    const result = await getCadModelsForHybrid(dmsInstance, sdkMock);

    expect(sdkMock.post).toHaveBeenCalledWith(mockUrl, {
      data: { limit: 1000, filter: { assetInstanceId: dmsInstance } }
    });
    expect(result).toEqual([
      { type: 'cad', addOptions: { modelId: 1, revisionId: 10 } },
      { type: 'cad', addOptions: { modelId: 2, revisionId: 20 } }
    ]);
  });

  it('should return an empty array if sdk returns no items', async () => {
    mockResponse.mockImplementation(async () => {
      return {
        data: {
          items: []
        },
        status: 200,
        headers: {}
      } as const as HttpResponse<MockResponseType>;
    });
    const result = await getCadModelsForHybrid(dmsInstance, sdkMock);

    expect(result).toEqual([]);
  });
});
