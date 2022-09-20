/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';
import { Mat4 } from './linalg';

export type Box = IShape & {
  readonly invMatrix: Mat4;
};
