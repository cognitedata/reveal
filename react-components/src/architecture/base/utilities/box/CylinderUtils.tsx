/*!
 * Copyright 2024 Cognite AS
 */

import { type LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

import { BufferAttribute, BufferGeometry, CylinderGeometry } from 'three';
import { PrimitiveUtils } from './PrimitiveUtils';

const RADIUS = 0.5;

export class CylinderUtils {
  public static createUnitGeometry(): CylinderGeometry {
    return new CylinderGeometry(RADIUS, RADIUS, 1);
  }

  public static createLineSegmentsGeometry(): LineSegmentsGeometry {
    const vertices = CylinderUtils.createVertices();
    return PrimitiveUtils.createLineSegmentsGeometry(vertices);
  }

  public static createVertices(): number[] {
    // Define cylinder properties
    const segmentsBetweenCircles = 4;
    const totalSegments = segmentsBetweenCircles * 6;
    const angleIncrement = (2 * Math.PI) / totalSegments;

    // Define the vertices for the top and bottom circles of the cylinder
    const vertices: number[] = [];

    // Bottom circle vertices
    for (let i = 0; i <= totalSegments; i++) {
      const angle = i * angleIncrement;
      vertices.push(RADIUS * Math.sin(angle)); // x-coordinate
      vertices.push(RADIUS * Math.cos(angle)); // y-coordinate
      vertices.push(-RADIUS); // z-coordinate (fixed for bottom circle)
    }

    // Top circle vertices
    for (let i = 0; i <= totalSegments; i++) {
      const angle = i * angleIncrement;
      vertices.push(RADIUS * Math.sin(angle)); // x-coordinate
      vertices.push(RADIUS * Math.cos(angle)); // y-coordinate
      vertices.push(RADIUS); // z-coordinate (fixed for top circle)
    }

    // Define the indices to form line segments of the cylinder
    const indices: number[] = [];

    // Indices for the bottom circle
    for (let i = 0; i < totalSegments; i++) {
      indices.push(i, i + 1);
    }
    // Indices for the top circle
    const topCircleOffset = 1 + totalSegments;
    for (let i = 0; i < totalSegments; i++) {
      indices.push(i + topCircleOffset, i + 1 + topCircleOffset);
    }

    // Indices connecting top and bottom circles
    for (let i = 0; i < totalSegments; i += segmentsBetweenCircles) {
      indices.push(i, i + topCircleOffset);
    }
    // This is maybe a silly solution, but I will keep it like this because
    // we may change to indexed BufferGeometry later on.
    return PrimitiveUtils.createLineSegmentsAsVertices(vertices, indices);
  }

  public static createLineSegmentsBufferGeometry(): BufferGeometry {
    const vertices = CylinderUtils.createVertices();
    const verticesArray = new Float32Array(vertices);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
    return geometry;
  }
}
