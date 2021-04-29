/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadModelMetadata, SectorMetadata } from '..';
import { traverseDepthFirst } from '../../../utilities/objectTraversal';
import { fromThreeJsBox3, toThreeJsBox3 } from '../../../utilities/threeConverters';
import { SectorSceneImpl } from './SectorScene';

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
    traverseDepthFirst(newRoot, x => {
      sectorMap.set(x.id, x);
      return true;
    });
    const clippedScene = new SectorSceneImpl(
      model.scene.version,
      model.scene.maxTreeIndex,
      model.scene.unit,
      newRoot,
      sectorMap
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
  const originalBounds = toThreeJsBox3(new THREE.Box3(), sector.bounds);
  const bounds = originalBounds.clone();
  bounds.intersect(geometryClipBox);

  if (!bounds.isEmpty()) {
    const intersectingChildren: SectorMetadata[] = [];
    for (let i = 0; i < sector.children.length; i++) {
      const child = clipSector(sector.children[i], geometryClipBox);
      if (child !== undefined) {
        intersectingChildren.push(child);
      }
    }
    // Determine how much of the sector is kept
    const keptRatio = determineVolume(bounds) / determineVolume(originalBounds);

    // Keep
    const clippedSector: SectorMetadata = {
      ...sector,
      children: intersectingChildren,
      estimatedDrawCallCount: Math.ceil(keptRatio * sector.estimatedDrawCallCount),
      bounds: fromThreeJsBox3(bounds)
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
