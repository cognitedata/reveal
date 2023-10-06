import { Point } from '../../annotation/types';
import {
  uniqueVertices,
  vertexIsNormalized,
} from '../../vision/detectionModels/typeValidators';

describe('Test vertexIsNormalized', () => {
  test('Invalid vertex', () => {
    const vertex = {} as Point;
    expect(vertexIsNormalized(vertex)).toBe(false);
  });

  test('Partially invalid vertex', () => {
    const vertex = { x: 1 } as Point;
    expect(vertexIsNormalized(vertex)).toBe(false);
  });

  test('Non-normalized vertex', () => {
    const vertex = { x: 1, y: 2 } as Point;
    expect(vertexIsNormalized(vertex)).toBe(false);
  });

  test('Valid vertex', () => {
    const vertex = { x: 1, y: 0 } as Point;
    expect(vertexIsNormalized(vertex)).toBe(true);
  });
});

describe('Test uniqueVertices', () => {
  test('Return true when empty input', () => {
    const vertices = [{}] as Point[];
    expect(uniqueVertices(vertices)).toBe(true);
  });

  test('Return true when single item in list', () => {
    const vertices = [{ x: 1, y: 2 }] as Point[];
    expect(uniqueVertices(vertices)).toBe(true);
  });

  test('Return true when unqiue items', () => {
    const vertices = [
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 3, y: 2 },
    ] as Point[];
    expect(uniqueVertices(vertices)).toBe(true);
  });

  test('Return false when not unique items', () => {
    const vertices = [
      { x: 1, y: 2 },
      { x: 1, y: 2 },
    ] as Point[];
    expect(uniqueVertices(vertices)).toBe(false);
  });
});
