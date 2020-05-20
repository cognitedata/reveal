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

import { Range3 } from "@/Core/Geometry/Range3";
import { Colors } from "@/Core/Primitives/Colors";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

export class BoundingBoxKit 
{
  static getBoundingBox(object: THREE.Object3D | null): Range3 | undefined {
    if (!object)
      return undefined;

    const helper = new THREE.BoxHelper(object, ThreeConverter.toColor(Colors.white));
    //helper.update();
    helper.geometry.computeBoundingBox();
    return ThreeConverter.fromBox(helper.geometry.boundingBox, false);
  }
}

