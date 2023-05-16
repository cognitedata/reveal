/*!
 * Copyright 2023 Cognite AS
 */

import { ImageAnnotationObjectData } from './ImageAnnotationData';

import { BufferGeometry, Color, Group, Matrix4, Object3D, PlaneGeometry, Vector2, Vector3 } from 'three';

import { AnnotationsBoundingBox } from '@cognite/sdk';
import { ThickLine } from '@reveal/utilities/src/three/ThickLine';

export class BoxAnnotationData implements ImageAnnotationObjectData {
  private readonly _geometry: PlaneGeometry;
  private readonly _initialTranslation: Matrix4;
  private readonly _outline: Vector2[];

  constructor(annotationsBox: AnnotationsBoundingBox) {
    this._geometry = this.createGeometry(annotationsBox);
    this._outline = getBoundPoints(annotationsBox);

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

  getOutlinePoints(): Vector2[] {
    return this._outline;
  }
}

function getBoundPoints(box: AnnotationsBoundingBox): Vector2[] {
  const span = { x: (box.xMax - box.xMin) / 2, y: (box.yMax - box.yMin) / 2 };
  return [
    new Vector2(-span.x, -span.y),
    new Vector2(-span.x, span.y),
    new Vector2(span.x, span.y),
    new Vector2(span.x, -span.y)
  ];
}
