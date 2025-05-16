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

  test('The node should be inside', () => {
    for (let i = 0; i < grid.nodeSize.i; i++) {
      for (let j = 0; j < grid.nodeSize.j; j++) {
        expect(grid.isNodeInside(i, j)).toBe(true);
      }
    }
  });

  test('The node should be outside', () => {
    expect(grid.isNodeInside(-1, 0)).toBe(false);
    expect(grid.isNodeInside(0, -1)).toBe(false);
    expect(grid.isNodeInside(-1, -1)).toBe(false);
    expect(grid.isNodeInside(grid.nodeSize.i, grid.nodeSize.j)).toBe(false);
  });

  test('The cell should be inside', () => {
    for (let i = 0; i < grid.cellSize.i; i++) {
      for (let j = 0; j < grid.cellSize.j; j++) {
        expect(grid.isCellInside(i, j)).toBe(true);
      }
    }
  });

  test('The cell should be outside', () => {
    expect(grid.isCellInside(-1, 0)).toBe(false);
    expect(grid.isCellInside(0, -1)).toBe(false);
    expect(grid.isCellInside(-1, -1)).toBe(false);
    expect(grid.isCellInside(grid.cellSize.i, grid.cellSize.j)).toBe(false);
  });
});
