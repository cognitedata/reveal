/*!
 * Copyright 2023 Cognite AS
 */

import { ImageAnnotationObjectData } from './ImageAnnotationData';

import { BufferGeometry, Matrix4, PlaneGeometry } from 'three';

import { AnnotationsBoundingBox } from '@cognite/sdk';

export class BoxAnnotationData implements ImageAnnotationObjectData {
  private readonly _geometry: PlaneGeometry;
  private readonly _initialTranslation: Matrix4;

  constructor(annotationsBox: AnnotationsBoundingBox) {
    this._geometry = this.createGeometry(annotationsBox);

    this._initialTranslation = new Matrix4().makeTranslation(
      0.5 - (annotationsBox.xMax + annotationsBox.xMin) / 2,
      0.5 - (annotationsBox.yMax + annotationsBox.yMin) / 2,
      0.5
    );
  }

  createGeometry(annotationsBox: AnnotationsBoundingBox): PlaneGeometry {
    return new PlaneGeometry(annotationsBox.xMax - annotationsBox.xMin, annotationsBox.yMax - annotationsBox.yMin);
  }

  getGeometry(): BufferGeometry {
    return this._geometry;
  }

  getNormalizationMatrix(): Matrix4 {
    return this._initialTranslation;
  }
}
