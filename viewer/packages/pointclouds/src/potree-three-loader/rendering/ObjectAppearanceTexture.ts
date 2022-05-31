/*!
 * Copyright 2022 Cognite AS
 */

import { generateDataTexture } from './texture-generation';

import * as THREE from 'three';
import { StyledPointCloudObjectCollection } from '../../styling/StyledPointCloudObjectCollection';
import { PointCloudObjectCollection } from '../../styling/PointCloudObjectCollection';
import { DefaultPointCloudAppearance, PointCloudAppearance } from '../../styling/PointCloudAppearance';

export class ObjectAppearanceTexture {
  private _objectStyleTexture: THREE.DataTexture;
  private _needsReconstruction: boolean = true;

  private readonly _styledObjectSets: StyledPointCloudObjectCollection[] = [];

  private _defaultAppearance: PointCloudAppearance = { ...DefaultPointCloudAppearance };

  private readonly _width: number;
  private readonly _height: number;

  constructor(width: number, height: number) {
    this._objectStyleTexture = generateDataTexture(width, height, new THREE.Color(0x01000000)); // Initialize with visibility bit set

    this._width = width;
    this._height = height;
  }

  private appearanceToRgba(appearance: PointCloudAppearance): [number, number, number, number] {
    const alpha = appearance.visible ? 1 << 0 : 0;
    return [appearance.color[0], appearance.color[1], appearance.color[2], alpha];
  }

  private setObjectStyle(objectId: number, appearance: PointCloudAppearance): void {
    const data = this._objectStyleTexture.image.data;

    const styleData = this.appearanceToRgba(appearance);
    data.set(styleData, 4 * objectId);
  }

  private setObjectCollectionStyle(styledObjectSet: StyledPointCloudObjectCollection): void {
    for (const objId of styledObjectSet.objectCollection.getObjectIds()) {
      this.setObjectStyle(objId, styledObjectSet.style);
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

  set defaultAppearance(appearance: PointCloudAppearance) {
    this._defaultAppearance = { ...appearance };
    this._needsReconstruction = true;
  }

  get defaultAppearance(): PointCloudAppearance {
    return this._defaultAppearance;
  }

  get objectStyleTexture(): THREE.DataTexture {
    return this._objectStyleTexture;
  }
}
