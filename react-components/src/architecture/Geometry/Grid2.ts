/*!
 * Copyright 2024 Cognite AS
 */

import { type Index2 } from './Index2';
import { type Range3 } from './Range3';
import { Shape } from './Shape';

export class Grid2 extends Shape {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly nodeSize: Index2;
  public readonly cellSize: Index2;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(nodeSize: Index2) {
    super();
    this.nodeSize = nodeSize.clone();
    this.cellSize = nodeSize.clone();
    this.cellSize.i -= 1;
    this.cellSize.j -= 1;
  }

  // ==================================================
  // OVERRIDES of Shape:
  // ==================================================

  public override clone(): Shape {
    return new Grid2(this.nodeSize);
  }

  public override expandBoundingBox(_: Range3): void {}

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getNodeIndex(i: number, j: number): number {
    return i + this.nodeSize.i * j;
  }

  public getCellIndex(i: number, j: number): number {
    return i + this.cellSize.i * j;
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public isNodeInside(i: number, j: number): boolean {
    return i >= 0 && j >= 0 && i < this.nodeSize.i && j < this.nodeSize.j;
  }

  public isCellInside(i: number, j: number): boolean {
    return i >= 0 && j >= 0 && i < this.cellSize.i && j < this.cellSize.j;
  }
}
