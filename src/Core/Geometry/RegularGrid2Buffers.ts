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

import { RegularGrid2 } from "@/Core/Geometry/RegularGrid2";
import { TrianglesBuffers } from "@/Core/Geometry/TrianglesBuffers";
import { Vector3 } from "@/Core/Geometry/Vector3";

export class RegularGrid2Buffers extends TrianglesBuffers
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(grid: RegularGrid2, makeUvs: boolean)
  {
    const [uniqueIndexes, numUniqueIndex] = RegularGrid2Buffers.createUniqueIndexes(grid);
    super(numUniqueIndex, makeUvs);
    this.makeBuffers(grid, uniqueIndexes);
    this.makeTriangleIndexes(grid, uniqueIndexes);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  makeBuffers(grid: RegularGrid2, uniqueIndexes: number[])
  {
    // Generate the position, normal and uvs
    const zRange = grid.zRange;
    const position = Vector3.newZero;
    const normal = Vector3.newZero;

    for (let j = grid.nodeSize.j - 1; j >= 0; j--)
    {
      for (let i = grid.nodeSize.i - 1; i >= 0; i--)
      {
        const nodeIndex = grid.getNodeIndex(i, j);
        const uniqueIndex = uniqueIndexes[nodeIndex];
        if (uniqueIndex < 0)
          continue;

        if (!grid.getRelativePosition(i, j, position))
          continue;

        grid.getNormal(i, j, normal, position.z, false);
        const u = zRange.getFraction(position.z);
        this.setAt(uniqueIndex, position, normal, u);
      }
    }
  }

  private makeTriangleIndexes(grid: RegularGrid2, uniqueIndexes: number[])
  {
    // Generate the triangle indices
    // Should be strip, but could not get it to work
    for (let i = 0; i < grid.nodeSize.i - 1; i++)
    {
      for (let j = 0; j < grid.nodeSize.j - 1; j++)
      {
        const nodeIndex0 = grid.getNodeIndex(i, j);
        const nodeIndex1 = grid.getNodeIndex(i + 1, j);
        const nodeIndex2 = grid.getNodeIndex(i + 1, j + 1);
        const nodeIndex3 = grid.getNodeIndex(i, j + 1);

        const unique0 = uniqueIndexes[nodeIndex0];
        const unique1 = uniqueIndexes[nodeIndex1];
        const unique2 = uniqueIndexes[nodeIndex2];
        const unique3 = uniqueIndexes[nodeIndex3];

        let triangleCount = 0;
        if (unique0 >= 0) triangleCount++;
        if (unique1 >= 0) triangleCount++;
        if (unique2 >= 0) triangleCount++;
        if (unique3 >= 0) triangleCount++;

        if (triangleCount < 3)
          continue;

        //(i,j+1)     (i+1,j+1)
        //     3------2
        //     |      |
        //     0------1
        //(i,j)       (i+1,j)

        if (unique0 < 0)
          this.addTriangle(unique1, unique2, unique3);
        if (triangleCount === 4 || unique1 < 0)
          this.addTriangle(unique0, unique2, unique3);
        if (unique2 < 0)
          this.addTriangle(unique0, unique1, unique3);
        if (triangleCount === 4 || unique3 < 0)
          this.addTriangle(unique0, unique1, unique2);
      }
    }
  }

  private static createUniqueIndexes(grid: RegularGrid2): [number[], number]
  {
    const uniqueIndexes = new Array<number>(grid.nodeSize.size);
    let numUniqueIndex = 0;
    for (let j = grid.nodeSize.j - 1; j >= 0; j--)
    {
      for (let i = grid.nodeSize.i - 1; i >= 0; i--)
      {
        const nodeIndex = grid.getNodeIndex(i, j);
        if (grid.isNodeDef(i, j))
        {
          uniqueIndexes[nodeIndex] = numUniqueIndex;
          numUniqueIndex++;
        }
        else
          uniqueIndexes[nodeIndex] = -1;
      }
    }
    return [uniqueIndexes, numUniqueIndex];
  }
}


  // let prevCount = 0;
  // for (const count of groups) 
  // {
  //   const groupCount = count - prevCount;
  //   if (groupCount > 0)
  //   {      
  //     geometry.addGroup(prevCount, groupCount);
  //   }
  //   prevCount = count;
  // }


// function addGroup(geometry: THREE.BufferGeometry, indices: number[], prevCount: number): number
// {
//   const count = indices.length - 1;
//   const groupCount = count - prevCount;
//   if (groupCount > 0)
//   {
//     //geometry.addGroup(prevCount, groupCount);
//     console.log(groupCount);
//   }
//   return count;
// }
