/*!
 * Copyright 2023 Cognite AS
 */

import { ImageAnnotationObjectData } from './ImageAnnotationData';

import { BufferGeometry, Matrix4, PlaneGeometry } from 'three';

import { AnnotationsObjectDetection } from '@cognite/sdk';

export class BoxAnnotationData implements ImageAnnotationObjectData {
  private readonly _geometry: PlaneGeometry;
  private readonly _initialTranslation: Matrix4;

  constructor(annotation: AnnotationsObjectDetection) {
    this._geometry = this.createGeometry(annotation);

    const abox = annotation.boundingBox!;

    this._initialTranslation = new Matrix4().makeTranslation(
      0.5 - (abox.xMax + abox.xMin) / 2,
      0.5 - (abox.yMax + abox.yMin) / 2,
      0.5
    );
  }

  createGeometry(annotation: AnnotationsObjectDetection): PlaneGeometry {
    const abox = annotation.boundingBox!;
    return new PlaneGeometry(abox.xMax - abox.xMin, abox.yMax - abox.yMin);
  }

  getGeometry(): BufferGeometry {
    return this._geometry;
  }

  getNormalizationMatrix(): Matrix4 {
    return this._initialTranslation;
  }
}
