/*!
 * Copyright 2021 Cognite AS
 */
import range from 'lodash/range';

import { HtmlOverlayTool } from './HtmlOverlayTool';
import { Box2, MathUtils } from 'three';

type SimpleGrid2DElement<T> = {
  bounds: Box2;
  element: T;
};

/**
 * Data structure that splits a 2D region into cells where each cell can contain zero to many
 * elements. Elements can be stored in several cells. This data structure make overlap lookups
 * efficient.
 *
 * Note! This class is tailored for usage with {@link HtmlOverlayTool} and has a few restrictions
 * and assumptions associated with the usage. If used elsewhere, take care as to how this affects
 * performance and behaviour.
 */
export class BucketGrid2D<T> {
  private readonly _dimensions: [width: number, height: number];
  private readonly _bounds: Box2;
  private readonly _cells: SimpleGrid2DElement<T>[][];
  /**
   * Holds elements that has been removed from the collection using {@link BucketGrid2D.removeOverlappingElements}.
   * This is used to avoid expensive re-allocations of cells when removing elements.
   */
  private readonly _removedElements = new Set<T>();

  constructor(bounds: Box2, dimensions: [width: number, height: number]) {
    this._dimensions = dimensions;
    this._cells = range(0, dimensions[0] * dimensions[1]).map(() => new Array<SimpleGrid2DElement<T>>());
    this._bounds = bounds;
  }

  insert(bounds: Box2, element: T): void {
    if (!this._bounds.intersectsBox(bounds)) {
      throw new Error('Element to be added must be partially inside grid');
    }
    if (this._removedElements.has(element)) {
      throw new Error('Re-adding previously taken elements is currently not supported');
    }

    for (const cell of this.cellsIntersecting(bounds)) {
      cell.push({ bounds, element });
    }
  }

  *overlappingElements(bounds: Box2): Generator<T> {
    if (!this._bounds.intersectsBox(bounds)) {
      return;
    }

    const visitedElements = new Set<T>();
    for (const cell of this.cellsIntersecting(bounds)) {
      for (const candidateElement of cell) {
        if (
          !visitedElements.has(candidateElement.element) &&
          !this._removedElements.has(candidateElement.element) &&
          bounds.intersectsBox(candidateElement.bounds)
        ) {
          visitedElements.add(candidateElement.element);
          yield candidateElement.element;
        }
      }
    }
  }

  *removeOverlappingElements(bounds: Box2): Generator<T> {
    if (!this._bounds.intersectsBox(bounds)) {
      return;
    }

    for (const cell of this.cellsIntersecting(bounds)) {
      for (let i = 0; i < cell.length; i++) {
        const candidateElement = cell[i];
        if (!this._removedElements.has(candidateElement.element) && bounds.intersectsBox(candidateElement.bounds)) {
          this._removedElements.add(candidateElement.element);
          yield candidateElement.element;
        }
      }
    }
  }

  private *cellsIntersecting(bounds: Box2): Generator<SimpleGrid2DElement<T>[]> {
    const { min, max } = this._bounds;
    const dimX = this._dimensions[0];
    const dimY = this._dimensions[1];
    const relativeBoundsMinX = (bounds.min.x - min.x) / (max.x - min.x);
    const relativeBoundsMaxX = (bounds.max.x - min.x) / (max.x - min.x);
    const relativeBoundsMinY = (bounds.min.y - min.y) / (max.y - min.y);
    const relativeBoundsMaxY = (bounds.max.y - min.y) / (max.y - min.y);

    const clamp = MathUtils.clamp;
    const minI = clamp(Math.floor(dimX * relativeBoundsMinX), 0, dimX - 1);
    const maxI = clamp(Math.floor(dimX * relativeBoundsMaxX), 0, dimX - 1);
    const minJ = clamp(Math.floor(dimY * relativeBoundsMinY), 0, dimY - 1);
    const maxJ = clamp(Math.floor(dimY * relativeBoundsMaxY), 0, dimY - 1);
    for (let j = minJ; j <= maxJ; ++j) {
      for (let i = minI; i <= maxI; ++i) {
        yield this._cells[j * dimX + i];
      }
    }
  }
}
