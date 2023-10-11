import { BufferAttribute, BufferGeometry, LineSegments } from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';

export const createLineSegmentsGeometry = (
  vertices: Array<number>,
  indices: Array<number>
): LineSegmentsGeometry => {
  // Convert indexed lines to lines only
  const allVertices: Array<number> = [];
  for (let i = 0; i < indices.length; i++) {
    const index = 3 * indices[i];
    allVertices.push(vertices[index], vertices[index + 1], vertices[index + 2]);
  }
  // Create and configure the BufferGeometry for the cylinder
  const verticesArray = new Float32Array(allVertices);
  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
  const lineSegments = new LineSegments(geometry);
  const lineSegmentsGeometry = new LineSegmentsGeometry().fromLineSegments(
    lineSegments
  );
  return lineSegmentsGeometry;
};
