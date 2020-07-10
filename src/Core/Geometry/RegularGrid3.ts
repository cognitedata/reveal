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
import { Range3 } from "@/Core/Geometry/Range3";
import { Index3 } from "@/Core/Geometry/Index3";
import { Grid3 } from "@/Core/Geometry/Grid3";

export class RegularGrid3 extends Grid3
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public origin: Vector3;
  public inc: Vector3;

  private _hasRotationAngle = false;
  private _rotationAngle = 0;
  private _sinRotationAngle = 0;
  private _cosRotationAngle = 1;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get rotationAngle(): number { return this._rotationAngle; }

  public set rotationAngle(value: number)
  {
    this._hasRotationAngle = value != 0;
    if (this._hasRotationAngle)
    {
      this._rotationAngle = value;
      this._sinRotationAngle = Math.sin(this._rotationAngle);
      this._cosRotationAngle = Math.cos(this._rotationAngle);
    }
    else
    {
      this._rotationAngle = 0;
      this._sinRotationAngle = 0;
      this._cosRotationAngle = 1;
    }
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(nodeSize: Index3, origin: Vector3, inc: Vector3, rotationAngle: number | undefined = undefined)
  {
    super(nodeSize);
    this.origin = origin;
    this.inc = inc;
    if (rotationAngle != undefined)
      this.rotationAngle = rotationAngle;
  }

  //==================================================
  // OVERRIDES of object
  //==================================================

  public /*override*/ toString(): string { return `nodeSize: ${this.nodeSize} origin: ${this.origin} inc: ${this.inc} rotationAngle: ${this.rotationAngle}`; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getNodePosition(i: number, j: number, k: number, result: Vector3): void
  {
    if (this._hasRotationAngle)
    {
      const dx = this.inc.x * i;
      const dy = this.inc.y * j;
      result.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      result.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    }
    else
    {
      result.x = this.inc.x * i;
      result.y = this.inc.y * j;
    }
    result.z = this.inc.z * k;
    result.add(this.origin);
  }

  public getCellCenter(i: number, j: number, k: number, result: Vector3): void
  {
    this.getNodePosition(i + 0.5, j + 0.5, k + 0.5, result);
  }

  public getRelativeNodePosition(i: number, j: number, k: number, result: Vector3): void
  {
    result.x = this.inc.x * i;
    result.y = this.inc.y * j;
    result.z = this.inc.z * k;
  }

  public getRelativeCellCenter(i: number, j: number, k: number, result: Vector3): void
  {
    this.getRelativeNodePosition(i + 0.5, j + 0.5, k + 0.5, result);
  }

  public getRange(): Range3
  {
    const corner = Vector3.newZero;
    const range = new Range3();
    range.add(this.origin);
    this.getNodePosition(0, this.nodeSize.j - 1, 0, corner);
    range.add(corner);
    this.getNodePosition(this.nodeSize.i - 1, 0, 0, corner);
    range.add(corner);
    this.getNodePosition(this.nodeSize.i - 1, this.nodeSize.j - 1, this.nodeSize.k - 1, corner); // This get the max z
    range.add(corner);
    return range;
  }
}

