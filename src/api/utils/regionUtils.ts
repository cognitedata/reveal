import { Point } from 'src/api/annotation/types';

export function vertexIsNormalized(vertex: Point) {
  return vertex.x >= 0 && vertex.x <= 1 && vertex.y >= 0 && vertex.y <= 1;
}

export function uniqueVertices(vertices: Point[]) {
  const uniqueVerticesList = [
    ...new Map(
      vertices.map((vertex) => [[vertex.x, vertex.y].join('|'), vertex])
    ).values(),
  ];

  return uniqueVerticesList.length === vertices.length;
}
