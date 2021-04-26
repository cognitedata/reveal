/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '../CadMaterialManager';
import { InstancedMeshFile, SectorQuads } from '../rendering/types';

import { SectorGeometry, ParsedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';
import { assertNever, toThreeJsBox3 } from '../../../utilities';
import { AutoDisposeGroup } from '../../../utilities/three';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: CadMaterialManager;

  constructor(materialManager: CadMaterialManager) {
    this.materialManager = materialManager;
  }

  transformSector(
    parsedSector: ParsedSector,
    geometryClipBox: THREE.Box3 | null
  ): { sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] } {
    switch (parsedSector.levelOfDetail) {
      case LevelOfDetail.Detailed:
        return consumeSectorDetailed(
          parsedSector.data as SectorGeometry,
          parsedSector.metadata,
          this.materialManager.getModelMaterials(parsedSector.blobUrl)!,
          geometryClipBox
        );

      case LevelOfDetail.Simple:
        return consumeSectorSimple(
          parsedSector.data as SectorQuads,
          toThreeJsBox3(new THREE.Box3(), parsedSector.metadata.bounds),
          this.materialManager.getModelMaterials(parsedSector.blobUrl)!,
          geometryClipBox
        );

      case LevelOfDetail.Discarded:
        throw new Error('Cannot transform discarded sector');

      default:
        assertNever(parsedSector.levelOfDetail);
    }
  }
}
