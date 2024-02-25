/*
 * Copyright 2024 Cognite AS
 */

import { Corner } from '@reveal/utilities';

/**
 * Options for styling the AxisGizmo
 * @beta
 */
export class AxisGizmoOptions {
  public corner: Corner = Corner.BottomRight;
  public yUp = false;
  public size = 100;
  public edgeMargin = 10;
  public bubbleRadius = 9;
  public primaryLineWidth = 3; // If 0 invisible
  public secondaryLineWidth = 0; // If 0 invisible
  public bobbleLineWidth = 2; // If 0 invisible, only used on secondary axis
  public useGeoLabels = true; // If true use EW-NS-UD, otherwise use XYZ or -XYZ
  public fontSize = '12px';
  public fontFamily = 'arial';
  public fontWeight = 'bold';
  public normalTextColor = '#151515';
  public selectedTextColor = '#FFFFFF';
  public focusCircleColor = '#888888';
  public focusCircleAlpha = 0.33; // If 0 the focus circle is invisible
  public fontYAdjust = 1;
  public lightColors = [0xf73c3c, 0x178cf0, 0x6ccb26]; // Light color for the X, Y and Z-axis
  public darkColors = [0x942424, 0x0e5490, 0x417a17]; // Dark color for the X, Y and Z-axis
  public animationDuration = 1000; // In milliseconds

  private _font: string | undefined = undefined; // Lazy created due to speed

  get radius(): number {
    return this.size / 2;
  }
  /**
   * Get the font style.
   * @returns The font style.
   */
  public getFont(): string {
    if (!this._font) {
      this._font = [this.fontWeight, this.fontSize, this.fontFamily].join(' ');
    }
    return this._font;
  }
}
