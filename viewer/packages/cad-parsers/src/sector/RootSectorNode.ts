/*!
 * Copyright 2021 Cognite AS
 */

import { Matrix4 } from 'three';

import { SectorNode } from './SectorNode';
import type { CadModelMetadata } from '../metadata/CadModelMetadata';
import type { SectorMetadata } from '../metadata/types';

export class RootSectorNode extends SectorNode {
  public readonly sectorNodeMap: Map<number, SectorNode>;

  constructor(modelMetadata: CadModelMetadata) {
    const modelBounds = modelMetadata.scene.root.subtreeBoundingBox.clone();
    modelBounds.applyMatrix4(modelMetadata.modelMatrix);
    super(0, '/', modelBounds);

    const { scene, modelMatrix } = modelMetadata;
    this.sectorNodeMap = new Map();
    buildScene(scene.root, this, this.sectorNodeMap, modelMatrix);

    // Disable automatic update of matrices of the subtree as it
    // is quite time consuming. We trust that our owner keeps
    // our matrices updated.
    this.matrixAutoUpdate = false;
    this.setModelTransformation(modelMatrix);
  }

  dereferenceAllNodes(): void {
    for (const [_, node] of this.sectorNodeMap) {
      // Clear rendered meshes from each sector node
      // Note: Shared geometry/material dereferencing is handled by CadNode.dispose()
      node.resetGeometry();
    }
  }

  setModelTransformation(matrix: Matrix4): void {
    this.matrix.copy(matrix);
    this.updateMatrixWorld(true);
  }

  getModelTransformation(out = new Matrix4()): Matrix4 {
    return out.copy(this.matrix);
  }
}

function buildScene(
  sector: SectorMetadata,
  parent: SectorNode,
  sectorNodeMap: Map<number, SectorNode>,
  modelMatrix: Matrix4
) {
  const bounds = sector.subtreeBoundingBox.clone();
  bounds.applyMatrix4(modelMatrix);
  const sectorGroup = new SectorNode(sector.id, sector.path, bounds);
  sectorGroup.name = `Sector ${sector.id}`;
  parent.add(sectorGroup);
  sectorGroup.matrixAutoUpdate = false;
  sectorGroup.updateMatrixWorld(true);

  sectorNodeMap.set(sector.id, sectorGroup);
  for (const child of sector.children) {
    buildScene(child, sectorGroup, sectorNodeMap, modelMatrix);
  }
}
