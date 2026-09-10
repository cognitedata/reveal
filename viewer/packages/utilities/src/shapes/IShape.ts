/*!
 * Copyright 2022 Cognite AS
 */

import type { ISerializableShape } from './ISerializableShape';

import type { Box3 } from 'three';

export interface IShape {
  getSerializableShape(): ISerializableShape;
  createBoundingBox(): Box3;
}
