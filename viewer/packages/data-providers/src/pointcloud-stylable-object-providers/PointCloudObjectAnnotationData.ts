/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObject } from './types';

export type PointCloudObjectsMaps = {
  annotationToObjectIds: Map<number, number>;
  objectToAnnotationIds: Map<number, number>;
};

export class PointCloudObjectData {
  private readonly _annotations: PointCloudObject[];

  constructor(annotations: PointCloudObject[]) {
    this._annotations = annotations;
  }

  createObjectsMaps(): PointCloudObjectsMaps {
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

  get annotations(): PointCloudObject[] {
    return this._annotations;
  }
}
