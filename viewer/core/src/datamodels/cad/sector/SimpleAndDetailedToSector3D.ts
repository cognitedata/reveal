/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '../CadMaterialManager';
import { InstancedMeshFile, SectorQuads } from '../rendering/types';

import { SectorGeometry, SectorMetadata } from './types';

import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';
import { AutoDisposeGroup } from '../../../utilities/three';
import assert from 'assert';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: CadMaterialManager;

  constructor(materialManager: CadMaterialManager) {
    this.materialManager = materialManager;
  }

  transformSimpleSector(
    modelIdentifier: string,
    sector: SectorMetadata,
    geometry: SectorQuads,
    geometryClipBox: THREE.Box3 | null
  ): Promise<{ sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }> {
    const materials = this.materialManager.getModelMaterials(modelIdentifier);
    assert(materials !== undefined, `Could not find materials for model '${modelIdentifier}`);
    return Promise.resolve(consumeSectorSimple(geometry, sector.bounds, materials!, geometryClipBox));
  }

  transformDetailedSector(
    modelIdentifier: string,
    sector: SectorMetadata,
    geometry: SectorGeometry,
    geometryClipBox: THREE.Box3 | null
  ): Promise<{ sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }> {
    const materials = this.materialManager.getModelMaterials(modelIdentifier);
    assert(materials !== undefined, `Could not find materials for model '${modelIdentifier}`);
    return Promise.resolve(consumeSectorDetailed(geometry, sector, materials!, geometryClipBox));
  }
}
