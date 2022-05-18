/*!
 * Copyright 2022 Cognite AS
 */

export type ShapeType = 'cylinder' | 'box' | 'composite';

export interface IRawShape {
  type: ShapeType;
}
