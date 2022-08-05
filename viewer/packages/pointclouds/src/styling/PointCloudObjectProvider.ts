/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, stylableObjectToRaw } from './StylableObject';
import { PointCloudObjectAnnotation } from '../annotationTypes';

export type ObjectsMaps = {
  annotationToObjectIds: Map<number, number>;
  objectToAnnotationIds: Map<number, number>;
};

export class PointCloudObjectProvider {
  private readonly _annotations: PointCloudObjectAnnotation[];

  constructor(annotations: PointCloudObjectAnnotation[]) {
    this._annotations = annotations;
  }

  createRawObjectArray(): RawStylableObject[] {
    return this._annotations.map(annotation => stylableObjectToRaw(annotation.stylableObject));
  }

  createObjectsMaps(): ObjectsMaps {
    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>(
        this._annotations.map(annotation => [annotation.annotationId, annotation.stylableObject.objectId])
      ),
      objectToAnnotationIds: new Map<number, number>(
        this._annotations.map(annotation => [annotation.stylableObject.objectId, annotation.annotationId])
      )
    };

    return objectsMaps;
  }

  get annotations(): PointCloudObjectAnnotation[] {
    return this._annotations;
  }
}
