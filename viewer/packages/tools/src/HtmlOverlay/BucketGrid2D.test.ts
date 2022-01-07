/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { BucketGrid2D } from './BucketGrid2D';

describe('BucketGrid2D', () => {
  let dimensions: [number, number];
  let bounds: THREE.Box2;
  let grid: BucketGrid2D<number>;
  let cellBounds: (i: number, j: number) => THREE.Box2;

  beforeEach(() => {
    dimensions = [2, 2];

    bounds = new THREE.Box2(new THREE.Vector2(1, 2), new THREE.Vector2(2, 4));
    grid = new BucketGrid2D<number>(bounds, dimensions);

    cellBounds = (i, j) => {
      // Create box that is just inside the bounds of the cell
      const boundsSize = bounds.getSize(new THREE.Vector2());
      const cellSize = new THREE.Vector2(boundsSize.x / dimensions[0], boundsSize.y / dimensions[1]);
      return new THREE.Box2(
        new THREE.Vector2(bounds.min.x + cellSize.x * i + 1e-4, bounds.min.y + cellSize.y * j + 1e-4),
        new THREE.Vector2(bounds.min.x + cellSize.x * (i + 1) - 1e-4, bounds.min.y + cellSize.y * (j + 1) - 1e-4)
      );
    };
  });

  test('overlappingElements() fully outside bounds returns empty', () => {
    const outsideBounds = createBounds([5, 5], [6, 6]);
    expect(Array.from(grid.overlappingElements(outsideBounds))).toBeEmpty();
  });

  test('overlappingElements() partially outside bounds does not throw', () => {
    const bounds = createBounds([1.6, 2.6], [2.1, 4.7]);
    expect(() => Array.from(grid.overlappingElements(bounds))).not.toThrowError();
  });

  test('insert element that only overlaps one cell, is only in correct cell', () => {
    const bounds = createBounds([1.1, 2.1], [1.2, 2.2]);
    grid.insert(bounds, 0);

    expect(Array.from(grid.overlappingElements(cellBounds(0, 0)))).toEqual([0]);
    expect(Array.from(grid.overlappingElements(cellBounds(1, 0)))).toBeEmpty();
    expect(Array.from(grid.overlappingElements(cellBounds(1, 1)))).toBeEmpty();
    expect(Array.from(grid.overlappingElements(cellBounds(0, 1)))).toBeEmpty();
  });

  test('insert element that overlaps two cells, is in both cells', () => {
    const bounds = createBounds([1.1, 2.1], [1.7, 2.2]);
    grid.insert(bounds, 0);

    expect(Array.from(grid.overlappingElements(cellBounds(0, 0)))).toEqual([0]);
    expect(Array.from(grid.overlappingElements(cellBounds(1, 0)))).toEqual([0]);
    expect(Array.from(grid.overlappingElements(cellBounds(1, 1)))).toBeEmpty();
    expect(Array.from(grid.overlappingElements(cellBounds(0, 1)))).toBeEmpty();
    // Ensure element only is returned once when we query for elements for  the entire grid
    expect(Array.from(grid.overlappingElements(bounds))).toEqual([0]);
  });

  test('overlappingElements() only includes actually overlapping elements', () => {
    grid.insert(createBounds([1.1, 2.1], [1.2, 2.2]), 0);
    grid.insert(createBounds([1.3, 2.3], [1.4, 2.4]), 1);
    expect(Array.from(grid.overlappingElements(createBounds([1.25, 2.25], [1.35, 2.35])))).toEqual([1]);
  });

  test('removeOverlappingElements() removes element from all cells', () => {
    grid.insert(createBounds([1.1, 2.1], [1.9, 2.9]), 0);
    const taken = Array.from(grid.removeOverlappingElements(createBounds([1.1, 2.1], [1.2, 2.2])));
    const remaining = Array.from(grid.overlappingElements(bounds));
    expect(taken).toEqual([0]);
    expect(remaining).toBeEmpty();
  });

  test('add element after removeOverlappingElements() is not supported', () => {
    const elementBounds = createBounds([1.1, 2.1], [1.9, 2.9]);
    const element = 0;
    grid.insert(elementBounds, element);

    Array.from(grid.removeOverlappingElements(createBounds([1.1, 2.1], [1.2, 2.2])));

    expect(() => grid.insert(elementBounds, element)).toThrowError();
  });
});

function createBounds(min: [x: number, y: number], max: [x: number, y: number]): THREE.Box2 {
  return new THREE.Box2(new THREE.Vector2(min[0], min[1]), new THREE.Vector2(max[0], max[1]));
}
