/*
 * Copyright 2024 Cognite AS
 */

import { Color, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';

export class OneGizmoAxis {
  readonly direction: Vector3;
  readonly bobblePosition: Vector3;
  readonly label: string;
  readonly axis: number;
  readonly isPrimary: boolean;
  private readonly _lightColor: Color;
  private readonly _darkColor: Color;
  private readonly _mixedLightColor: Color = new Color();
  private readonly _mixedDarkColor: Color = new Color();

  private constructor(axis: number, isPrimary: boolean, options: AxisGizmoOptions) {
    this.axis = axis;
    this.isPrimary = isPrimary;
    this.direction = this.createDirection();
    this.bobblePosition = new Vector3();
    this.label = this.createLabel(options.yUp);
    let index = axis;
    if (options.yUp) {
      if (index === 1) index = 2;
      else if (index === 2) index = 1;
    }
    this._lightColor = new Color(options.lightColors[index]);
    this._darkColor = new Color(options.darkColors[index]);
  }

  public getLightColorInHex(): string {
    return '#' + this.getLightColor().getHexString();
  }

  public getDarkColorInHex(): string {
    return '#' + this.getDarkColor().getHexString();
  }

  private getLightColor(): Color {
    // Mix the original color with black by the getColorFraction
    this._mixedLightColor.copy(this._lightColor);
    this._mixedLightColor.multiplyScalar(this.getColorFraction());
    return this._mixedLightColor;
  }

  private getDarkColor(): Color {
    // Mix the original color with black by the getColorFraction
    this._mixedDarkColor.copy(this._darkColor);
    this._mixedDarkColor.multiplyScalar(this.getColorFraction());
    return this._mixedDarkColor;
  }

  private getColorFraction(): number {
    // Normalize between 1 and 0, since z is in range -1 to 1
    const mix = (this.bobblePosition.z + 1) / 2;

    // Interpolate this value lineary from minimum to 1:
    const minimum = 0.2;
    return minimum + (1 - minimum) * mix;
  }

  private createLabel(yUp: boolean): string {
    const labelPrefix = this.isPrimary ? '' : '-';
    return labelPrefix + this.getAxisName(yUp);
  }

  private getAxisName(yUp: boolean): string {
    switch (this.axis) {
      case 0:
        return 'X';
      case 1:
        return yUp ? 'Z' : 'Y';
      case 2:
        return yUp ? 'Y' : 'Z';
      default:
        return '';
    }
  }

  public createUpAxis(): Vector3 {
    // Get the camera up axis with right handed axissystem and up is Z-axis
    switch (this.axis) {
      case 2:
        return this.isPrimary ? new Vector3(0, 1, 0) : new Vector3(0, -1, 0);
      default:
        return new Vector3(0, 0, 1);
    }
  }

  private createDirection(): Vector3 {
    // Get the direction for the axis with right handed axissystem and up is Z-axis
    const getCoord = (forAxis: number): number => {
      return this.axis == forAxis ? 1 : 0;
    };
    const direction = new Vector3(getCoord(0), getCoord(1), getCoord(2));
    if (!this.isPrimary) {
      direction.negate();
    }
    if (this.axis != 0) {
      direction.negate(); // I don't understand way this is needed
    }
    return direction;
  }

  public static createAllAxises(options: AxisGizmoOptions): OneGizmoAxis[] {
    const axises: OneGizmoAxis[] = [];
    for (let axis = 0; axis <= 2; axis++) {
      axises.push(new OneGizmoAxis(axis, true, options));
      axises.push(new OneGizmoAxis(axis, false, options));
    }
    return axises;
  }
}
