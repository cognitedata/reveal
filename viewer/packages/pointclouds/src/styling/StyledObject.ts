/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './shapes/IShape';
import { IRawShape } from './shapes/IRawShape';

import { fromRawShape } from './shapes/fromRawShape';

export type RawStyledObject = {
  objectId: number;
  shape: IRawShape;
};

export type StyledObject = {
  objectId: number;
  shape: IShape;
};

export function rawToStyleObject(obj: RawStyledObject): StyledObject {
  return {
    objectId: obj.objectId,
    shape: fromRawShape(obj.shape)
  };
}
