/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './shapes/IShape';
import { IRawShape } from './shapes/IRawShape';

import { fromRawShape } from './shapes/fromRawShape';

export type RawStyleObject = {
  objectId: number;
  shape: IRawShape;
};

export type StyleObject = {
  objectId: number;
  shape: IShape;
};

export function rawToStyleObject(obj: RawStyleObject): StyleObject {
  return {
    objectId: obj.objectId,
    shape: fromRawShape(obj.shape)
  };
}
