/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Color } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CadModel } from '../models/cad/CadModel';
import { toThreeJsBox3, CadNode, NodeAppearance } from '../views/threejs';
import { loadCadModelFromCdf } from '../datasources/cognitesdk';
import { CadRenderHints } from '../views/CadRenderHints';
import { CogniteClient, InternalId, Node3D } from '@cognite/sdk';
import { CadLoadingHints } from '../models/cad/CadLoadingHints';
import { Subject } from 'rxjs';
import { bufferTime, flatMap, filter } from 'rxjs/operators';

interface NodeIdRequest {
  nodeId: InternalId;
  onComplete: (treeIndex: number) => void;
}

interface NodeIdResponse {
  requests: NodeIdRequest[];
  responses: Node3D[];
}

export class Cognite3DModel extends THREE.Object3D {

  get renderHints(): CadRenderHints {
    return this.cadNode.renderHints;
  }

  set renderHints(hints: CadRenderHints) {
    this.cadNode.renderHints = hints;
  }

  get loadingHints(): CadLoadingHints {
    return this.cadNode.loadingHints;
  }

  set loadingHints(hints: CadLoadingHints) {
    this.cadNode.loadingHints = hints;
  }
  readonly modelId: number;
  readonly revisionId: number;
  readonly cadModel: CadModel;
  readonly cadNode: CadNode;
  readonly nodeIdRequest: Subject<NodeIdRequest>;
  readonly nodeColors: Map<number, [number, number, number, number]>;
  readonly treeIndexToNodeIdMap: Map<number, number>;
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly client: CogniteClient;

  constructor(modelId: number, revisionId: number, model: CadModel, client: CogniteClient) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = model;
    this.client = client;
    this.nodeColors = new Map();
    this.nodeIdToTreeIndexMap = new Map();
    this.treeIndexToNodeIdMap = new Map();
    const nodeAppearance: NodeAppearance = {
      color: (treeIndex: number) => {
        return this.nodeColors.get(treeIndex);
      }
    };
    this.cadNode = new CadNode(model, { nodeAppearance });
    this.nodeIdRequest = this.setupPipeline();
    this.setupPipeline();

    this.children.push(this.cadNode);
  }

  dispose() {
    this.children = [];
  }

  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  iterateNodes(_action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  iterateSubtree(
    _nodeId: number,
    _action: (nodeId: number, treeIndex?: number) => void,
    _treeIndex?: number,
    _subtreeSize?: number
  ): Promise<boolean> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getNodeColor(_nodeId: number): Color {
    throw new NotSupportedInMigrationWrapperError();
  }

  setNodeColor(nodeId: number, r: number, g: number, b: number): void {
    const treeIndex = this.nodeIdToTreeIndexMap.get(nodeId);
    if (treeIndex !== undefined) {
      this.setNodeColorByTreeIndex(treeIndex, r, g, b);
      return;
    }

    this.nodeIdRequest.next({
      nodeId: {
        id: nodeId
      },
      onComplete: (treeIndexx: number) => {
        this.setNodeColorByTreeIndex(treeIndexx, r, g, b);
      }
    });
  }

  resetNodeColor(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  selectNode(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  deselectNode(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  deselectAllNodes(): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  showNode(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  showAllNodes(): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  hideAllNodes(_makeGray?: boolean): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  hideNode(_nodeId: number, _makeGray?: boolean): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  private setNodeColorByTreeIndex(treeIndex: number, r: number, g: number, b: number) {
    this.nodeColors.set(treeIndex, [r, g, b, 255]);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }

  private setupPipeline() {
    const nodeIdRequest = new Subject<NodeIdRequest>();
    nodeIdRequest
      .pipe(
        bufferTime(3000),
        filter((requests: NodeIdRequest[]) => requests.length > 0),
        flatMap(async (requests: NodeIdRequest[]) => {
          const responses = await this.client.revisions3D.retrieve3DNodes(
            this.modelId,
            this.revisionId,
            Array.from(requests.map(request => request.nodeId))
          );
          return {
            requests,
            responses
          };
        })
      )
      .subscribe((response: NodeIdResponse) => {
        console.log('Response', response);
        response.responses.forEach((node, index) => {
          this.treeIndexToNodeIdMap.set(node.treeIndex, node.id);
          this.nodeIdToTreeIndexMap.set(node.id, node.treeIndex);
          if (response.requests[index]) {
            response.requests[index].onComplete(node.treeIndex);
          }
        });
      });
    return nodeIdRequest;
  }
}

export async function createCognite3DModel(
  modelId: number,
  revisionId: number,
  client: CogniteClient
): Promise<Cognite3DModel> {
  const model = await loadCadModelFromCdf(client, revisionId);
  return new Cognite3DModel(modelId, revisionId, model, client);
}
