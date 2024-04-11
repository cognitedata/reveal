/*!
 * Copyright 2022 Cognite AS
 */

export enum ShapeType {
  Box,
  Cylinder,
  Composite
}

export type ISerializableShape = {
  readonly shapeType: ShapeType;
};
