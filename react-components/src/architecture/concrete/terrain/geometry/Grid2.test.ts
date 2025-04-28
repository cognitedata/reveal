/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test } from 'vitest';
import { Index2 } from '../../../base/utilities/geometry/Index2';
import { Grid2 } from './Grid2';

describe(Grid2.name, () => {
  const nodeSize = new Index2(10, 12);
  const cellSize = new Index2(9, 11);
  const grid = new Grid2(nodeSize);

  test('Should create a Grid2', () => {
    expect(grid.nodeSize).toEqual(nodeSize);
    expect(grid.cellSize).toEqual(cellSize);
  });

  test('Should clone', () => {
    expect(grid.clone()).toStrictEqual(grid);
  });

  test('Should test isNodeInside', () => {
    for (let i = 0; i < grid.nodeSize.i; i++) {
      for (let j = 0; j < grid.nodeSize.j; j++) {
        expect(grid.isNodeInside(i, j)).toBe(true);
      }
    }
    for (let i = grid.nodeSize.i; i <= 2 * grid.nodeSize.i; i++) {
      for (let j = grid.nodeSize.j; i <= 2 * grid.nodeSize.i; j++) {
        expect(grid.isNodeInside(i, j)).toBe(false);
      }
    }
  });

  test('Should test isCellInside', () => {
    for (let i = 0; i < grid.cellSize.i; i++) {
      for (let j = 0; j < grid.cellSize.j; j++) {
        expect(grid.isCellInside(i, j)).toBe(true);
      }
    }
    for (let i = grid.cellSize.i; i <= 2 * grid.cellSize.i; i++) {
      for (let j = grid.cellSize.j; i <= 2 * grid.cellSize.i; j++) {
        expect(grid.isCellInside(i, j)).toBe(false);
      }
    }
  });
});
