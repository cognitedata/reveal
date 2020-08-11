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

import * as Color from "color";
import { Colors } from "@/Core/Primitives/Colors";
import { ColorMap } from '@/Core/Primitives/ColorMap';
import { ColorInterpolation } from '@/Core/Primitives/ColorMapItem';

export class ColorMaps
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public static readonly commonSeismicName = "CommonSeismic";
  public static readonly rainbowName = "Rainbow";
  public static readonly greyScaleName = "GreyScale";

  private static _map: Map<string, ColorMap> | null = null;

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public static get(name: string): ColorMap | undefined
  {
    const { colorMaps } = ColorMaps;
    return colorMaps.get(name);
  }

  public static getNames(): string[]
  {
    const { colorMaps } = ColorMaps;
    return Array.from(colorMaps.keys());
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  private static get colorMaps(): Map<string, ColorMap>
  {
    if (!ColorMaps._map)
      ColorMaps._map = ColorMaps.createColorMaps();
    return ColorMaps._map;
  }

  private static createColorMaps(): Map<string, ColorMap>
  {
    const map = new Map<string, ColorMap>();
    ColorMaps.add(map, ColorMaps.createCommonSeismic());
    ColorMaps.add(map, ColorMaps.createRainbow());
    ColorMaps.add(map, ColorMaps.createGreyScale());
    return map;
  }

  private static add(map: Map<string, ColorMap>, colorMap: ColorMap): void
  {
    map.set(colorMap.name, colorMap);
  }

  //==================================================
  // STATIC METHODS: Create various color maps
  //==================================================

  private static createCommonSeismic(): ColorMap
  {
    const colorMap = new ColorMap();
    const a = 0.3333;
    const b = 0.3750;

    const interpolation = ColorInterpolation.Rgb;

    colorMap.add(Color.rgb(161, 255, 255), 0, interpolation);
    colorMap.add(Color.rgb(0, 0, 191), a, interpolation);
    colorMap.add(Color.rgb(77, 77, 77), b, interpolation);
    colorMap.add(Color.rgb(204, 204, 204), 0.5, interpolation);
    colorMap.add(Color.rgb(97, 69, 0), 1 - b, interpolation);
    colorMap.add(Color.rgb(191, 0, 0), 1 - a, interpolation);
    colorMap.add(Colors.yellow, 1, interpolation);
    colorMap.name = ColorMaps.commonSeismicName;
    return colorMap;
  }

  private static createRainbow(): ColorMap
  {
    const colorMap = new ColorMap();
    const interpolation = ColorInterpolation.HsvMax;
    colorMap.add(Colors.magenta, 0, interpolation);
    colorMap.add(Colors.red, 1, interpolation);
    colorMap.name = ColorMaps.rainbowName;
    return colorMap;
  }

  private static createGreyScale(): ColorMap
  {
    const colorMap = new ColorMap();
    const interpolation = ColorInterpolation.HsvMax;
    colorMap.add(Colors.white, 0, interpolation);
    colorMap.add(Colors.black, 1, interpolation);
    colorMap.name = ColorMaps.greyScaleName;
    return colorMap;
  }
}
