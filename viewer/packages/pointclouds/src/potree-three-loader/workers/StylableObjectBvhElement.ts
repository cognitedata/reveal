/*!
 * Copyright 2022 Cognite AS
 */

import { BvhElement } from '../../bvh/BvhElement';
import { StylableObject } from '../../styling/StylableObject';

import * as THREE from 'three';

export class StylableObjectBvhElement implements BvhElement {
  private readonly _box: THREE.Box3;
  private readonly _stylableObject: StylableObject;

  constructor(stylableObject: StylableObject) {
    this._stylableObject = stylableObject;
    this._box = stylableObject.shape.createBoundingBox();
  }

  get stylableObject(): StylableObject {
    return this._stylableObject;
  }

  getBox(): THREE.Box3 {
    return this._box;
  }
}
