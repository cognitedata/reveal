/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadModelMetadata, SectorMetadata, SectorSceneFactory, V8SectorMetadata } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';

export class CadModelClipper {
  private readonly _geometryClipBox: THREE.Box3;

  constructor(geometryClipBox: THREE.Box3) {
    this._geometryClipBox = geometryClipBox;
  }

  createClippedModel(model: CadModelMetadata): CadModelMetadata {
    // Create a clipped sector tree
    const root = model.scene.root;
    const newRoot = clipSector(root, this._geometryClipBox);
    if (newRoot === undefined) {
      throw new Error('No sectors inside provided geometry clip box');
    }

    // Create a new clipped scene
    const sectorMap = new Map<number, SectorMetadata>();
    traverseDepthFirst(newRoot, sector => {
      sectorMap.set(sector.id, sector);
      return true;
    });
    const sectorSceneFactory = new SectorSceneFactory();
    const clippedScene = sectorSceneFactory.createSectorScene(
      model.scene.version,
      model.scene.maxTreeIndex,
      model.scene.unit,
      newRoot
    );

    const clippedCadModel: CadModelMetadata = {
      ...model,
      scene: clippedScene,
      geometryClipBox: this._geometryClipBox.clone()
    };
    return clippedCadModel;
  }
}

function clipSector(sector: SectorMetadata, geometryClipBox: THREE.Box3): SectorMetadata | undefined {
  const originalBounds = sector.bounds;
  const bounds = sector.bounds.clone();
  bounds.intersect(geometryClipBox);

  if (!bounds.isEmpty()) {
    const intersectingChildren: SectorMetadata[] = [];
    for (let i = 0; i < sector.children.length; i++) {
      const child = clipSector(sector.children[i] as V8SectorMetadata, geometryClipBox);
      if (child !== undefined) {
        intersectingChildren.push(child);
      }
    }
    // Determine how much of the sector is kept
    const keptVolumeRatio = determineVolume(bounds) / determineVolume(originalBounds);
    const keptDrawCallsRatio = Math.min(1.0, 1 - 1.0 / (1 + 10 * keptVolumeRatio));

    // Keep
    const clippedSector: SectorMetadata = {
      ...sector,
      children: intersectingChildren,
      estimatedDrawCallCount: Math.ceil(keptDrawCallsRatio * sector.estimatedDrawCallCount),
      estimatedRenderCost: Math.ceil(keptDrawCallsRatio * sector.estimatedRenderCost),
      bounds
    };
    return clippedSector;
  } else {
    // Discard
    return undefined;
  }
}

const determineVolumeVars = {
  size: new THREE.Vector3()
};

function determineVolume(b: THREE.Box3) {
  const { size } = determineVolumeVars;

  b.getSize(size);
  return size.x * size.y * size.z;
}
