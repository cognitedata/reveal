/*!
 * Copyright 2022 Cognite AS
 */

import { generateDataTexture } from './texture-generation';

import * as THREE from 'three';
import {
  StyledPointCloudObjectCollection,
  PointCloudObjectCollection,
  DefaultPointCloudAppearance,
  CompletePointCloudAppearance
} from '@reveal/pointcloud-styling';
import { PointCloudObjectIdMaps } from './PointCloudObjectIdMaps';

export class PointCloudObjectAppearanceTexture {
  private readonly _objectStyleTexture: THREE.DataTexture;
  private _needsReconstruction: boolean = true;

  private readonly _styledObjectSets: StyledPointCloudObjectCollection[] = [];

  private _defaultAppearance: CompletePointCloudAppearance = { ...DefaultPointCloudAppearance };

  private readonly _width: number;
  private readonly _height: number;

  private _annotationIdsToObjectId: Map<number, number> | undefined;

  constructor(width: number, height: number) {
    this._objectStyleTexture = generateDataTexture(width, height, new THREE.Color(0x0), 0x01); // Initialize with visibility bit set

    this._width = width;
    this._height = height;
  }

  setObjectsMaps(objectsMaps: PointCloudObjectIdMaps): void {
    this._annotationIdsToObjectId = objectsMaps.annotationToObjectIds;
  }

  private appearanceToRgba(appearance: CompletePointCloudAppearance): [number, number, number, number] {
    const realAppearance = { ...DefaultPointCloudAppearance, ...appearance };
    const alpha = appearance.visible ? 1 << 0 : 0;
    const colorBytes = realAppearance.color.toArray().map(c => Math.round(c * 255)) as [number, number, number];
    return [...colorBytes, alpha];
  }

  private setObjectStyle(objectId: number, appearance: CompletePointCloudAppearance): void {
    const data = this._objectStyleTexture.image.data;

    const styleData = this.appearanceToRgba(appearance);
    data.set(styleData, 4 * objectId);
  }

  private setObjectCollectionStyle(styledObjectSet: StyledPointCloudObjectCollection): void {
    if (!this._annotationIdsToObjectId) {
      throw new Error('Annotation ID to Object ID map not initialized');
    }

    for (const annotationId of styledObjectSet.objectCollection.getAnnotationIds()) {
      const objectId = this._annotationIdsToObjectId.get(annotationId);

      if (objectId === undefined) {
        throw new Error('Could not find corresponding object ID for annotation ID' + annotationId);
      }

      this.setObjectStyle(objectId, styledObjectSet.style);
    }
  }

  private resetTexture(): void {
    const styleData = this.appearanceToRgba(this._defaultAppearance);

    for (let i = 0; i < this._width * this._height; i++) {
      this._objectStyleTexture.image.data.set(styleData, 4 * i);
    }
  }

  onBeforeRender(): void {
    if (this._needsReconstruction) {
      this.resetTexture();
      for (const styledCollection of this._styledObjectSets) {
        this.setObjectCollectionStyle(styledCollection);
      }

      this._objectStyleTexture.needsUpdate = true;
      this._needsReconstruction = false;
    }
  }

  assignStyledObjectSet(styledCollection: StyledPointCloudObjectCollection): void {
    const ind = this._styledObjectSets.findIndex(s => s.objectCollection === styledCollection.objectCollection);

    if (ind !== -1) {
      this._styledObjectSets[ind].style = styledCollection.style;
    } else {
      this._styledObjectSets.push(styledCollection);
    }

    this._needsReconstruction = true;
  }

  removeStyledObjectSet(collection: PointCloudObjectCollection): void {
    const ind = this._styledObjectSets.findIndex(s => s.objectCollection === collection);
    if (ind !== -1) {
      this._styledObjectSets.splice(ind, 1);
    }

    this._needsReconstruction = true;
  }

  removeAllStyledObjectSets(): void {
    this._styledObjectSets.splice(0);
    this._needsReconstruction = true;
  }

  set defaultAppearance(appearance: CompletePointCloudAppearance) {
    this._defaultAppearance = { ...appearance };
    this._needsReconstruction = true;
  }

  get defaultAppearance(): CompletePointCloudAppearance {
    return this._defaultAppearance;
  }

  get objectStyleTexture(): THREE.DataTexture {
    return this._objectStyleTexture;
  }
}
