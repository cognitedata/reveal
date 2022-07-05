/*!
 * Copyright 2022 Cognite AS
 */

import { RawStylableObject, stylableObjectToRaw } from './StylableObject';
import { PointCloudObjectAnnotation } from '../annotationTypes';

export class PointCloudObjectProvider {
  private readonly _annotations: PointCloudObjectAnnotation[];

  constructor(annotations: PointCloudObjectAnnotation[]) {
    this._annotations = annotations;
  }

  createRawObjectArray(): RawStylableObject[] {
    return this._annotations.map(annotation => stylableObjectToRaw(annotation.stylableObject));
  }

  createAnnotationIdToObjectIdMap(): Map<number, number> {
    return new Map<number, number>(
      this._annotations.map(annotation => [annotation.annotationId, annotation.stylableObject.objectId])
    );
  }

  get annotations(): PointCloudObjectAnnotation[] {
    return this._annotations;
  }
}
