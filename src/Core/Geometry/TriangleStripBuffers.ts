//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { Vector3 } from "./Vector3";

export class TriangleStripBuffers
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public positions: Float32Array;
  public normals: Float32Array;
  public uvs: Float32Array;
  public triangleIndexes: number[] = [];
  public pointCount = 0;
  public uniqueIndex = 0;

  public constructor(size: number)
  {
    this.pointCount = size
    this.positions = new Float32Array(3 * size);
    this.normals = new Float32Array(3 * size);
    this.uvs = new Float32Array(2 * size);
  }

  addPair(p1: Vector3, p2: Vector3, n1: Vector3, n2: Vector3)
  {
    if (this.uniqueIndex >= 2)
    {
      //     3------2
      //     |      |
      //     0------1
      const unique0 = this.uniqueIndex - 2;
      const unique1 = this.uniqueIndex - 1;
      const unique2 = this.uniqueIndex;
      const unique3 = this.uniqueIndex + 1;

      this.addTriangle(unique0, unique1, unique2);
      this.addTriangle(unique0, unique2, unique3);
    }
    {
      const index = 3 * this.uniqueIndex;

      this.positions[index + 0] = p1.x;
      this.positions[index + 1] = p1.y;
      this.positions[index + 2] = p1.z;

      this.positions[index + 3] = p2.x;
      this.positions[index + 4] = p2.y;
      this.positions[index + 5] = p2.z;

      this.normals[index + 0] = n1.x;
      this.normals[index + 1] = n1.y;
      this.normals[index + 2] = n1.z;

      this.normals[index + 3] = n2.x;
      this.normals[index + 4] = n2.y;
      this.normals[index + 5] = n2.z;
    }
    {
      const uvindex = 2 * this.uniqueIndex;
      this.uvs[uvindex + 0] = 0; //fraction;
      this.uvs[uvindex + 1] = 0;
    }
    this.uniqueIndex += 2;
  }


  private addTriangle(index0: number, index1: number, index2: number): void
  {
    this.triangleIndexes.push(index0, index1, index2);
  }
}

