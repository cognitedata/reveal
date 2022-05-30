/*!
 * Copyright 2022 Cognite AS
 */

import { IRawShape } from './IRawShape';

import { Vec3 } from './linalg';

export interface IShape {
  containsPoint(point: Vec3): boolean;

  toRawShape(): IRawShape;
}
