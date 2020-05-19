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

import { Vector3 } from "@/Core/Geometry/Vector3";
import * as THREE from 'three';

export class TriangleStripBuffers
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected positions: Float32Array;
  protected normals: Float32Array;
  public uvs: Float32Array | null = null;
  protected triangleIndexes: number[] = [];
  protected uniqueIndex = 0;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(pointCount: number, makeUvs = false)
  {
    this.positions = new Float32Array(3 * pointCount);
    this.normals = new Float32Array(3 * pointCount);
    if (makeUvs)
      this.uvs = new Float32Array(2 * pointCount);
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getBufferGeometry(): THREE.BufferGeometry
  {
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3, true));
    geometry.addAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3, true));
    geometry.setIndex(new THREE.Uint32BufferAttribute(this.triangleIndexes, 1, true));
    if (this.uvs)
      geometry.addAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2, true));
    return geometry;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public addPair(p1: Vector3, p2: Vector3, n1: Vector3, n2: Vector3, u = 0)
  {
    if (this.uniqueIndex >= 2)
    {
      //     2------3
      //     |      |
      //     0------1
      const unique0 = this.uniqueIndex - 2;
      const unique1 = this.uniqueIndex - 1;
      const unique2 = this.uniqueIndex;
      const unique3 = this.uniqueIndex + 1;

      this.addTriangle(unique0, unique2, unique3);
      this.addTriangle(unique0, unique3, unique1);
    }
    {
      this.add(p1, n1, u);
      this.add(p2, n2, u);
    }
  }

  protected add(position: Vector3, normal: Vector3, u = 0): void
  {
    {
      const index = 3 * this.uniqueIndex;
      this.positions[index + 0] = position.x;
      this.positions[index + 1] = position.y;
      this.positions[index + 2] = position.z;
      this.normals[index + 0] = normal.x;
      this.normals[index + 1] = normal.y;
      this.normals[index + 2] = normal.z;
    }
    if (this.uvs)
    {
      const index = 2 * this.uniqueIndex;
      this.uvs[index + 0] = u;
      this.uvs[index + 1] = 0;
    }
    this.uniqueIndex++;
  }

  protected setXyzAt(uniqueIndex: number, x: number, y: number, z: number, normal: Vector3, u: number): void
  {
    {
      const index = 3 * uniqueIndex;
      this.positions[index + 0] = x;
      this.positions[index + 1] = y;
      this.positions[index + 2] = z;
      this.normals[index + 0] = normal.x;
      this.normals[index + 1] = normal.y;
      this.normals[index + 2] = normal.z;
    }
    if (this.uvs)
    {
      const index = 2 * uniqueIndex;
      this.uvs[index + 0] = u;
      this.uvs[index + 1] = 0;
    }
    this.uniqueIndex++;
  }

  protected addTriangle(index0: number, index1: number, index2: number): void
  {
    this.triangleIndexes.push(index0, index1, index2);
  }
}

