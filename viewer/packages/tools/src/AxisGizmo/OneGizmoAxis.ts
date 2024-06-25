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
  readonly bubblePosition: Vector3; // The bubble position of the axis (changed by the camera)
  readonly label: string; // The label of the axis
  private readonly _lightColor: Color;
  private readonly _darkColor: Color;

  private constructor(axis: number, isPrimary: boolean, options: AxisGizmoOptions) {
    this.axis = axis;
    this.isPrimary = isPrimary;
    this.direction = this.createDirection();
    this.upAxis = this.createUpAxis();
    this.bubblePosition = new Vector3();
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
    return '#' + this._lightColor.getHexString();
  }

  public getDarkColorInHex(): string {
    return '#' + this._darkColor.getHexString();
  }

  public getColorFraction(): number {
    // Normalize between 1 and 0, since z is in range -1 to 1
    const mix = (this.bubblePosition.z + 1) / 2;

    // Interpolate this value lineary from minimum to 1:
    const minimum = 0.4;
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

  public static createAllAxes(options: AxisGizmoOptions): OneGizmoAxis[] {
    const axes: OneGizmoAxis[] = [];
    for (let axis = 0; axis <= 2; axis++) {
      axes.push(new OneGizmoAxis(axis, true, options));
      axes.push(new OneGizmoAxis(axis, false, options));
    }
    return axes;
  }
}
