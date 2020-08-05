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
import * as Color from "color";

import { Vector3 } from "@/Core/Geometry/Vector3";

const MaxByte = 255;

export class ThreeConverter
{
  //==================================================
  // STATIC METHODS
  //==================================================

  public static toThreeColor(value: Color): THREE.Color { return new THREE.Color(value.red() / MaxByte, value.green() / MaxByte, value.blue() / MaxByte); }
  public static toThreeVector3(value: Vector3): THREE.Vector3 { return new THREE.Vector3(value.x, value.y, value.z); }
  public static fromThreeVector3(value: THREE.Vector3): Vector3 { return new Vector3(value.x, value.y, value.z); }
  public static fromThreeVector2(value: THREE.Vector2): Vector3 { return new Vector3(value.x, value.y, 0); }

  public static copyToThreeVector3(destination: THREE.Vector3, source: Vector3)
  {
    destination.x = source.x;
    destination.y = source.y;
    destination.z = source.z;
  }
}
