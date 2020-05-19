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
import * as Color from "color"

import { Range1 } from "@/Core/Geometry/Range1";
import { Colors } from "@/Core/Primitives/Colors";

export class TextureKit 
{
  static add(array: Array<number>, color: Color)
  {
    array.push(color.red());
    array.push(color.green());
    array.push(color.blue());
  }

  static create1D(range: Range1): THREE.DataTexture
  {
    const darknessVolume = 0.3;

    const width = 2000;
    const height = 2;
    const data = new Uint8Array(3 * width * height);
    const inc = Math.round(width / 20);

    let index1 = 0;
    let index2 = 3 * width;

    for (let i = 0; i < width; i++)
    {
      const hue = i / (width - 1);
      let color = Color.hsv(hue * 360, 255, 255);

      if (false)
        color = Colors.getGammaCorrected(color);

      if (false)
      {
        // Darkness correction
        const darknessFraction = (i % inc) / inc;
        color = color.darken(darknessVolume * (darknessFraction - 0.5));
      }
      data[index1++] = data[index2++] = color.red();
      data[index1++] = data[index2++] = color.green();
      data[index1++] = data[index2++] = color.blue();
    }
    return new THREE.DataTexture(data, width, height, THREE.RGBFormat);
  }
}

