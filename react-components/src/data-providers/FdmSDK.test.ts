import { describe, it, expect, vi } from 'vitest';
import { FdmSDK } from './FdmSDK';
import { type CogniteClient, type QueryRequest } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { createDMAssetMock } from '#test-utils/fixtures/assets';
import { COGNITE_ASSET_SOURCE } from './core-dm-provider/dataModels';

describe(FdmSDK.name, () => {
  const baseUrl = 'https://api.cognitedata.com';

  describe('queryAllNodesAndEdges', () => {
    const queryNodesAndEdgesMock = vi.fn();
    const sdkMock = new Mock<CogniteClient>()
      .setup((p) => p.getBaseUrl())
      .returns(baseUrl)
      .setup((p) => p.project)
      .returns('test-project')
      .setup((sdk) => sdk.instances.query)
      .returns(queryNodesAndEdgesMock);

    const fdmSdkMock = new FdmSDK(sdkMock.object());

    const mockQuery: QueryRequest = {
      with: {
        cad_nodes: {
          nodes: {
            filter: { equals: { property: ['key'], value: 'value' } }
          }
        }
      },
      select: {
        cad_assets: {
          sources: [
            {
              source: { externalId: 'asset1', space: 'space1', version: 'v1', type: 'view' },
              properties: ['*']
            }
          ]
        }
      }
    };

    const mockCadAssets = [
      {
        externalId: 'asset1',
        space: 'space1',
        createdTime: 123,
        version: 1,
        instanceType: 'node' as const,
        lastUpdatedTime: 123,
        properties: {}
      },
      {
        externalId: 'asset2',
        space: 'space1',
        createdTime: 123,
        version: 1,
        instanceType: 'node' as const,
        lastUpdatedTime: 123,
        properties: {}
      }
    ];

    it('should return results when there is no nextCursor', async () => {
      queryNodesAndEdgesMock.mockResolvedValueOnce({
        items: { cad_assets: [mockCadAssets[0]] },
        nextCursor: undefined
      });

      const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

      expect(result.items).toEqual({ cad_assets: [mockCadAssets[0]] });

      expect(queryNodesAndEdgesMock).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple pages of results with nextCursor', async () => {
      queryNodesAndEdgesMock
        .mockResolvedValueOnce({
          items: { cad_assets: [mockCadAssets[0]] },
          nextCursor: { cad_assets: 'cursor1' }
        })
        .mockResolvedValueOnce({
          items: { cad_assets: [mockCadAssets[1]] },
          nextCursor: undefined
        });

      const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

      expect(result.items).toEqual({
        cad_assets: mockCadAssets
      });
      expect(queryNodesAndEdgesMock).toHaveBeenCalledTimes(2);
    });

    it('should handle initialCursorTypes filtering nextCursor', async () => {
      const initialCursorTypes = ['cad_assets'];

      queryNodesAndEdgesMock
        .mockResolvedValueOnce({
          items: { cad_assets: [mockCadAssets[0]] },
          nextCursor: { cad_assets: 'cursor1', cad_nodes: 'cursor2' }
        })
        .mockResolvedValueOnce({
          items: { cad_assets: [mockCadAssets[1]] },
          nextCursor: undefined
        });

      const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery, initialCursorTypes);

      expect(result.items).toEqual({
        cad_assets: mockCadAssets
      });
      expect(queryNodesAndEdgesMock).toHaveBeenCalledTimes(2);
    });

    it('should handle empty nextCursor and stop querying', async () => {
      queryNodesAndEdgesMock.mockResolvedValueOnce({
        items: { cad_assets: [mockCadAssets[0]] },
        nextCursor: {}
      });

      const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

      expect(result.items).toEqual({ cad_assets: [mockCadAssets[0]] });
      expect(queryNodesAndEdgesMock).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during querying', async () => {
      queryNodesAndEdgesMock.mockRejectedValueOnce(new Error('Query failed'));

      await expect(fdmSdkMock.queryAllNodesAndEdges(mockQuery)).rejects.toThrow('Query failed');
      expect(queryNodesAndEdgesMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByExternalIds', () => {
    type PropertyType = unknown;
    const mockPost = vi.fn<CogniteClient['post']>();

    const sdk = new Mock<CogniteClient>()
      .setup((p) => p.post<PropertyType>)
      .returns(mockPost)
      .setup((p) => p.getBaseUrl())
      .returns(baseUrl)
      .object();

    it('should not query with empty input', async () => {
      const fdmSdk = new FdmSDK(sdk);
      const result = await fdmSdk.getByExternalIds([]);
      expect(result).toEqual({ items: [] });
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should call the appropriate endpoint with appropriate input', async () => {
      const fdmSdk = new FdmSDK(sdk);
      const mockedResponse = {
        data: { items: [createDMAssetMock('externalId')] },
        status: 200,
        headers: {}
      };
      mockPost.mockResolvedValue(mockedResponse);
      const queryItem = {
        instanceType: 'node',
        externalId: 'external-id',
        space: 'space'
      } as const;

      const result = await fdmSdk.getByExternalIds([queryItem], [COGNITE_ASSET_SOURCE]);

      expect(result).toBe(mockedResponse.data);
      expect(mockPost).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/projects/undefined/models/instances/byids`,
        {
          data: {
            items: [queryItem],
            sources: [{ source: COGNITE_ASSET_SOURCE }],
            includeTyping: true
          }
        }
      );
    });
  });
});
