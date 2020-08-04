/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, Observable } from 'rxjs';
import { bufferTime, flatMap, filter, mergeAll, map, share, tap, first } from 'rxjs/operators';
import { CogniteClient, InternalId, Node3D } from '@cognite/sdk';

type NodeIdRequest = InternalId;

export class NodeIdAndTreeIndexMaps {
  private readonly modelId: number;
  private readonly revisionId: number;
  private readonly client: CogniteClient;

  private readonly treeIndexSubTreeSizeMap: Map<number, number>;

  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;
  readonly nodeIdRequestObservable: Subject<NodeIdRequest>;
  readonly nodeIdResponse: Observable<Node3D>;

  constructor(modelId: number, revisionId: number, client: CogniteClient) {
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.client = client;

    this.nodeIdToTreeIndexMap = new Map();
    this.treeIndexToNodeIdMap = new Map();
    this.treeIndexSubTreeSizeMap = new Map();
    this.nodeIdRequestObservable = new Subject();
    this.nodeIdResponse = this.nodeIdRequestObservable.pipe(
      bufferTime(50),
      filter((requests: NodeIdRequest[]) => requests.length > 0),
      flatMap(async (requests: NodeIdRequest[]) => {
        const responses = await client.revisions3D.retrieve3DNodes(modelId, revisionId, requests);
        return responses;
      }),
      mergeAll(),
      tap((node: Node3D) => {
        this.nodeIdToTreeIndexMap.set(node.id, node.treeIndex);
        this.treeIndexToNodeIdMap.set(node.treeIndex, node.id);
        this.treeIndexSubTreeSizeMap.set(node.treeIndex, node.subtreeSize);
      }),
      share()
    );
  }

  async getTreeIndex(nodeId: number): Promise<number> {
    const treeIndex = this.nodeIdToTreeIndexMap.get(nodeId);
    if (treeIndex) {
      return treeIndex;
    }

    const result = this.nodeIdResponse
      .pipe(
        first((node: Node3D) => node.id === nodeId),
        map((node: Node3D) => node.treeIndex)
      )
      .toPromise();

    this.nodeIdRequestObservable.next({
      id: nodeId
    });
    return result;
  }

  async getNumberOfChildren(treeIndex: number): Promise<number | undefined> {
    const cachedNumberOfChildren = this.treeIndexSubTreeSizeMap.get(treeIndex);

    if (cachedNumberOfChildren) {
      return cachedNumberOfChildren;
    }

    //TODO - christjt 2020-08-04: handle this with with new endpoint to fetch the proper nodeID
    const nodeId = this.treeIndexToNodeIdMap.get(treeIndex);
    if (!nodeId) {
      console.warn(`Could not find nodeID for given treeIndex(${treeIndex})`);
      return undefined;
    }

    const nodes = await this.client.revisions3D.retrieve3DNodes(this.modelId, this.revisionId, [{ id: nodeId }]);

    this.treeIndexSubTreeSizeMap.set(treeIndex, nodes[0].subtreeSize);

    return nodes[0].subtreeSize;
  }

  async getTreeIndices(nodeIds: number[]): Promise<number[]> {
    const mapped = nodeIds.map(id => this.nodeIdToTreeIndexMap.get(id) || -1);
    const notCachedNodeIds = nodeIds.filter((_value, index) => mapped[index] === -1).map(id => ({ id }));
    if (notCachedNodeIds.length === 0) {
      return mapped;
    }
    const nodeIdToIndex = new Map(nodeIds.map((value, index) => [value, index]));
    const nodes = await this.client.revisions3D.retrieve3DNodes(this.modelId, this.revisionId, notCachedNodeIds);
    for (let i = 0; i < nodes.length; i++) {
      const { id: nodeId, treeIndex } = nodes[i];
      const index = nodeIdToIndex.get(nodeId)!;
      mapped[index] = treeIndex;
      this.add(nodeId, treeIndex);
    }

    return mapped;
  }

  getNodeId(treeIndex: number): number | undefined {
    return this.treeIndexToNodeIdMap.get(treeIndex);
  }

  updateMaps(nodeIdToTreeIndexMap: Map<number, number>) {
    for (const [nodeId, treeIndex] of nodeIdToTreeIndexMap) {
      this.add(nodeId, treeIndex);
    }
  }

  add(nodeId: number, treeIndex: number) {
    this.nodeIdToTreeIndexMap.set(nodeId, treeIndex);
    this.treeIndexToNodeIdMap.set(treeIndex, nodeId);
  }
}
