/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { BucketGrid2D } from './BucketGrid2D';

describe('BucketGrid2D', () => {
  let dimensions: THREE.Vector2;
  let bounds: THREE.Box2;
  let grid: BucketGrid2D<number>;
  let cellBounds: (i: number, j: number) => THREE.Box2;

  beforeEach(() => {
    dimensions = new THREE.Vector2(2, 2);
    bounds = new THREE.Box2(new THREE.Vector2(0, 0), new THREE.Vector2(1, 1));
    grid = new BucketGrid2D<number>(dimensions, bounds);

    cellBounds = (i, j) => {
      // Create box that is just inside the bounds of the cell
      const cellSize = new THREE.Vector2(1.0 / dimensions.width, 1.0 / dimensions.height);
      return new THREE.Box2(
        new THREE.Vector2(1.0001 * cellSize.x * i, 1.0001 * cellSize.y * j),
        new THREE.Vector2(0.9999 * cellSize.x * (i + 1), 0.9999 * cellSize.y * (j + 1))
      );
    };
  });

  test('overlappingElements() fully outside bounds returns empty', () => {
    const outsideBounds = createBounds([2, 2], [3, 3]);
    expect(Array.from(grid.overlappingElements(outsideBounds))).toBeEmpty();
  });

  test('overlappingElements() partially outside bounds does not throw', () => {
    const bounds = createBounds([0.6, 0.6], [1.1, 0.7]);
    expect(() => Array.from(grid.overlappingElements(bounds))).not.toThrowError();
  });

  test('insert element that only overlaps one cell, is only in correct cell', () => {
    const bounds = createBounds([0.1, 0.1], [0.2, 0.2]);
    grid.insert(bounds, 0);

    expect(Array.from(grid.overlappingElements(cellBounds(0, 0)))).toEqual([0]);
    expect(Array.from(grid.overlappingElements(cellBounds(1, 0)))).toBeEmpty();
    expect(Array.from(grid.overlappingElements(cellBounds(1, 1)))).toBeEmpty();
    expect(Array.from(grid.overlappingElements(cellBounds(0, 1)))).toBeEmpty();
  });

  test('insert element that overlaps two cells, is in both cells', () => {
    const bounds = createBounds([0.1, 0.1], [0.7, 0.2]);
    grid.insert(bounds, 0);

    expect(Array.from(grid.overlappingElements(cellBounds(0, 0)))).toEqual([0]);
    expect(Array.from(grid.overlappingElements(cellBounds(1, 0)))).toEqual([0]);
    expect(Array.from(grid.overlappingElements(cellBounds(1, 1)))).toBeEmpty();
    expect(Array.from(grid.overlappingElements(cellBounds(0, 1)))).toBeEmpty();
    // Ensure element only is returned once when we query for elements for  the entire grid
    expect(Array.from(grid.overlappingElements(bounds))).toEqual([0]);
  });

  test('overlappingElements() only includes actually overlapping elements', () => {
    grid.insert(createBounds([0.1, 0.1], [0.2, 0.2]), 0);
    grid.insert(createBounds([0.3, 0.3], [0.4, 0.4]), 1);
    expect(Array.from(grid.overlappingElements(createBounds([0.25, 0.25], [0.35, 0.35])))).toEqual([1]);
  });
});

function createBounds(min: [x: number, y: number], max: [x: number, y: number]): THREE.Box2 {
  return new THREE.Box2(new THREE.Vector2(min[0], min[1]), new THREE.Vector2(max[0], max[1]));
}
