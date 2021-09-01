/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CogniteClient, CogniteInternalId, HttpError } from '@cognite/sdk';
import assert from 'assert';
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

  async determineNodeAncestorsByNodeId(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    generation: number
  ): Promise<NodeTreeIndexAndSubtreeSize> {
    const ancestors = await this._client.revisions3D.list3DNodeAncestors(modelId, revisionId, nodeId, {
      limit: 1000
    });
    const node = ancestors.items.find(x => x.id === nodeId)!;
    assert(node !== undefined, `Could not find ancestor for node with nodeId ${nodeId}`);

    // Clamp to root if necessary
    generation = Math.min(node.depth, generation);
    const ancestor = ancestors.items.find(x => x.depth === node.depth - generation)!;
    assert(node !== undefined, `Could not find ancestor for node with nodeId ${nodeId} at 'generation' ${generation}`);

    return { treeIndex: ancestor.treeIndex, subtreeSize: ancestor.subtreeSize };
  }

  async getBoundingBoxByNodeId(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    box?: THREE.Box3
  ): Promise<THREE.Box3> {
    const response = await this._client.revisions3D.retrieve3DNodes(modelId, revisionId, [{ id: nodeId }]);
    if (response.length < 1) {
      throw new Error('NodeId not found');
    }
    const boundingBox3D = response[0].boundingBox;
    if (boundingBox3D === undefined) {
      throw new Error(`Node ${nodeId} doesn't have a defined bounding box`);
    }

    const min = boundingBox3D.min;
    const max = boundingBox3D.max;
    const result = box || new THREE.Box3();
    result.min.set(min[0], min[1], min[2]);
    result.max.set(max[0], max[1], max[2]);
    return result;
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
