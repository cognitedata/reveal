/*!
 * Copyright 2021 Cognite AS
 */

import type { CogniteInternalId, HttpRequestOptions, HttpResponse } from '@cognite/sdk';
import { CogniteClient } from '@cognite/sdk';
import { NodesCdfClient } from './NodesCdfClient';
import { vi } from 'vitest';

function stubTreeIndexToNodeId(treeIndex: number): CogniteInternalId {
  return treeIndex + 1337;
}

function stubNodeIdToTreeIndex(nodeId: CogniteInternalId): number {
  return nodeId - 1337;
}

type ByTreeIndicesRequestBody = {
  items: CogniteInternalId[];
};

type ByNodeIdsRequestBody = {
  items: number[];
};

type ByTreeIndicesResponse = { items: CogniteInternalId[] };
type ByNodeIdsResponse = { items: number[] };

describe('NodesCdfClient', () => {
  let bytreeindicesRequestCount: number;
  let byinternalidsRequestCount: number;
  let nodesClient: NodesCdfClient;
  let client: CogniteClient;

  beforeEach(() => {
    bytreeindicesRequestCount = 0;
    byinternalidsRequestCount = 0;

    client = new CogniteClient({ appId: 'reveal.test', project: 'dummy', getToken: async () => 'dummy' });

    vi.spyOn(client, 'post').mockImplementation(
      async (url: string, options?: HttpRequestOptions): Promise<HttpResponse<unknown>> => {
        const requestItems =
          (options?.data as ByTreeIndicesRequestBody | ByNodeIdsRequestBody | undefined)?.items ?? [];
        if (/\/internalids\/bytreeindices/.test(url)) {
          bytreeindicesRequestCount++;
          const response: HttpResponse<ByTreeIndicesResponse> = {
            status: 200,
            data: { items: (requestItems as number[]).map(stubTreeIndexToNodeId) },
            headers: {}
          };
          return response;
        }
        if (/\/treeindices\/byinternalids/.test(url)) {
          byinternalidsRequestCount++;
          const response: HttpResponse<ByNodeIdsResponse> = {
            status: 200,
            data: { items: (requestItems as number[]).map(stubNodeIdToTreeIndex) },
            headers: {}
          };
          return response;
        }
        throw new Error(`Unexpected URL: ${url}`);
      }
    );

    nodesClient = new NodesCdfClient(client);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('mapTreeIndicesToNodeIds with a single item', async () => {
    const nodeIds = await nodesClient.mapTreeIndicesToNodeIds(0, 0, [10]);
    expect(nodeIds).toEqual([10].map(stubTreeIndexToNodeId));
    expect(bytreeindicesRequestCount).toEqual(1); // One request
  });

  test('mapTreeIndicesToNodeIds with a a lot of items, splits into batches', async () => {
    await nodesClient.mapTreeIndicesToNodeIds(0, 0, Array.from(new Array(1111).keys()));
    expect(bytreeindicesRequestCount).toEqual(2); // Two requests
  });

  test('mapNodeIdsToTreeIndices with a single item', async () => {
    const nodeIds = await nodesClient.mapNodeIdsToTreeIndices(0, 0, [10]);

    expect(nodeIds).toEqual([10].map(stubNodeIdToTreeIndex));
    expect(byinternalidsRequestCount).toEqual(1); // One request
  });

  test('mapNodeIdsToTreeIndices with a a lot of items, splits into batches', async () => {
    await nodesClient.mapNodeIdsToTreeIndices(0, 0, Array.from(new Array(1111).keys()));
    expect(byinternalidsRequestCount).toEqual(2); // Two requests
  });
});
