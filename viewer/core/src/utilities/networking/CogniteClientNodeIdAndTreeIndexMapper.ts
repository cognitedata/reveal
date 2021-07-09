/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient, CogniteInternalId } from '@cognite/sdk';

// To avoid direct dependency on @cognite/sdk we use sdk-core here for HttpError.
// that's why it's avoided https://github.com/cognitedata/cdf-hub/pull/687/files#r489204315
import { HttpError } from '@cognite/sdk-core';

type ByTreeIndicesResponse = {
  items: CogniteInternalId[];
};

type ByNodeIdsReponse = {
  items: number[];
};

// TODO 2020-09-02 larsmoa: Transition to functions that will be added to @cognite/sdk for doing nodeId<>treeIndex mapping
export class CogniteClientNodeIdAndTreeIndexMapper {
  private readonly _client: CogniteClient;
  // The maximum number of items that the mapping endpoints accepts per chunk
  private static readonly MaxItemsPerRequest = 1000;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  async mapTreeIndicesToNodeIds(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndices: number[]
  ): Promise<CogniteInternalId[]> {
    const chunks = CogniteClientNodeIdAndTreeIndexMapper.chunkInputItems(treeIndices);
    const mappedIdsPromises = [...chunks].map(async chunk => {
      return this.postByTreeIndicesRequest(modelId, revisionId, chunk);
    });
    const mappedIds = await Promise.all(mappedIdsPromises);
    return mappedIds.flat();
  }

  async mapNodeIdsToTreeIndices(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeIds: CogniteInternalId[]
  ): Promise<number[]> {
    const chunks = CogniteClientNodeIdAndTreeIndexMapper.chunkInputItems(nodeIds);
    const mappedIdsPromises = [...chunks].map(async chunk => {
      return this.postByNodeIdsRequest(modelId, revisionId, chunk);
    });
    const mappedIds = await Promise.all(mappedIdsPromises);
    return mappedIds.flat();
  }

  private async postByTreeIndicesRequest(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndicesChunk: number[]
  ): Promise<CogniteInternalId[]> {
    console.assert(treeIndicesChunk.length <= CogniteClientNodeIdAndTreeIndexMapper.MaxItemsPerRequest);

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
    console.assert(nodeIdsChunk.length <= CogniteClientNodeIdAndTreeIndexMapper.MaxItemsPerRequest);

    const outputsUrl = `${this._client.getBaseUrl()}/api/v1/projects/${
      this._client.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/treeindices/byinternalids`;
    const response = await this._client.post<ByNodeIdsReponse>(outputsUrl, { data: { items: nodeIdsChunk } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw new HttpError(response.status, response.data, response.headers);
    }
  }

  private static *chunkInputItems<T>(items: T[]): Generator<T[]> {
    let i = 0;
    while (i < items.length) {
      const chunkSize = Math.min(items.length - i, CogniteClientNodeIdAndTreeIndexMapper.MaxItemsPerRequest);
      yield items.slice(i, i + chunkSize);
      i += chunkSize;
    }
  }
}
