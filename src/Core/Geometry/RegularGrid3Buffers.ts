//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite aS. all rights reserved.
//=====================================================================================

import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { TrianglesBuffers } from "@/Core/Geometry/TrianglesBuffers";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Index2 } from '@/Core/Geometry/Index2';

export class RegularGrid3Buffers extends TrianglesBuffers
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(grid: RegularGrid3, normal: Vector3, cells: Index2[])
  {
    super(cells.length * grid.cellSize.k, true);
    this.makeBuffers(grid, normal, cells);
    this.makeTriangleIndexes(grid, cells);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  makeBuffers(grid: RegularGrid3, normal: Vector3, cells: Index2[]): void
  {
    // Generate the position, normal 
    const position = Vector3.newZero;

    let uniqueIndex = 0;
    for (const cell of cells)
    {
      for (let k = 0; k < grid.cellSize.k; k++, uniqueIndex++)
      {
        grid.getRelativeCellCenter(cell.i, cell.j, k, position);
        this.setAt(uniqueIndex, position, normal);
      }
    }
  }

  private makeTriangleIndexes(grid: RegularGrid3, cells: Index2[]): void
  {
    // Generate the triangle indices
    // Should be strip, but could not get it to work

    for (let index = 0; index < cells.length - 1; index++)
    {
      for (let k = 0; k < grid.cellSize.k - 1; k++)
      {
        const unique0 = index * grid.cellSize.k + k;
        const unique1 = unique0 + 1;
        const unique3 = unique0 + grid.cellSize.k;
        const unique2 = unique3 + 1;

        this.addTriangle(unique0, unique1, unique2);
        this.addTriangle(unique0, unique2, unique3);
      }
    }
  }
}

