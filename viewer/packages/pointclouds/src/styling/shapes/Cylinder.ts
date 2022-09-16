/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';

import { Vec3 } from './linalg';

export type Cylinder = IShape & {
  centerA: Vec3;
  centerB: Vec3;
  radius: number;
};
