/*!
 * Copyright 2024 Cognite AS
 */

import { BufferAttribute, BufferGeometry, LineSegments, type Vector3 } from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

export class PrimitiveUtils {
  public static createLineSegmentsAsVertices(vertices: number[], indices: number[]): number[] {
    // Convert indexed lines to lines only
    const allVertices: number[] = [];
    for (let i = 0; i < indices.length; i++) {
      const index = 3 * indices[i];
      allVertices.push(vertices[index], vertices[index + 1], vertices[index + 2]);
    }
    return allVertices;
  }

  public static createLineSegmentsGeometry(vertices: number[]): LineSegmentsGeometry {
    const verticesArray = new Float32Array(vertices);
    const geometry = new BufferGeometry();

    geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
    const lineSegments = new LineSegments(geometry);
    const lineSegmentsGeometry = new LineSegmentsGeometry().fromLineSegments(lineSegments);
    return lineSegmentsGeometry;
  }

  public static createLineSegmentsGeometryByVertices(corners: Vector3[]): LineSegmentsGeometry {
    const buffer = new BufferGeometry().setFromPoints(corners);
    const lineSegments = new LineSegments(buffer);
    return new LineSegmentsGeometry().fromLineSegments(lineSegments);
  }
}
