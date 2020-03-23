/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Color } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CadModel } from '../models/cad/CadModel';
import { toThreeJsBox3, CadNode } from '../views/threejs';
import { CadRenderHints } from '../views/CadRenderHints';
import { NodeAppearance } from '../views/common/cad/NodeAppearance';
import { CadLoadingHints } from '../models/cad/CadLoadingHints';
import { LevelOfDetail } from '../data/model/LevelOfDetail';
import { SectorQuads, Sector } from '../models/cad/types';

export class Cognite3DModel extends THREE.Object3D {
  readonly cadModel: CadModel;
  readonly cadNode: CadNode;
  readonly nodeColors: Map<number, [number, number, number, number]>;

  constructor(model: CadModel) {
    super();
    this.cadModel = model;
    this.nodeColors = new Map();
    const nodeAppearance: NodeAppearance = {
      color: (treeIndex: number) => {
        if (!this.cadNode) {
          return;
        }
        const nodeId = this.cadNode.rootSector.treeIndexToNodeIdMap.get(treeIndex);
        if (!nodeId) {
          // TODO get updates from cadNode when the map is updated
          return;
        }
        return this.nodeColors.get(nodeId);
      }
    };
    this.cadNode = new CadNode(model, { nodeAppearance });
    const that = this;
    this.cadNode.rootSector.addEventListener('nodeIdToTreeIndexMapUpdated', event => {
      const { sector } = event;
      switch (sector.levelOfDetail) {
        case LevelOfDetail.Simple: {
          const simpleData = sector.data as SectorQuads;
          const treeIndices = Array.from(simpleData.nodeIdToTreeIndexMap)
            .filter(([nodeId]) => that.nodeColors.has(nodeId))
            .map(([_nodeId, treeIndex]) => treeIndex);
          if (treeIndices.length > 0) {
            that.cadNode.requestNodeUpdate(treeIndices);
          }
          break;
        }
        case LevelOfDetail.Detailed: {
          const detailedData = sector.data as Sector;
          const treeIndices = Array.from(detailedData.nodeIdToTreeIndexMap)
            .filter(([nodeId]) => that.nodeColors.has(nodeId))
            .map(([_nodeId, treeIndex]) => treeIndex);
          if (treeIndices.length > 0) {
            that.cadNode.requestNodeUpdate(treeIndices);
          }
          break;
        }
        default: {
          break;
        }
      }
    });
    this.children.push(this.cadNode);
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

  getNodeColor(nodeId: number): Color {
    const color = this.nodeColors.get(nodeId);
    if (!color) {
      return {
        r: 255,
        g: 255,
        b: 255
      };
    }
    const [r, g, b] = color;
    return {
      r,
      g,
      b
    };
  }

  setNodeColor(nodeId: number, r: number, g: number, b: number): void {
    this.nodeColors.set(nodeId, [r, g, b, 255]);
    this.refreshNodeColor(nodeId);
  }

  resetNodeColor(nodeId: number): void {
    this.nodeColors.delete(nodeId);
    this.refreshNodeColor(nodeId);
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

  private refreshNodeColor(nodeId: number) {
    const treeIndex = this.cadNode.rootSector.nodeIdToTreeIndexMap.get(nodeId);
    if (!treeIndex) {
      // TODO get updates from cadNode when the map is updated
      return;
    }
    this.cadNode.requestNodeUpdate([treeIndex]);
  }
}
