/*!
 * Copyright 2024 Cognite AS
 */

import { type ColorInterpolation } from './ColorInterpolation';
import { type Color } from 'three';
import { ColorMapItem } from './ColorMapItem';
import { compare } from '../extensions/mathExtensions';
import { ColorMapType } from './ColorMapType';
import {
  BLACK_COLOR,
  MAX_BYTE,
  WHITE_COLOR,
  fractionToByte,
  getMixedColor
} from './colorExtensions';
import { type Range1 } from '../geometry/Range1';

export const BYTE_PR_COLOR = 4; // RGBA
export const TEXTURE_1D_WIDTH = 2; // Width 2 because this is the minimum
const TEXTURE_1D_SIZE = 1000;

export class ColorMap {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _items: ColorMapItem[] = [];
  private _maxIndex: number = 0;
  public colorMapType: ColorMapType = ColorMapType.None;

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getColor(fraction: number): Color {
    // Assume a limited number of colors, otherwise a binary search should be used.
    for (let i = 0; i <= this._maxIndex; i++) {
      const item = this._items[i];
      if (fraction > item.fraction) {
        continue;
      }
      if (i === 0) {
        return item.color;
      }
      return this._items[i - 1].getMixed(item, fraction);
    }
    return this._items[this._maxIndex].color;
  }

  private getColorFast(fraction: number, indexInColorMap: Index): Color {
    // Assume a limited number of colors, otherwise a binary search should be used.
    for (; indexInColorMap.value <= this._maxIndex; indexInColorMap.value++) {
      const item = this._items[indexInColorMap.value];
      if (fraction > item.fraction) {
        continue;
      }
      if (indexInColorMap.value === 0) {
        return item.color;
      }
      return this._items[indexInColorMap.value - 1].getMixed(item, fraction);
    }
    return this._items[this._maxIndex].color;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public add(color: Color, fraction: number, interpolation: ColorInterpolation): void {
    this._items.push(new ColorMapItem(color, fraction, interpolation));
    // Make it consistent:
    this._items.sort((a, b) => compare(a.fraction, b.fraction));
    this._maxIndex = this._items.length - 1;
  }

  public reverse(): void {
    this._items.reverse();
    for (const item of this._items) {
      item.fraction = 1 - item.fraction;
    }
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public createColors(size: number = TEXTURE_1D_SIZE): Uint8Array {
    const rgbaArray = new Uint8Array(size * BYTE_PR_COLOR * TEXTURE_1D_WIDTH);
    const indexInColorMap = new Index();

    for (let index1 = 0, index2 = size; index1 < size; index1++, index2++) {
      const fraction = index1 / (size - 1);
      const color = this.getColorFast(fraction, indexInColorMap);
      setAt(rgbaArray, index1, color);
      setAt(rgbaArray, index2, color);
    }
    return rgbaArray;
  }

  public createColorsWithContours(
    range: Range1,
    increment: number,
    volume: number,
    solidColor?: Color,
    size: number = TEXTURE_1D_SIZE
  ): Uint8Array {
    const rgbaArray = new Uint8Array(size * BYTE_PR_COLOR * TEXTURE_1D_WIDTH);
    const indexInColorMap = new Index();
    for (let index1 = 0, index2 = size; index1 < size; index1++, index2++) {
      const fraction = index1 / (size - 1);
      const level = range.getValue(fraction);
      const reminder = level % increment;
      const contourFraction = reminder / increment;

      // Get color in the middle
      const middleLevel = level - reminder + increment / 2;
      const middleFraction = range.getFraction(middleLevel);

      let color = solidColor ?? this.getColorFast(middleFraction, indexInColorMap);
      if (contourFraction < 0.5) {
        color = getMixedColor(WHITE_COLOR, color, volume * (0.5 - contourFraction));
      } else {
        color = getMixedColor(BLACK_COLOR, color, volume * (contourFraction - 0.5));
      }
      setAt(rgbaArray, index1, color);
      setAt(rgbaArray, index2, color);
    }
    return rgbaArray;
  }
}

function setAt(rgbaArray: Uint8Array, index: number, color: Color): void {
  const i = index * BYTE_PR_COLOR;
  rgbaArray[i + 0] = fractionToByte(color.r);
  rgbaArray[i + 1] = fractionToByte(color.g);
  rgbaArray[i + 2] = fractionToByte(color.b);
  rgbaArray[i + 3] = MAX_BYTE;
}

class Index {
  public value: number;
  constructor(value = 0) {
    this.value = value;
  }
}
