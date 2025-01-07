/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Matrix4, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';

import { AnnotationsPolygon } from '@cognite/sdk';

import { ImageAnnotationObjectGeometryData } from './ImageAnnotationGeometryData';
import { convertPointsTo3d } from './utils';

export class PolygonAnnotationGeometryData implements ImageAnnotationObjectGeometryData {
  private readonly _geometry: ShapeGeometry;
  private readonly _outlinePoints: Vector3[];

  constructor(polygon: AnnotationsPolygon) {
    this._geometry = this.createGeometry(polygon);
    this._outlinePoints = getBoundPoints(polygon);
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

  getOutlinePoints(): Vector3[] {
    return this._outlinePoints;
  }
}

function getBoundPoints(polygon: AnnotationsPolygon): Vector3[] {
  return convertPointsTo3d(polygon.vertices.map(v => new Vector2(0.5 - v.x, 0.5 - v.y)));
}
