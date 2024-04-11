/*!
 * Copyright 2022 Cognite AS
 */

import { ISerializableShape } from './ISerializableShape';

import { Box3 } from 'three';

export type IShape = {
  getSerializableShape(): ISerializableShape;
  createBoundingBox(): Box3;
};
