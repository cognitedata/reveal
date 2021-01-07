/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorNode } from './SectorNode';
import { CadModelMetadata } from '../CadModelMetadata';
import { SectorMetadata } from './types';

export class RootSectorNode extends SectorNode {
  public readonly sectorNodeMap: Map<number, SectorNode>;

  constructor(modelMetadata: CadModelMetadata) {
    super(0, '/');
    const { scene, modelMatrix } = modelMetadata;
    this.sectorNodeMap = new Map();
    buildScene(scene.root, this, this.sectorNodeMap);

    // Disable automatic update of matrices of the subtree as it
    // is quite time consuming. We trust that our owner keeps
    // our matrices updated.
    this.matrixAutoUpdate = false;
    this.setModelTransformation(modelMatrix);
  }

  setModelTransformation(matrix: THREE.Matrix4): void {
    this.matrix.copy(matrix);
    this.updateMatrixWorld(true);
  }

  getModelTransformation(out = new THREE.Matrix4()): THREE.Matrix4 {
    return out.copy(this.matrix);
  }
}

function buildScene(sector: SectorMetadata, parent: SectorNode, sectorNodeMap: Map<number, SectorNode>) {
  const sectorGroup = new SectorNode(sector.id, sector.path);
  sectorGroup.name = `Sector ${sector.id}`;
  parent.add(sectorGroup);
  sectorGroup.matrixAutoUpdate = false;
  sectorGroup.updateMatrixWorld(true);

  sectorNodeMap.set(sector.id, sectorGroup);
  for (const child of sector.children) {
    buildScene(child, sectorGroup, sectorNodeMap);
  }
}
