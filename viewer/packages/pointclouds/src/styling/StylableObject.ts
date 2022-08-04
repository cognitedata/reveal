/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './shapes/IShape';
import { IRawShape } from './shapes/IRawShape';

import { fromRawShape } from './shapes/fromRawShape';
import { CompositeShape } from './shapes/CompositeShape';

import * as THREE from 'three';

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

export type RawStylableObjectWithBox = {
  object: RawStylableObject;
  box: THREE.Box3;
};

export function stylableObjectsToRawDecomposedWithBoxes(objects: StylableObject[]): RawStylableObjectWithBox[] {

  const res = new Array<RawStylableObjectWithBox>();

  for (const obj of objects) {
    const shape = obj.shape;
    if (shape instanceof CompositeShape) {
      const innerStylableObjects = shape.getInnerShapes().map(shape => ({ objectId: obj.objectId, shape }));
      res.push(...stylableObjectsToRawDecomposedWithBoxes(innerStylableObjects));
    } else {
      res.push({ object: { objectId: obj.objectId, shape: shape.toRawShape() },
                 box: shape.createBoundingBox() });
    }
  }

  return res;
}
