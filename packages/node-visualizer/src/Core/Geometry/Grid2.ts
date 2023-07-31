//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { Index2 } from '../Geometry/Index2';
import { Range3 } from '../Geometry/Range3';
import { Shape } from '../Geometry/Shape';

export class Grid2 extends Shape {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public readonly nodeSize: Index2;

  public readonly cellSize: Index2;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(nodeSize: Index2) {
    super();
    this.nodeSize = nodeSize.clone();
    this.cellSize = nodeSize.clone();
    this.cellSize.i -= 1;
    this.cellSize.j -= 1;
  }

  //= =================================================
  // OVERRIDES of Shape:
  //= =================================================

  public /* override */ clone(): Shape {
    return new Grid2(this.nodeSize);
  }

  public /* override */ expandBoundingBox(_: Range3): void {}

  //= =================================================
  // INSTANCE METHODS: Getters
  //= =================================================

  public toString(): string {
    return `(${this.nodeSize})`;
  }

  public getNodeIndex(i: number, j: number) {
    return i + this.nodeSize.i * j;
  }

  public getCellIndex(i: number, j: number) {
    return i + this.cellSize.i * j;
  }

  //= =================================================
  // INSTANCE METHODS: Requests
  //= =================================================

  public isNodeInside(i: number, j: number) {
    return i >= 0 && j >= 0 && i < this.nodeSize.i && j < this.nodeSize.j;
  }

  public isCellInside(i: number, j: number) {
    return i >= 0 && j >= 0 && i < this.cellSize.i && j < this.cellSize.j;
  }
}
