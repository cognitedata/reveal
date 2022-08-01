/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './shapes/IShape';
import { IRawShape } from './shapes/IRawShape';

import { fromRawShape } from './shapes/fromRawShape';

export type RawStylableObject = {
  objectId: number;
  shape: IRawShape;
};

export type StylableObject = {
  objectId: number;
  shape: IShape;
};

export function rawToStylableObject(obj: RawStylableObject): StylableObject {
  return {
    objectId: obj.objectId,
    shape: fromRawShape(obj.shape)
  };
}

export function stylableObjectToRaw(obj: StylableObject): RawStylableObject {
  return {
    objectId: obj.objectId,
    shape: obj.shape.toRawShape()
  };
}
