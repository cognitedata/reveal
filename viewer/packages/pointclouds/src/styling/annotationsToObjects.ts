/*!
 * Copyright 2022 Cognite AS
 */

import { BoundingVolume } from '../annotationTypes';
import { CompositeShape } from './shapes/CompositeShape';
import { StylableObject } from './StylableObject';
import { StylableObjectInfo } from './StylableObjectInfo';

function annotationsToObjects(bvs: BoundingVolume[]): StylableObject[] {
  let idCounter = 0;

  const resultObjects = bvs.map(bv => {
    idCounter++;

    const shapes = bv.region.map(primitive => primitive.transformToShape());

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: idCounter
    };

    return stylableObject;
  });

  return resultObjects;
}

export function annotationsToObjectInfo(annotations: BoundingVolume[]): StylableObjectInfo {
  const stylableObjects = annotationsToObjects(annotations);

  return {
    stylableObjects: stylableObjects.map(obj => {
      return {
        objectId: obj.objectId,
        shape: obj.shape.toRawShape()
      };
    })
  };
}
