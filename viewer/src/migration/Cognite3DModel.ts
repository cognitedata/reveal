/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Color } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CadModel } from '../models/cad/CadModel';
import { toThreeJsBox3, CadNode } from '../views/threejs';
import { CadRenderHints } from '../views/CadRenderHints';
import { CogniteClient } from '@cognite/sdk';
import { CadLoadingHints } from '../models/cad/CadLoadingHints';
import { CadLoadingHints } from '../models/cad/CadLoadingHints';

export class Cognite3DModel extends THREE.Object3D {
  readonly cadModel: CadModel;
  readonly cadNode: CadNode;

  constructor(model: CadModel, cadNode: CadNode) {
    super();
    this.cadModel = model;
    this.cadNode = cadNode;

    this.children.push(cadNode);
  }

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

  setNodeColor(_nodeId: number, _r: number, _g: number, _b: number): void {
    throw new NotSupportedInMigrationWrapperError();
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
}
