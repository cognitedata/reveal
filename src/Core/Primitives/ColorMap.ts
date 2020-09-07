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

// eslint-disable-next-line max-classes-per-file
import Color from "color";
import { Ma } from "@/Core/Primitives/Ma";
import { ColorMapItem } from "@/Core/Primitives/ColorMapItem";
import { ColorInterpolation } from "@/Core/Primitives/ColorInterpolation";
import { Range1 } from "@/Core/Geometry/Range1";
import { Colors } from "@/Core/Primitives/Colors";

export class ColorMap
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _items: ColorMapItem[] = [];
  private _maxIndex: number = 0;
  public name: string = "";

  //==================================================
  // CONSTRUCTOR
  //==================================================

  constructor(colors?: Color[])
  {
    if (!colors)
      return;

    this._maxIndex = colors.length - 1;
    const inc = 1.0 / this._maxIndex;
    let fraction = 0;
    for (const color of colors)
    {
      this._items.push(new ColorMapItem(color, fraction, ColorInterpolation.Rgb));
      fraction += inc;
    }
    this._items[this._maxIndex].fraction = 1; // Ensure 1 at last item
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getColor(fraction: number): Color
  {
    // Assume a limited number of colors, otherwise a binary search should be used.
    for (let i = 0; i <= this._maxIndex; i++)
    {
      const item = this._items[i];
      if (fraction <= item.fraction)
      {
        if (i === 0)
          return item.color;
        return this._items[i - 1].mix(item, fraction);
      }
    }
    return this._items[this._maxIndex].color;
  }

  private getColorFast(fraction: number, indexInColorMap: Index): Color
  {
    // Assume a limited number of colors, otherwise a binary search should be used.
    for (; indexInColorMap.value <= this._maxIndex; indexInColorMap.value++)
    {
      const item = this._items[indexInColorMap.value];
      if (fraction <= item.fraction)
      {
        if (indexInColorMap.value === 0)
          return item.color;
        return this._items[indexInColorMap.value - 1].mix(item, fraction);
      }
    }
    return this._items[this._maxIndex].color.rgb();
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(color: Color, fraction: number, interpolation: ColorInterpolation): void
  {
    this._items.push(new ColorMapItem(color, fraction, interpolation));
    // Make it consistent:
    this._items.sort((a, b) => Ma.compare(a.fraction, b.fraction));
    this._maxIndex = this._items.length - 1;
  }

  public reverse(): void
  {
    this._items.reverse();
    for (const item of this._items)
      item.fraction = 1 - item.fraction;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public create1DColors(size: number = 1000): Uint8Array
  {
    const height = 2;
    const rgbs = new Uint8Array(3 * size * height);

    let index1 = 0;
    let index2 = size;
    const indexInColorMap = new Index();

    for (let i = 0; i < size; i++)
    {
      const fraction = i / (size - 1);
      const color = this.getColorFast(fraction, indexInColorMap);
      ColorMap.setAt(rgbs, index1++, color);
      ColorMap.setAt(rgbs, index2++, color);
    }
    return rgbs;
  }

  public create1DContourColors(range: Range1, increment: number, volume: number, solidColor?: Color, size: number = 1000): Uint8Array
  {
    const height = 2;
    const rgbs = new Uint8Array(3 * size * height);

    let index1 = 0;
    let index2 = size;
    const indexInColorMap = new Index();
    let color: Color;
    if (solidColor)
      solidColor = solidColor.rgb();

    const { black } = Colors;
    const { white } = Colors;
    for (let i = 0; i < size; i++)
    {
      const fraction = i / (size - 1);
      const level = range.getValue(fraction);
      const reminder = level % increment;
      let contourFraction = reminder / increment;
      if (contourFraction < 1)
        contourFraction += 1;

      // Get color in the middle
      const middleLevel = (level - reminder) - increment / 2;
      const middleFraction = range.getFraction(middleLevel);
      color = solidColor || this.getColorFast(middleFraction, indexInColorMap);
      if (contourFraction < 0.5)
        color = color.mix(white, volume * (0.5 - contourFraction));
      else
        color = color.mix(black, volume * (contourFraction - 0.5));

      ColorMap.setAt(rgbs, index1++, color);
      ColorMap.setAt(rgbs, index2++, color);
    }
    return rgbs;
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  static setAt(rgbs: Uint8Array, index: number, color: Color): void
  {
    index *= 3;
    rgbs[index] = color.red();
    rgbs[index + 1] = color.green();
    rgbs[index + 2] = color.blue();
  }

  static add(rgbs: Array<number>, color: Color): void
  {
    rgbs.push(color.red(), color.green(), color.blue());
  }
}

class Index
{
  public value: number;
  constructor(value = 0) { this.value = value; }
}
