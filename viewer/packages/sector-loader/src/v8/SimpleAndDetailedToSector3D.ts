/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorQuads } from '@cognite/reveal-parser-worker';

import { InstancedMeshFile, SectorGeometry, V8SectorMetadata } from '@reveal/cad-parsers';
import { AutoDisposeGroup } from '@reveal/utilities';
import { CadMaterialManager } from '@reveal/rendering';

import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';
import assert from 'assert';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: CadMaterialManager;

  constructor(materialManager: CadMaterialManager) {
    this.materialManager = materialManager;
  }

  transformSimpleSector(
    modelIdentifier: string,
    sector: V8SectorMetadata,
    geometry: SectorQuads,
    geometryClipBox: THREE.Box3 | null
  ): Promise<{ sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }> {
    const materials = this.materialManager.getModelMaterials(modelIdentifier);
    assert(materials !== undefined, `Could not find materials for model '${modelIdentifier}`);
    return Promise.resolve(consumeSectorSimple(geometry, sector.subtreeBoundingBox, materials!, geometryClipBox));
  }

  transformDetailedSector(
    modelIdentifier: string,
    sector: V8SectorMetadata,
    geometry: SectorGeometry,
    geometryClipBox: THREE.Box3 | null
  ): Promise<{ sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }> {
    const materials = this.materialManager.getModelMaterials(modelIdentifier);
    assert(materials !== undefined, `Could not find materials for model '${modelIdentifier}`);
    return Promise.resolve(consumeSectorDetailed(geometry, sector, materials!, geometryClipBox));
  }
}
