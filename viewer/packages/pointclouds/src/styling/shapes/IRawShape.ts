/*!
 * Copyright 2022 Cognite AS
 */

export type ShapeType = 'cylinder' | 'aabb' | 'composite';

export interface IRawShape {
  type: ShapeType;
};
