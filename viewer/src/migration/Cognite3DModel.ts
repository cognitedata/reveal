/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Color } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';

export class Cognite3DModel extends THREE.Object3D {
  get modelId(): number {
    throw new NotSupportedInMigrationWrapperError();
  }
  get revisionId(): number {
    throw new NotSupportedInMigrationWrapperError();
  }
  getSubtreeNodeIds(nodeId: number, subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }
  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    throw new NotSupportedInMigrationWrapperError();
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
