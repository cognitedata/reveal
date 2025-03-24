import { describe, it, expect, vi, beforeEach, Mock as viMock } from 'vitest';
import { FdmSDK } from './FdmSDK';
import { sdkMock } from '../../tests/tests-utilities/fixtures/sdk';
import { type QueryRequest } from '@cognite/sdk';
import { queryNodesAndEdges } from './utils/queryNodesAndEdges';
import { mergeQueryResults } from './utils/mergeQueryResult';

vi.mock('./utils/queryNodesAndEdges');
vi.mock('./utils/mergeQueryResult');

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return results when there is no nextCursor', async () => {
    (queryNodesAndEdges as viMock).mockResolvedValueOnce({
      items: { cad_assets: [{ externalId: 'asset1', space: 'space1' }] },
      nextCursor: undefined
    });

    const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

    expect(result.items).toEqual({ cad_assets: [{ externalId: 'asset1', space: 'space1' }] });
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple pages of results with nextCursor', async () => {
    (queryNodesAndEdges as viMock)
      .mockResolvedValueOnce({
        items: { cad_assets: [{ externalId: 'asset1', space: 'space1' }] },
        nextCursor: { cad_assets: 'cursor1' }
      })
      .mockResolvedValueOnce({
        items: { cad_assets: [{ externalId: 'asset2', space: 'space1' }] },
        nextCursor: undefined
      });

    (mergeQueryResults as viMock).mockImplementation(
      (items1: { cad_assets: any[] }, items2: { cad_assets: any[] }) => ({
        cad_assets: [...items1.cad_assets, ...items2.cad_assets]
      })
    );

    const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

    expect(result.items).toEqual({
      cad_assets: [
        { externalId: 'asset1', space: 'space1' },
        { externalId: 'asset2', space: 'space1' }
      ]
    });
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(2);
    expect(mergeQueryResults).toHaveBeenCalledTimes(1);
  });

  it('should handle initialCursorTypes filtering nextCursor', async () => {
    const initialCursorTypes = ['cad_assets'];

    (queryNodesAndEdges as viMock)
      .mockResolvedValueOnce({
        items: { cad_assets: [{ externalId: 'asset1', space: 'space1' }] },
        nextCursor: { cad_assets: 'cursor1', cad_nodes: 'cursor2' }
      })
      .mockResolvedValueOnce({
        items: { cad_assets: [{ externalId: 'asset2', space: 'space1' }] },
        nextCursor: undefined
      });

    (mergeQueryResults as viMock).mockImplementation(
      (items1: { cad_assets: any[] }, items2: { cad_assets: any[] }) => ({
        cad_assets: [...items1.cad_assets, ...items2.cad_assets]
      })
    );

    const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery, initialCursorTypes);

    expect(result.items).toEqual({
      cad_assets: [
        { externalId: 'asset1', space: 'space1' },
        { externalId: 'asset2', space: 'space1' }
      ]
    });
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(2);
    expect(mergeQueryResults).toHaveBeenCalledTimes(1);
  });

  it('should handle empty nextCursor and stop querying', async () => {
    (queryNodesAndEdges as viMock).mockResolvedValueOnce({
      items: { cad_assets: [{ externalId: 'asset1', space: 'space1' }] },
      nextCursor: {}
    });

    const result = await fdmSdkMock.queryAllNodesAndEdges(mockQuery);

    expect(result.items).toEqual({ cad_assets: [{ externalId: 'asset1', space: 'space1' }] });
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(1);
  });

  it('should handle errors during querying', async () => {
    (queryNodesAndEdges as viMock).mockRejectedValueOnce(new Error('Query failed'));

    await expect(fdmSdkMock.queryAllNodesAndEdges(mockQuery)).rejects.toThrow('Query failed');
    expect(queryNodesAndEdges).toHaveBeenCalledTimes(1);
  });
});
