/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads, SectorMetadata } from '../../../models/cad/types';
import { buildScene } from './buildScene';
import { SectorNode } from './SectorNode';
import { toThreeMatrix4 } from '../utilities';
import { CadModel } from '../../../models/cad/CadModel';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { consumeSectorSimple } from './consumeSectorSimple';
import { findSectorMetadata } from '../../../models/cad/findSectorMetadata';
import { discardSector } from './discardSector';
import { Shading } from './shading';

export class RootSectorNode extends SectorNode {
  private readonly sectorNodeMap: Map<number, SectorNode>;
  private readonly shading: Shading;
  private readonly rootSectorMetadata: SectorMetadata;

  constructor(model: CadModel, shading: Shading) {
    super(0, '/');
    const { scene, modelTransformation } = model;
    this.applyMatrix4(toThreeMatrix4(modelTransformation.modelMatrix));
    this.sectorNodeMap = new Map();
    this.rootSectorMetadata = scene.root;
    this.shading = shading;

    buildScene(scene.root, this, this.sectorNodeMap);
  }

  consumeDetailed(sectorId: number, sector: Sector) {
    const sectorNode = this.sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    const metadata = findSectorMetadata(this.rootSectorMetadata, sectorId);
    consumeSectorDetailed(sectorId, sector, metadata, sectorNode, this.shading.materials);
  }

  consumeSimple(sectorId: number, sector: SectorQuads) {
    const sectorNode = this.sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    const metadata = findSectorMetadata(this.rootSectorMetadata, sectorId);
    consumeSectorSimple(sectorId, sector, metadata, sectorNode, this.shading.materials);
  }

  discard(sectorId: number) {
    const sectorNode = this.sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    discardSector(sectorId, sectorNode);
  }
}
