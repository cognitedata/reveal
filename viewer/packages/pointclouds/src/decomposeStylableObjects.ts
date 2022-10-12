/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '@reveal/data-providers';
import { CompositeShape } from '@reveal/utilities';

export function decomposeStylableObjects(stylableObjects: StylableObject[]): StylableObject[] {
  const result = Array<StylableObject>();
  for (const obj of stylableObjects) {
    if (obj.shape instanceof CompositeShape) {
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
