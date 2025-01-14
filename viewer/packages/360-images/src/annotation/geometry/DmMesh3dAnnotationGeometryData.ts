/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Float32BufferAttribute, Matrix4, Uint32BufferAttribute, Vector3 } from 'three';

import { ImageAnnotationObjectGeometryData } from './ImageAnnotationGeometryData';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@reveal/utilities';
import { createTriangleIndexesFromVectors } from './createTriangleIndexesFromVectors';

export class DmMesh3dAnnotationGeometryData implements ImageAnnotationObjectGeometryData {
  private readonly _geometry: BufferGeometry;
  private readonly _outlinePoints: Vector3[];
  private readonly _inverseVisualizationBoxTransform: Matrix4;

  constructor(positions: Vector3[], visualizationBoxTransform: Matrix4) {
    this._geometry = this.createGeometry(positions);
    this._outlinePoints = positions;

    this._inverseVisualizationBoxTransform = new Matrix4().extractRotation(visualizationBoxTransform).invert();
  }

  createGeometry(points: Vector3[]): BufferGeometry {
    const positions: number[] = [];
    points.forEach(position => {
      position.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      positions.push(...position);
    });

    const indices = createTriangleIndexesFromVectors(points);

    const geometry = new BufferGeometry();

    if (indices === undefined) {
      return geometry;
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setIndex(new Uint32BufferAttribute(indices, 1));

    return geometry;
  }

  getGeometry(): BufferGeometry {
    return this._geometry;
  }

  getNormalizationMatrix(): Matrix4 {
    return this._inverseVisualizationBoxTransform;
  }

  getOutlinePoints(): Vector3[] {
    return this._outlinePoints;
  }
}
