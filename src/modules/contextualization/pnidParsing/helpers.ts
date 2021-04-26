import { Vertices } from './types';

export const verticesToBoundingBox = (
  vertices: Vertices
): { xMin: number; yMin: number; xMax: number; yMax: number } => {
  let xMin = 0;
  let yMin = 0;
  let yMax = 0;
  let xMax = 0;
  // if it is a rectangle
  if (vertices.length === 4) {
    xMin = vertices[0].x;
    yMin = vertices[0].y;
    xMax = vertices[2].x;
    yMax = vertices[2].y;
  }
  return { xMin, yMin, xMax, yMax };
};
