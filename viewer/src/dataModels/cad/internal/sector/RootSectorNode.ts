/*!
 * Copyright 2020 Cognite AS
 */

import { buildScene } from '../buildScene';
import { SectorNode } from './SectorNode';
import { toThreeMatrix4 } from '@/utilities';
import { CadModelMetadata } from '@/datamodels/cad/public/CadModelMetadata';

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
