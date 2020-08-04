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
  private axis: number;
  //public cells: Index2[] = [];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(grid: RegularGrid3, axis: number)
  {
    let count = axis == 1 ? grid.cellSize.i : grid.cellSize.j
    count *= grid.cellSize.k
    super(count, true);
    this.axis = axis;
    this.makeBuffers(grid);
    this.makeTriangleIndexes(grid);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  makeBuffers(grid: RegularGrid3/*, cells: Index2*/): void
  {
    // Generate the position, normal 
    const position = Vector3.newZero;

    if (this.axis == 0)
    {
      const normal = new Vector3(1, 0, 0);
      for (let j = 0; j < grid.cellSize.j; j++)
      {
        for (let k = 0; k < grid.cellSize.k; k++)
        {
          grid.getRelativeCellCenter(0, j, k, position);
          const uniqueIndex = j * grid.cellSize.k + k;
          this.setAt(uniqueIndex, position, normal, 0);
        }
      }
    }
    else if (this.axis == 1)
    {
      const normal = new Vector3(0, 1, 0);
      for (let i = 0; i < grid.cellSize.i; i++)
      {
        for (let k = 0; k < grid.cellSize.k; k++)
        {
          grid.getRelativeCellCenter(i, 0, k, position);
          const uniqueIndex = i * grid.cellSize.k + k;
          this.setAt(uniqueIndex, position, normal, 0);
        }
      }
    }
  }

  private makeTriangleIndexes(grid: RegularGrid3): void
  {
    // Generate the triangle indices
    // Should be strip, but could not get it to work

    let count = this.axis == 1 ? grid.cellSize.i : grid.cellSize.j
    for (let i = 0; i < count - 1; i++)
    {
      for (let k = 0; k < grid.cellSize.k - 1; k++)
      {
        const unique0 = i * grid.cellSize.k + k;
        const unique1 = unique0 + 1;
        const unique3 = unique0 + grid.cellSize.k;
        const unique2 = unique3 + 1;

        this.addTriangle(unique0, unique1, unique2);
        this.addTriangle(unique0, unique2, unique3);
      }
    }
  }
}

