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
import * as color from "color"

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range3 } from "@/Core/Geometry/Range3";

const MaxByte = 255;

export class ThreeConverter
{
  //==================================================
  // STATIC METHODS
  //==================================================

  public static toColor(value: color): THREE.Color { return new THREE.Color(value.red() / MaxByte, value.green() / MaxByte, value.blue() / MaxByte); }
  public static toVector(value: Vector3): THREE.Vector3 { return new THREE.Vector3(value.x, value.y, value.z); }
  public static fromVector(value: THREE.Vector3): Vector3 { return new Vector3(value.x, value.y, value.z); }

  public static copy(destination: THREE.Vector3, source: Vector3)
  {
    destination.x = source.x;
    destination.y = source.y;
    destination.z = source.z;
  }

  public static fromBox(value: THREE.Box3, checkEmpty = true): Range3
  {
    if (checkEmpty && value.isEmpty)
      return new Range3();
    return new Range3(ThreeConverter.fromVector(value.min), ThreeConverter.fromVector(value.max));
  }

  public static toBox(value: Range3): THREE.Box3
  {
    if (value.isEmpty)
      return new THREE.Box3();
    return new THREE.Box3(ThreeConverter.toVector(value.min), ThreeConverter.toVector(value.max));
  }
}
