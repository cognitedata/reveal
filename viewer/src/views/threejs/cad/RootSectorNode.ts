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
import { Lod } from '../../../rxjs';

function setVisible(group: THREE.Group, visible: boolean) {
  for (const child of group.children) {
    child.visible = visible;
  }
}

export class RootSectorNode extends SectorNode {
  public readonly sectorNodeMap: Map<number, SectorNode>;
  public readonly shading: Shading;
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

    // TODO consider if this logic could be handled in the RxJS pipeline instead
    if (sectorNode.visible === false && sectorNode.lod === Lod.Detailed) {
      sectorNode.visible = true;
      setVisible(sectorNode.group!, true);
      return;
    }

    const metadata = findSectorMetadata(this.rootSectorMetadata, sectorId);
    const obj = consumeSectorDetailed(sectorId, sector, metadata, this.shading.materials);
    sectorNode.lod = Lod.Detailed;
    sectorNode.visible = true;
    sectorNode.group = obj;
    sectorNode.add(obj);
  }

  consumeSimple(sectorId: number, sector: SectorQuads) {
    const sectorNode = this.sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    // TODO consider if this logic could be handled in the RxJS pipeline instead
    if (sectorNode.visible === false && sectorNode.lod === Lod.Simple) {
      sectorNode.visible = true;
      setVisible(sectorNode.group!, true);
      return;
    }

    const metadata = findSectorMetadata(this.rootSectorMetadata, sectorId);
    const obj = consumeSectorSimple(sectorId, sector, metadata, this.shading.materials);
    sectorNode.lod = Lod.Simple;
    sectorNode.visible = true;
    sectorNode.group = obj;
    sectorNode.add(obj);
  }

  discard(sectorId: number) {
    const sectorNode = this.sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    sectorNode.group = undefined;
    sectorNode.lod = Lod.Discarded;
    sectorNode.visible = false;
    discardSector(sectorId, sectorNode);
  }

  hide(sectorId: number) {
    const sectorNode = this.sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    sectorNode.visible = false;
    if (sectorNode.group) {
      setVisible(sectorNode.group, false);
    }
  }
}
