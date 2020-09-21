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
import { ColorMap } from "@/Core/Primitives/ColorMap";
import { Range1 } from "@/Core/Geometry/Range1";

export class TextureKit
{
  //==================================================
  // STATIC METHODS
  //==================================================

  private static createTexture(rgbs: Uint8Array): THREE.DataTexture | null
  {
    return new THREE.DataTexture(rgbs, rgbs.length / (2 * 3), 2, THREE.RGBFormat);
  }

  public static create1D(colorMap: ColorMap | null): THREE.DataTexture | null
  {
    if (!colorMap)
      return null;
    const rgbs = colorMap.create1DColors();
    return TextureKit.createTexture(rgbs);
  }

  public static create1DContours(colorMap: ColorMap | null, range: Range1, increment: number, volume: number, color?: Color): THREE.DataTexture | null
  {
    if (!colorMap)
      return null;
    const rgbs = colorMap.create1DContourColors(range, increment, volume, color);
    return TextureKit.createTexture(rgbs);
  }
}
