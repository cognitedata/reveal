/*!
 * Copyright 2021 Cognite AS
 */

import { Subject, Observable } from 'rxjs';
import { bufferTime, mergeMap, filter, mergeAll, map, share, tap, first } from 'rxjs/operators';
import { CogniteClient, CogniteInternalId, InternalId } from '@cognite/sdk';
import { CogniteClientNodeIdAndTreeIndexMapper } from '../../utilities/networking/CogniteClientNodeIdAndTreeIndexMapper';

type NodeIdRequest = CogniteInternalId;
type TreeIndexRequest = number;
type SubtreeSizeRequest = InternalId;

/* eslint-disable jsdoc/require-jsdoc */
/**
 * @internal
 */
export class NodeIdAndTreeIndexMaps {
  private readonly modelId: number;
  private readonly revisionId: number;
  private readonly client: CogniteClient;
  private readonly indexMapperClient: CogniteClientNodeIdAndTreeIndexMapper;

  private readonly treeIndexSubTreeSizeMap: Map<number, number>;

  private readonly nodeIdToTreeIndexMap: Map<number, number>;
  private readonly treeIndexToNodeIdMap: Map<number, number>;

  private readonly nodeIdRequestObservable: Subject<NodeIdRequest>;
  private readonly nodeIdResponse: Observable<{ nodeId: CogniteInternalId; treeIndex: number }>;

  private readonly treeIndexRequestObservable: Subject<TreeIndexRequest>;
  private readonly treeIndexResponse: Observable<{ nodeId: CogniteInternalId; treeIndex: number }>;

  private readonly subtreeSizeObservable: Subject<SubtreeSizeRequest>;
  private readonly subtreeSizeResponse: Observable<{ treeIndex: number; subtreeSize: number }>;

  constructor(
    modelId: number,
    revisionId: number,
    client: CogniteClient,
    indexMapperClient: CogniteClientNodeIdAndTreeIndexMapper
  ) {
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.client = client;
    this.indexMapperClient = indexMapperClient;

    this.nodeIdToTreeIndexMap = new Map();
    this.treeIndexToNodeIdMap = new Map();
    this.treeIndexSubTreeSizeMap = new Map();

    // Setup pipeline for requests for mapping nodeId -> treeIndex
    this.nodeIdRequestObservable = new Subject();
    this.nodeIdResponse = this.nodeIdRequestObservable.pipe(
      bufferTime(50),
      filter((requests: NodeIdRequest[]) => requests.length > 0),
      mergeMap(async (requests: NodeIdRequest[]) => {
        const treeIndices = await this.indexMapperClient.mapNodeIdsToTreeIndices(
          this.modelId,
          this.revisionId,
          requests
        );
        return requests.map((nodeId, index) => {
          return { nodeId, treeIndex: treeIndices[index] };
        });
      }),
      mergeAll(),
      tap((node: { nodeId: CogniteInternalId; treeIndex: number }) => {
        this.nodeIdToTreeIndexMap.set(node.nodeId, node.treeIndex);
        this.treeIndexToNodeIdMap.set(node.treeIndex, node.nodeId);
      }),
      share()
    );

    // Setup pipeline for requests for mapping nodeId -> treeIndex
    this.treeIndexRequestObservable = new Subject();
    this.treeIndexResponse = this.treeIndexRequestObservable.pipe(
      bufferTime(50),
      filter((requests: TreeIndexRequest[]) => requests.length > 0),
      mergeMap(async (requests: TreeIndexRequest[]) => {
        const nodeIds = await this.indexMapperClient.mapTreeIndicesToNodeIds(this.modelId, this.revisionId, requests);
        return requests.map((treeIndex, index) => {
          return { nodeId: nodeIds[index], treeIndex };
        });
      }),
      mergeAll(),
      tap((node: { nodeId: CogniteInternalId; treeIndex: number }) => {
        this.nodeIdToTreeIndexMap.set(node.nodeId, node.treeIndex);
        this.treeIndexToNodeIdMap.set(node.treeIndex, node.nodeId);
      }),
      share()
    );

    // Setup pipeline for request for determinging subtree size given nodeId
    this.subtreeSizeObservable = new Subject();
    this.subtreeSizeResponse = this.subtreeSizeObservable.pipe(
      bufferTime(50),
      filter((requests: SubtreeSizeRequest[]) => requests.length > 0),
      mergeMap(async (requests: SubtreeSizeRequest[]) => {
        const nodes = await this.client.revisions3D.retrieve3DNodes(this.modelId, this.revisionId, requests);
        return nodes.map(n => {
          return { treeIndex: n.treeIndex, subtreeSize: n.subtreeSize };
        });
      }),
      mergeAll(),
      tap((node: { treeIndex: number; subtreeSize: number }) => {
        this.treeIndexSubTreeSizeMap.set(node.treeIndex, node.subtreeSize);
      }),
      share()
    );
  }

  async getTreeIndex(nodeId: CogniteInternalId): Promise<number> {
    const treeIndex = this.nodeIdToTreeIndexMap.get(nodeId);
    if (treeIndex !== undefined) {
      return treeIndex;
    }

    const result = this.nodeIdResponse
      .pipe(
        first(node => node.nodeId === nodeId),
        map(node => node.treeIndex)
      )
      .toPromise();

    this.nodeIdRequestObservable.next(nodeId);
    return result;
  }

  async getNodeId(treeIndex: number): Promise<number> {
    const nodeId = this.treeIndexToNodeIdMap.get(treeIndex);
    if (nodeId !== undefined) {
      return nodeId;
    }

    const result = this.treeIndexResponse
      .pipe(
        first(node => node.treeIndex === treeIndex),
        map(node => node.nodeId)
      )
      .toPromise();

    this.treeIndexRequestObservable.next(treeIndex);
    return result;
  }

  async getSubtreeSize(treeIndex: number): Promise<number> {
    const subtreeSize = this.treeIndexSubTreeSizeMap.get(treeIndex);
    if (subtreeSize) {
      return subtreeSize;
    }

    const nodeId = await this.getNodeId(treeIndex);
    const result = this.subtreeSizeResponse
      .pipe(
        first(node => node.treeIndex === treeIndex),
        map(node => node.subtreeSize)
      )
      .toPromise();
    this.subtreeSizeObservable.next({ id: nodeId });

    return result;
  }

  async getTreeIndices(nodeIds: number[]): Promise<number[]> {
    const mapped = nodeIds.map(id => this.nodeIdToTreeIndexMap.get(id) || -1);
    const notCachedNodeIds = nodeIds.filter((_value, index) => mapped[index] === -1);
    if (notCachedNodeIds.length === 0) {
      return mapped;
    }
    const nodeIdToIndex = new Map(nodeIds.map((value, index) => [value, index]));

    const treeIndices = await this.indexMapperClient.mapNodeIdsToTreeIndices(
      this.modelId,
      this.revisionId,
      notCachedNodeIds
    );
    console.assert(notCachedNodeIds.length === treeIndices.length);
    for (let i = 0; i < treeIndices.length; i++) {
      const nodeId = notCachedNodeIds[i];
      const treeIndex = treeIndices[i];
      const index = nodeIdToIndex.get(nodeId)!;
      mapped[index] = treeIndex;
      this.add(nodeId, treeIndex);
    }

    return mapped;
  }

  async getNodeIds(treeIndices: number[]): Promise<number[]> {
    const mapped = treeIndices.map(idX => this.treeIndexToNodeIdMap.get(idX) || -1);
    const notCachedTreeIndices = treeIndices.filter((_value, index) => mapped[index] === -1);
    if (notCachedTreeIndices.length === 0) {
      return mapped;
    }
    const treeIndexToIndex = new Map(treeIndices.map((value, index) => [value, index]));

    const nodeIds = await this.indexMapperClient.mapTreeIndicesToNodeIds(
      this.modelId,
      this.revisionId,
      notCachedTreeIndices
    );
    console.assert(nodeIds.length === notCachedTreeIndices.length);
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const treeIndex = notCachedTreeIndices[i];
      const index = treeIndexToIndex.get(treeIndex)!;
      mapped[index] = nodeId;
      this.add(nodeId, treeIndex);
    }

    return mapped;
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
