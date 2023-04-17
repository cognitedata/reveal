/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Matrix4, Shape, ShapeGeometry } from 'three';

import { AnnotationsObjectDetection } from '@cognite/sdk';

import { ImageAnnotationObjectData } from './ImageAnnotationData';

export class PolygonAnnotationData implements ImageAnnotationObjectData {
  private readonly _geometry: ShapeGeometry;

  constructor(annotation: AnnotationsObjectDetection) {
    this._geometry = this.createGeometry(annotation);
  }

  createGeometry(annotation: AnnotationsObjectDetection): ShapeGeometry {
    const points = annotation.polygon!.vertices.map(({ x, y }) => ({ x: 0.5 - x, y: 0.5 - y }));

    const polygon = new Shape();

    polygon.moveTo(points[0].x, points[0].y);
    points.forEach((v, ind) => {
      if (ind === 0) return;
      polygon.lineTo(v.x, v.y);
    });

    return new ShapeGeometry(polygon);
  }

  getGeometry(): BufferGeometry {
    return this._geometry;
  }

  getNormalizationMatrix(): Matrix4 {
    return new Matrix4().makeTranslation(0, 0, 0.5);
  }
}
