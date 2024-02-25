/*
 * Copyright 2024 Cognite AS
 */

import { Color, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';

/**
 * This class is used internally in AxisGizmoTool
 * @beta
 */
export class OneGizmoAxis {
  readonly axis: number; // 0=X, 1=Y, 2=Z
  readonly isPrimary: boolean; // True if positive direction, false if negative
  readonly direction: Vector3; // The camera direction towards the axis (negate of the axis direction)
  readonly upAxis: Vector3; // The camera up axis
  readonly bobblePosition: Vector3; // The bobble position of the axis (changed by the camera)
  readonly label: string; // The label of the axis
  private readonly _lightColor: Color;
  private readonly _darkColor: Color;
  private readonly _mixedLightColor: Color = new Color(); // Used to mix the light color with black
  private readonly _mixedDarkColor: Color = new Color(); // Used to mix the dark color with black

  private constructor(axis: number, isPrimary: boolean, options: AxisGizmoOptions) {
    this.axis = axis;
    this.isPrimary = isPrimary;
    this.direction = this.createDirection();
    this.upAxis = this.createUpAxis();
    this.bobblePosition = new Vector3();
    this.label = options.useGeoLabels ? this.createGeoLabel() : this.createMathLabel(options.yUp);
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

  private createGeoLabel(): string {
    switch (this.axis) {
      case 0:
        return this.isPrimary ? 'E' : 'W';
      case 1:
        return this.isPrimary ? 'N' : 'S';
      case 2:
        return this.isPrimary ? 'U' : 'D';
      default:
        return '';
    }
  }

  private createMathLabel(yUp: boolean): string {
    const name = this.getMathAxisName(yUp);
    if (this.isPrimary) {
      return name;
    }
    return '-' + name;
  }

  private getMathAxisName(yUp: boolean): string {
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

  private createUpAxis(): Vector3 {
    // Get the camera up axis with right handed axis-system and Z-axis is up
    if (this.axis == 2) {
      return this.isPrimary ? new Vector3(0, 1, 0) : new Vector3(0, -1, 0);
    }
    return new Vector3(0, 0, 1);
  }

  private createDirection(): Vector3 {
    // Get the direction for the axis with right handed axis-system and Z-axis is up
    const getCoord = (forAxis: number): number => {
      return this.axis == forAxis ? 1 : 0;
    };
    const direction = new Vector3(getCoord(0), getCoord(1), getCoord(2));
    if (this.isPrimary) {
      direction.negate();
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
