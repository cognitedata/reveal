import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FdmSDK } from './FdmSDK';
import { sdkMock } from '../../tests/tests-utilities/fixtures/sdk';
import { type QueryRequest } from '@cognite/sdk';
import { queryNodesAndEdges } from './utils/queryNodesAndEdges';

vi.mock('./utils/queryNodesAndEdges');
describe('FdmSDK.queryAllNodesAndEdges', () => {
  const fdmSdkMock = new FdmSDK(sdkMock);

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return results when there is no nextCursor', async () => {
    vi.mocked(queryNodesAndEdges).mockResolvedValueOnce({
      items: { cad_assets: [mockCadAssets[0]] },
      nextCursor: undefined
    });

    const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

    expect(result.items).toEqual({ cad_assets: [mockCadAssets[0]] });
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple pages of results with nextCursor', async () => {
    vi.mocked(queryNodesAndEdges)
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
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(2);
  });

  it('should handle initialCursorTypes filtering nextCursor', async () => {
    const initialCursorTypes = ['cad_assets'];

    vi.mocked(queryNodesAndEdges)
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
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(2);
  });

  it('should handle empty nextCursor and stop querying', async () => {
    vi.mocked(queryNodesAndEdges).mockResolvedValueOnce({
      items: { cad_assets: [mockCadAssets[0]] },
      nextCursor: {}
    });

    const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

    expect(result.items).toEqual({ cad_assets: [mockCadAssets[0]] });
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(1);
  });

  it('should handle errors during querying', async () => {
    vi.mocked(queryNodesAndEdges).mockRejectedValueOnce(new Error('Query failed'));

    await expect(fdmSdkMock.queryAllNodesAndEdges(mockQuery)).rejects.toThrow('Query failed');
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(1);
  });
});
