/*
 * Copyright 2024 Cognite AS
 */

import { Corner } from '@reveal/utilities';

/**
 * Options for styling the AxisGizmo
 *
 */
export class AxisGizmoOptions {
  public corner: Corner = Corner.TopLeft;
  public size = 100;
  public margin = 100;
  public bubbleRadius = 9;
  public primaryLineWidth = 3; // If 0 invisible
  public secondaryLineWidth = 1; // If 0 invisible
  public bobbleLineWidth = 2; // If 0 invisible, only used on secondary axis
  public fontSize = '12px';
  public fontFamily = 'arial';
  public fontWeight = 'bold';
  public normalTextColor = '#151515';
  public selectedTextColor = '#FFFFFF';
  public focusCircleColor = '#888888';
  public focusCircleAlpha = 0.33; // If 0 the focus circle is invisible
  public fontYAdjust = 1;
  public lightColors = [0xf73c3c, 0x6ccb26, 0x178cf0]; // Light and dark color for the X, Y, Z-axis
  public darkColors = [0x942424, 0x417a17, 0x0e5490]; // Light and dark color for the X, Y, Z-axis

  private _font: string | undefined = undefined; // Lazy created due to speed

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
