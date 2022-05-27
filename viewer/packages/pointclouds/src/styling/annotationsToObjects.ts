/*!
 * Copyright 2022 Cognite AS
 */

import { BoundingVolume } from '../annotationTypes';
import { CompositeShape } from './shapes/CompositeShape';
import { StyledObject } from './StyledObject';
import { StyledObjectInfo } from './StyledObjectInfo';

function annotationsToObjects(bvs: BoundingVolume[]): StyledObject[] {
  let idCounter = 0;

  const resultObjects = bvs.map(bv => {
    idCounter++;

    const shapes = bv.region.map(primitive => primitive.transformToShape());

    const compShape = new CompositeShape(shapes);
    const styledObject: StyledObject = {
      shape: compShape,
      objectId: idCounter
    };

    return styledObject;
  });

  return resultObjects;
}

export function annotationsToObjectInfo(annotations: BoundingVolume[]): StyledObjectInfo {
  const styledObjects = annotationsToObjects(annotations);

  return {
    styledObjects: styledObjects.map(obj => {
      return {
        objectId: obj.objectId,
        shape: obj.shape.toRawShape()
      };
    })
  };
}
