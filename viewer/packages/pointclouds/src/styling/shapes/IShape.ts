/*!
 * Copyright 2022 Cognite AS
 */

import { IRawShape } from './IRawShape';

import * as THREE from 'three';

export interface IShape {
  containsPoint(point: THREE.Vector3): boolean;

  toRawShape(): IRawShape;

  createBoundingBox(): THREE.Box3;
}
