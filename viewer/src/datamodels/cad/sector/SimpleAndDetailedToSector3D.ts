/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '../CadMaterialManager';
import { InstancedMeshFile, SectorQuads } from '../rendering/types';

import { SectorGeometry, SectorMetadata } from './types';

import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';
import { toThreeJsBox3 } from '../../../utilities';
import { AutoDisposeGroup } from '../../../utilities/three';
import assert from 'assert';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: CadMaterialManager;

  constructor(materialManager: CadMaterialManager) {
    this.materialManager = materialManager;
  }

  transformSimpleSector(
    modelBlobUrl: string,
    sector: SectorMetadata,
    geometry: SectorQuads,
    geometryClipBox: THREE.Box3 | null
  ): Promise<{ sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }> {
    const materials = this.materialManager.getModelMaterials(modelBlobUrl);
    assert(materials !== undefined, `Could not find materials for model '${modelBlobUrl}`);
    return Promise.resolve(consumeSectorSimple(geometry, toThreeJsBox3(new THREE.Box3(), sector.bounds), materials!, geometryClipBox));
  }

  transformDetailedSector(
    modelBlobUrl: string,
    sector: SectorMetadata,
    geometry: SectorGeometry,
    geometryClipBox: THREE.Box3 | null
  ): Promise<{ sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }> {
    const materials = this.materialManager.getModelMaterials(modelBlobUrl);
    assert(materials !== undefined, `Could not find materials for model '${modelBlobUrl}`);
    return Promise.resolve(consumeSectorDetailed(geometry, sector, materials!, geometryClipBox));
  }
}
