/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './shapes/IShape';
import { StylableObject } from './StylableObject';
import { CompositeShape } from './shapes/CompositeShape';

export function decomposeStylableObjects(stylableObjects: StylableObject[]): StylableObject[] {
  const result = Array<StylableObject>();
  for (const obj of stylableObjects) {
    if (obj.shape.shapeType === ShapeType.Composite) {
      const composite = obj.shape as CompositeShape;
      const innerObjectsList: StylableObject[] = composite.innerShapes.map(shape => ({
        shape: shape,
        objectId: obj.objectId
      }));
      result.push(...decomposeStylableObjects(innerObjectsList));
    } else {
      result.push(obj);
    }
  }

  return result;
}
