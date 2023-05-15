/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Matrix4, Shape, ShapeGeometry } from 'three';

import { AnnotationsPolygon } from '@cognite/sdk';

import { ImageAnnotationObjectData } from './ImageAnnotationData';

export class PolygonAnnotationData implements ImageAnnotationObjectData {
  private readonly _geometry: ShapeGeometry;

  constructor(polygon: AnnotationsPolygon) {
    this._geometry = this.createGeometry(polygon);
  }

  createGeometry(polygon: AnnotationsPolygon): ShapeGeometry {
    const points = polygon.vertices.map(({ x, y }) => ({ x: 0.5 - x, y: 0.5 - y }));

    const polygonShape = new Shape();

    polygonShape.moveTo(points[0].x, points[0].y);
    points.forEach((v, ind) => {
      if (ind === 0) return;
      polygonShape.lineTo(v.x, v.y);
    });

    return new ShapeGeometry(polygonShape);
  }

  getGeometry(): BufferGeometry {
    return this._geometry;
  }

  getNormalizationMatrix(): Matrix4 {
    return new Matrix4().makeTranslation(0, 0, 0.5);
  }
}
