/*!
 * Copyright 2020 Cognite AS
 */

import { SectorNode } from './SectorNode';
import { toThreeMatrix4 } from '@/utilities';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { SectorMetadata } from './types';

export class RootSectorNode extends SectorNode {
  public readonly sectorNodeMap: Map<number, SectorNode>;

  constructor(modelMetadata: CadModelMetadata) {
    super(0, '/');
    const { scene, modelTransformation } = modelMetadata;
    this.applyMatrix4(toThreeMatrix4(modelTransformation.modelMatrix));
    this.sectorNodeMap = new Map();
    buildScene(scene.root, this, this.sectorNodeMap);

    // Disable automatic update of matrices of the subtree as it
    // is quite time consuming. We trust that our owner keeps
    // our matrices updated.
    this.matrixAutoUpdate = false;
    this.updateMatrixWorld(true);
  }

  forceUpdateMatrixWorld(): void {
    // super.updateMatrixWorld(true);
    this.traverse(x => {
      if (x !== this) {
        x.updateMatrixWorld(true);
      }
    });
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
