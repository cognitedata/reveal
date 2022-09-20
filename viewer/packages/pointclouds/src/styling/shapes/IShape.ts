/*!
 * Copyright 2022 Cognite AS
 */

export enum ShapeType {
  Box,
  Cylinder,
  Composite
}

export interface IShape {
  readonly shapeType: ShapeType;
}
