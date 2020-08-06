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

import * as THREE from "three";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range3 } from "@/Core/Geometry/Range3";

export class ThreeTransformer 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _xTranslation = 0;
  private _yTranslation = 0;
  private _zScale = 1;
  private _initialized = false;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get zScale(): number { return this._zScale; }
  public set zScale(value: number) { this._zScale = value; }
  public get scale(): THREE.Vector3 { return new THREE.Vector3(1, 1, this._zScale); }
  public get translation(): THREE.Vector3 { return new THREE.Vector3(this._xTranslation, this._yTranslation, 0); }

  //==================================================
  // INSTANCE FIELDS: World => 3D
  //==================================================

  public to3D(position: Vector3): THREE.Vector3
  {
    if (!this._initialized)
      this.initialize(position);
    return new THREE.Vector3(position.x - this._xTranslation, position.y - this._yTranslation, position.z * this._zScale);
  }

  public rangeTo3D(range: Range3): THREE.Box3
  {
    if (range.isEmpty)
      return new THREE.Box3();

    if (!this._initialized)
      this.initialize(range.center);

    return new THREE.Box3(this.to3D(range.min), this.to3D(range.max));
  }

  public transformTo3D(position: Vector3): void
  {
    if (!this._initialized)
      this.initialize(position);

    position.x -= this._xTranslation;
    position.y -= this._yTranslation;
    position.z *= this._zScale;
  }

  public transformRelativeTo3D(position: Vector3): void
  {
    position.z *= this._zScale;
  }

  public transformTangentTo3D(vector: Vector3): void
  {
    vector.z *= this._zScale;
    vector.normalize();
  }

  public transformNormalTo3D(vector: Vector3): void
  {
    vector.z /= this._zScale;
    vector.normalize();
  }

  public transformRangeTo3D(range: Range3): void
  {
    if (range.isEmpty)
      return;

    if (!this._initialized)
      this.initialize(range.center);

    range.x.translate(-this._xTranslation);
    range.y.translate(-this._yTranslation);
    range.z.scale(this._zScale);
  }

  //==================================================
  // INSTANCE FIELDS: 3D => World
  //==================================================

  public toWorld(position: THREE.Vector3): Vector3
  {
    return new Vector3(position.x + this._xTranslation, position.y + this._yTranslation, position.z / this._zScale);
  }

  public transformToWorld(position: Vector3): void
  {
    position.x += this._xTranslation;
    position.y += this._yTranslation;
    position.z /= this._zScale;
  }

  public rangeToWorld(value: THREE.Box3 | null, checkEmpty = true): Range3
  {
    if (!value)
      return new Range3();
    if (checkEmpty && value.isEmpty)
      return new Range3();
    return new Range3(this.toWorld(value.min), this.toWorld(value.max));
  }

  public transformRangeToWorld(range: Range3): void
  {
    if (range.isEmpty)
      return;

    range.x.translate(this._xTranslation);
    range.y.translate(this._yTranslation);
    range.z.scale(1 / this._zScale);
  }

  //==================================================
  // INSTANCE FIELDS: Helpers
  //==================================================

  private initialize(position: Vector3): void
  {
    if (!this._initialized)
    {
      console.log("3D translation is ", position.toString());
      this._initialized = true;
      this._xTranslation = position.x;
      this._yTranslation = position.y;
    }
  }
}
