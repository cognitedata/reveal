import { Vertex } from 'src/api/vision/detectionModels/types';

export function vertexIsNormalized(vertex: Vertex) {
  return vertex.x >= 0 && vertex.x <= 1 && vertex.y >= 0 && vertex.y <= 1;
}

export function uniqueVertices(vertices: Vertex[]) {
  const uniqueVerticesList = [
    ...new Map(
      vertices.map((vertex) => [[vertex.x, vertex.y].join('|'), vertex])
    ).values(),
  ];

  return uniqueVerticesList.length === vertices.length;
}
