/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient, CogniteInternalId, HttpError } from '@cognite/sdk';
import { NodesApiClient } from './NodesApiClient';
import { ByNodeIdsResponse, ByTreeIndicesResponse, NodeTreeIndexAndSubtreeSize } from './types';

export class NodesCdfClient implements NodesApiClient {
  private static readonly MaxItemsPerRequest = 1000;

  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  async mapTreeIndicesToNodeIds(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndices: number[]
  ): Promise<number[]> {
    const chunks = chunkInputItems(treeIndices, NodesCdfClient.MaxItemsPerRequest);
    const mappedTreeIndicesPromises = [...chunks].map(async chunk => {
      return this.postByTreeIndicesRequest(modelId, revisionId, chunk);
    });
    const mappedTreeIndices = await Promise.all(mappedTreeIndicesPromises);
    return mappedTreeIndices.flat();
  }

  async mapNodeIdsToTreeIndices(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndices: number[]
  ): Promise<CogniteInternalId[]> {
    const chunks = chunkInputItems(treeIndices, NodesCdfClient.MaxItemsPerRequest);
    const mappedIdsPromises = [...chunks].map(async chunk => {
      return this.postByNodeIdsRequest(modelId, revisionId, chunk);
    });
    const mappedIds = await Promise.all(mappedIdsPromises);
    return mappedIds.flat();
  }

  async determineTreeIndexAndSubtreeSizesByNodeIds(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeIds: CogniteInternalId[]
  ): Promise<NodeTreeIndexAndSubtreeSize[]> {
    const requests = nodeIds.map(id => ({ id }));
    const nodes = await this._client.revisions3D.retrieve3DNodes(modelId, revisionId, requests);
    return nodes.map(n => {
      return { treeIndex: n.treeIndex, subtreeSize: n.subtreeSize };
    });
  }

  private async postByTreeIndicesRequest(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndicesChunk: number[]
  ): Promise<CogniteInternalId[]> {
    console.assert(treeIndicesChunk.length <= NodesCdfClient.MaxItemsPerRequest);

    const outputsUrl = `${this._client.getBaseUrl()}/api/v1/projects/${
      this._client.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
    const response = await this._client.post<ByTreeIndicesResponse>(outputsUrl, { data: { items: treeIndicesChunk } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw new HttpError(response.status, response.data, response.headers);
    }
  }

  private async postByNodeIdsRequest(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeIdsChunk: number[]
  ): Promise<number[]> {
    console.assert(nodeIdsChunk.length <= NodesCdfClient.MaxItemsPerRequest);

    const outputsUrl = `${this._client.getBaseUrl()}/api/v1/projects/${
      this._client.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/treeindices/byinternalids`;
    const response = await this._client.post<ByNodeIdsResponse>(outputsUrl, { data: { items: nodeIdsChunk } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw new HttpError(response.status, response.data, response.headers);
    }
  }
}

function* chunkInputItems<T>(items: T[], maxChunkSize: number): Generator<T[]> {
  let i = 0;
  while (i < items.length) {
    const chunkSize = Math.min(items.length - i, maxChunkSize);
    yield items.slice(i, i + chunkSize);
    i += chunkSize;
  }
}
