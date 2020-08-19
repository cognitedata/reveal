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

  public static readonly seismicName = "Seismic";
  public static readonly seismicRevName = "Seismic Rev";
  public static readonly rainbowName = "Rainbow";
  public static readonly rainbowRevName = "Rainbow Rev";
  public static readonly greyScaleName = "GreyScale";
  public static readonly greyScaleRevName = "GreyScale Rev";
  public static readonly terrainName = "terrain";

  private static _map: Map<string, ColorMap> | null = null;

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public static get(name: string): ColorMap | undefined
  {
    const { colorMaps } = ColorMaps;
    return colorMaps.get(name);
  }

  public static getOptions(): string[]
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
    ColorMaps.add(map, ColorMaps.createTerrain());
    ColorMaps.add(map, ColorMaps.createRainbow(false));
    ColorMaps.add(map, ColorMaps.createRainbow(true));
    ColorMaps.add(map, ColorMaps.createSeismic(false));
    ColorMaps.add(map, ColorMaps.createSeismic(true));
    ColorMaps.add(map, ColorMaps.createGreyScale(false));
    ColorMaps.add(map, ColorMaps.createGreyScale(true));
    return map;
  }

  private static add(map: Map<string, ColorMap>, colorMap: ColorMap): void
  {
    map.set(colorMap.name, colorMap);
  }

  //==================================================
  // STATIC METHODS: Create various color maps
  //==================================================

  private static createSeismic(reverse: boolean): ColorMap
  {
    const colorMap = new ColorMap();
    const a = 0.20;
    const b = 0.25;

    const interpolation = ColorInterpolation.Rgb;

    colorMap.add(Color.rgb(161, 255, 255), 0, interpolation);
    colorMap.add(Color.rgb(0, 0, 191), a, interpolation);
    colorMap.add(Color.rgb(77, 77, 77), b, interpolation);
    colorMap.add(Color.rgb(204, 204, 204), 0.5, interpolation);
    colorMap.add(Color.rgb(97, 69, 0), 1 - b, interpolation);
    colorMap.add(Color.rgb(191, 0, 0), 1 - a, interpolation);
    colorMap.add(Colors.yellow, 1, interpolation);
    colorMap.name = reverse ? ColorMaps.seismicName : ColorMaps.seismicRevName;
    if (reverse)
      colorMap.reverse();
    return colorMap;
  }

  private static createRainbow(reverse: boolean): ColorMap
  {
    const colorMap = new ColorMap();
    const interpolation = ColorInterpolation.HsvMax;
    colorMap.add(Colors.magenta, 0, interpolation);
    colorMap.add(Colors.red, 1, interpolation);
    colorMap.name = reverse ? ColorMaps.rainbowName : ColorMaps.rainbowRevName;
    if (reverse)
      colorMap.reverse();
    return colorMap;
  }

  private static createGreyScale(reverse: boolean): ColorMap
  {
    const colorMap = new ColorMap();
    const interpolation = ColorInterpolation.HsvMax;
    colorMap.add(Colors.white, 0, interpolation);
    colorMap.add(Colors.black, 1, interpolation);
    colorMap.name = reverse ? ColorMaps.greyScaleName : ColorMaps.greyScaleRevName;
    if (reverse)
      colorMap.reverse();
    return colorMap;
  }

  private static createTerrain(): ColorMap
  {
    const colorMap = new ColorMap();
    const interpolation = ColorInterpolation.Rgb;
    colorMap.add(Colors.white, 0, interpolation);
    colorMap.add(Color.rgb(168, 144, 140), 0.2, interpolation); // brown
    colorMap.add(Color.rgb(255, 255, 150), 0.4, interpolation); //Yellow
    colorMap.add(Color.rgb(87, 221, 119), 0.6, interpolation); //green
    colorMap.add(Color.rgb(0, 147, 255), 0.8, interpolation); // blue
    colorMap.add(Color.rgb(50, 50, 156), 1, interpolation); // Dark blue
    colorMap.name = ColorMaps.terrainName;
    colorMap.reverse();
    return colorMap;
  }

}
