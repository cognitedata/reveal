/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import range from 'lodash/range';

type SimpleGrid2DElement<T> = {
  bounds: THREE.Box2;
  element: T;
};

/**
 * Data structure that splits a 2D region into cells where each cell can contain zero to many
 * elements. Elements can be stored in several bu
 */
export class BucketGrid2D<T> {
  private readonly _dimensions: THREE.Vector2;
  private readonly _bounds: THREE.Box2;
  private readonly _cells: SimpleGrid2DElement<T>[][];

  constructor(dimensions: THREE.Vector2, bounds: THREE.Box2) {
    this._dimensions = dimensions;
    this._cells = range(0, dimensions.x * dimensions.y).map(() => new Array<SimpleGrid2DElement<T>>());
    this._bounds = bounds;
  }

  insert(bounds: THREE.Box2, element: T) {
    if (!this._bounds.intersectsBox(bounds)) {
      throw new Error('Element to be added must be partially inside grid');
    }

    for (const cell of this.cellsIntersecting(bounds)) {
      cell.push({ bounds, element });
    }
  }

  *overlappingElements(bounds: THREE.Box2): Generator<T> {
    if (!this._bounds.intersectsBox(bounds)) {
      return;
    }

    const visitedElements = new Set<T>();
    for (const cell of this.cellsIntersecting(bounds)) {
      for (const candidateElement of cell) {
        if (!visitedElements.has(candidateElement.element) && bounds.intersectsBox(candidateElement.bounds)) {
          visitedElements.add(candidateElement.element);
          yield candidateElement.element;
        }
      }
    }
  }

  private *cellsIntersecting(bounds: THREE.Box2): Generator<SimpleGrid2DElement<T>[]> {
    const { min, max } = this._bounds;
    const relativeBoundsMinX = (bounds.min.x - min.x) / (max.x - min.x);
    const relativeBoundsMaxX = (bounds.max.x - min.x) / (max.x - min.x);
    const relativeBoundsMinY = (bounds.min.y - min.y) / (max.y - min.y);
    const relativeBoundsMaxY = (bounds.max.y - min.y) / (max.y - min.y);

    const clamp = THREE.MathUtils.clamp;
    const minI = clamp(Math.floor(this._dimensions.x * relativeBoundsMinX), 0, this._dimensions.x - 1);
    const maxI = clamp(Math.floor(this._dimensions.x * relativeBoundsMaxX), 0, this._dimensions.x - 1);
    const minJ = clamp(Math.floor(this._dimensions.y * relativeBoundsMinY), 0, this._dimensions.y - 1);
    const maxJ = clamp(Math.floor(this._dimensions.y * relativeBoundsMaxY), 0, this._dimensions.y - 1);
    for (let j = minJ; j <= maxJ; ++j) {
      for (let i = minI; i <= maxI; ++i) {
        yield this._cells[j * this._dimensions.y + i];
      }
    }
  }
}
