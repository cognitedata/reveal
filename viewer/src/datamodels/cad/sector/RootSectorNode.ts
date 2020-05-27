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
  }
}

function buildScene(sector: SectorMetadata, parent: SectorNode, sectorNodeMap: Map<number, SectorNode>) {
  const sectorGroup = new SectorNode(sector.id, sector.path);
  sectorGroup.name = `Sector ${sector.id}`;
  parent.add(sectorGroup);
  sectorNodeMap.set(sector.id, sectorGroup);
  for (const child of sector.children) {
    buildScene(child, sectorGroup, sectorNodeMap);
  }
}
