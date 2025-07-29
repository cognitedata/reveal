import { describe, it, expect } from 'vitest';
import { getCadModelsForHybridDmInstance } from './getCadModelsForHybridDmInstance';
import { sdkMock, postMock } from '../../../tests/tests-utilities/fixtures/sdk';

describe(getCadModelsForHybridDmInstance.name, () => {
  const dmsInstance = { externalId: 'ext-id', space: 'space-id' };
  const project = 'test-project';
  const mockUrl = `api/v1/projects/${project}/3d/mappings/modelnodes/filter`;

  it('should return mapped cad model options from sdk response', async () => {
    postMock.mockImplementationOnce(async () => ({
      data: {
        items: [
          {
            modelId: 1,
            revisionId: 10,
            nodeId: 100,
            instanceType: 'node',
            version: 1,
            space: 'space-id',
            externalId: 'ext-id-1',
            createdTime: Date.now(),
            lastUpdatedTime: Date.now(),
            properties: {}
          },
          {
            modelId: 2,
            revisionId: 20,
            nodeId: 200,
            instanceType: 'node',
            version: 1,
            space: 'space-id',
            externalId: 'ext-id-2',
            createdTime: Date.now(),
            lastUpdatedTime: Date.now(),
            properties: {}
          }
        ]
      },
      status: 200,
      headers: {}
    }));

    const result = await getCadModelsForHybridDmInstance(dmsInstance, sdkMock);

    expect(postMock).toHaveBeenCalledWith(mockUrl, {
      data: { limit: 1000, filter: { assetInstanceId: dmsInstance } }
    });
    expect(result).toEqual([
      { type: 'cad', addOptions: { modelId: 1, revisionId: 10 } },
      { type: 'cad', addOptions: { modelId: 2, revisionId: 20 } }
    ]);
  });

  it('should return an empty array if sdk returns no items', async () => {
    postMock.mockImplementationOnce(async () => ({
      data: { items: [] },
      status: 200,
      headers: {}
    }));

    const result = await getCadModelsForHybridDmInstance(dmsInstance, sdkMock);
    expect(result).toEqual([]);
  });

  it('should throw an error if the response status is not 200', async () => {
    postMock.mockImplementationOnce(async () => ({
      data: { items: [] },
      status: 500,
      headers: {}
    }));

    await expect(getCadModelsForHybridDmInstance(dmsInstance, sdkMock)).rejects.toThrow(
      `Failed to fetch CAD models for DMS instance ${dmsInstance.externalId}. Status: 500`
    );
  });
});
