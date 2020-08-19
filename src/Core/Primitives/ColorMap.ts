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
import * as Color from "color";
import { Ma } from "@/Core/Primitives/Ma";
import { ColorMapItem, ColorInterpolation } from "@/Core/Primitives/ColorMapItem";
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
    let value = 0;
    for (const color of colors)
    {
      this._items.push(new ColorMapItem(color, value, ColorInterpolation.Rgb));
      value += inc;
    }
    this._items[this._maxIndex].value = 1; // Ensure 1 at last item
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getColor(value: number): Color
  {
    // Assume a limited number of colors, otherwise a binary search should be used.
    for (let i = 0; i <= this._maxIndex; i++)
    {
      const item = this._items[i];
      if (value <= item.value)
      {
        if (i === 0)
          return item.color;
        return this._items[i - 1].mix(item, value);
      }
    }
    return this._items[this._maxIndex].color;
  }

  private getColorFast(value: number, index: Index): Color
  {
    // Assume a limited number of colors, otherwise a binary search should be used.
    for (; index.value <= this._maxIndex; index.value++)
    {
      const item = this._items[index.value];
      if (value <= item.value)
      {
        if (index.value === 0)
          return item.color;
        return this._items[index.value - 1].mix(item, value);
      }
    }
    return this._items[this._maxIndex].color;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(color: Color, value: number, interpolation: ColorInterpolation): void
  {
    this._items.push(new ColorMapItem(color, value, interpolation));
    // Make it consistent:
    this._items.sort((a, b) => Ma.compare(a.value, b.value));
    this._maxIndex = this._items.length - 1;
  }

  public reverse(): void
  {
    this._items.reverse();
    for (const item of this._items)
      item.value = 1 - item.value;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public create1DTexture(size: number = 1000): Uint8Array
  {
    const darknessVolume = 0.3;
    const height = 2;
    const colors = new Uint8Array(3 * size * height);
    const inc = Math.round(size / 20);

    let index1 = 0;
    let index2 = 3 * size;

    const index = new Index();
    for (let i = 0; i < size; i++)
    {
      const value = i / (size - 1);
      let color = this.getColorFast(value, index);

      // eslint-disable-next-line no-constant-condition
      if (false)
        color = Colors.getGammaCorrected(color);

      // eslint-disable-next-line no-constant-condition
      if (false)
      {
        // Darkness correction
        const darknessFraction = (i % inc) / inc;
        color = color.darken(darknessVolume * (darknessFraction - 0.5));
      }
      colors[index1++] = color.red();
      colors[index1++] = color.green();
      colors[index1++] = color.blue();

      colors[index2++] = color.red();
      colors[index2++] = color.green();
      colors[index2++] = color.blue();
    }
    return colors;
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  static add(array: Array<number>, color: Color): void
  {
    array.push(color.red());
    array.push(color.green());
    array.push(color.blue());
  }
}

class Index
{
  public value = 0;
}
