/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Color } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CogniteClient, List3DNodesQuery } from '@cognite/sdk';
import { CadModel } from '../models/cad/CadModel';
import { toThreeJsBox3, CadNode } from '../views/threejs';
import { loadCadModelFromCdf } from '../datasources/cognitesdk';
import { CadRenderHints } from '../views/CadRenderHints';

export class Cognite3DModel extends THREE.Object3D {
  readonly modelId: number;
  readonly revisionId: number;
  readonly cadModel: CadModel;
  readonly cadNode: CadNode;

  private readonly client: CogniteClient;

  constructor(modelId: number, revisionId: number, client: CogniteClient, model: CadModel, cadNode: CadNode) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.client = client;
    this.cadModel = model;
    this.cadNode = cadNode;

    this.children.push(cadNode);
  }

  get renderHints(): CadRenderHints {
    return this.cadNode.renderHints;
  }

  set renderHints(value: CadRenderHints) {
    this.cadNode.renderHints = value;
  }

  dispose() {
    this.children = [];
  }

  getSubtreeNodeIds(nodeId: number, subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  iterateNodes(action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  iterateSubtree(
    nodeId: number,
    action: (nodeId: number, treeIndex?: number) => void,
    treeIndex?: number,
    subtreeSize?: number
  ): Promise<boolean> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getNodeColor(nodeId: number): Color {
    throw new NotSupportedInMigrationWrapperError();
  }

  setNodeColor(nodeId: number, r: number, g: number, b: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  resetNodeColor(nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  selectNode(nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  deselectNode(nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  deselectAllNodes(): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  showNode(nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  showAllNodes(): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  hideAllNodes(makeGray?: boolean): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  hideNode(nodeId: number, makeGray?: boolean): void {
    throw new NotSupportedInMigrationWrapperError();
  }
}

export async function createCognite3DModel(
  modelId: number,
  revisionId: number,
  client: CogniteClient
): Promise<Cognite3DModel> {
  const model = await loadCadModelFromCdf(client, revisionId);
  const node = new CadNode(model);
  return new Cognite3DModel(modelId, revisionId, client, model, node);
}
