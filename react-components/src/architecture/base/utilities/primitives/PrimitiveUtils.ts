import { BufferGeometry, Float32BufferAttribute, LineSegments, type Vector3 } from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

export class PrimitiveUtils {
  public static createLineSegmentsAsPositions(positions: number[], indices: number[]): number[] {
    // Convert indexed lines to lines only
    const allVertices: number[] = [];
    for (let i = 0; i < indices.length; i++) {
      const index = 3 * indices[i];
      allVertices.push(positions[index], positions[index + 1], positions[index + 2]);
    }
    return allVertices;
  }

  public static createBufferGeometry(positions: number[]): BufferGeometry {
    const attributes = new Float32BufferAttribute(positions, 3);
    return new BufferGeometry().setAttribute('position', attributes);
  }

  public static createLineSegmentsGeometryByPosition(positions: number[]): LineSegmentsGeometry {
    const geometry = PrimitiveUtils.createBufferGeometry(positions);
    const lineSegments = new LineSegments(geometry);
    return new LineSegmentsGeometry().fromLineSegments(lineSegments);
  }

  public static createLineSegmentsGeometryByVertices(vertices: Vector3[]): LineSegmentsGeometry {
    const geometry = new BufferGeometry().setFromPoints(vertices);
    const lineSegments = new LineSegments(geometry);
    return new LineSegmentsGeometry().fromLineSegments(lineSegments);
  }
}
