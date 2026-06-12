/*!
 * Copyright 2021 Cognite AS
 */

import type { IndexSet } from '@reveal/utilities';
import { Color } from 'three';

/**
 * Colors from the Cognite theme.
 */
export class CogniteColors {
  public static readonly Black = new Color('rgb(0, 0, 0)');
  public static readonly White = new Color('rgb(255, 255, 255)');
  public static readonly Cyan = new Color('rgb(102, 213, 234)');
  public static readonly Blue = new Color('rgb(77, 106, 242)');
  public static readonly Purple = new Color('rgb(186, 82, 212)');
  public static readonly Pink = new Color('rgb(232, 64, 117)');
  public static readonly Orange = new Color('rgb(238, 113, 53)');
  public static readonly Yellow = new Color('rgb(246, 189, 65)');
  public static readonly VeryLightGray = new Color('rgb(247, 246, 245)');
  public static readonly LightGray = new Color('rgb(242, 241, 240)');
}

/**
 * Some additional colors to supplement {@link CogniteColors}.
 */
export class RevealColors {
  public static readonly Red = new Color('rgb(235,0,4)');
  public static readonly Green = new Color('rgb(46,164,79)');
}

export type StyledTreeIndexSets = {
  back: IndexSet;
  ghost: IndexSet;
  inFront: IndexSet;
  visible: IndexSet;
};
