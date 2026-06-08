/*!
 * Copyright 2021 Cognite AS
 */

import type { IndexSet } from '@reveal/utilities';
import * as THREE from 'three';

/**
 * Colors from the Cognite theme.
 */
export class CogniteColors {
  public static readonly Black: THREE.Color = new THREE.Color('rgb(0, 0, 0)');
  public static readonly White: THREE.Color = new THREE.Color('rgb(255, 255, 255)');
  public static readonly Cyan: THREE.Color = new THREE.Color('rgb(102, 213, 234)');
  public static readonly Blue: THREE.Color = new THREE.Color('rgb(77, 106, 242)');
  public static readonly Purple: THREE.Color = new THREE.Color('rgb(186, 82, 212)');
  public static readonly Pink: THREE.Color = new THREE.Color('rgb(232, 64, 117)');
  public static readonly Orange: THREE.Color = new THREE.Color('rgb(238, 113, 53)');
  public static readonly Yellow: THREE.Color = new THREE.Color('rgb(246, 189, 65)');
  public static readonly VeryLightGray: THREE.Color = new THREE.Color('rgb(247, 246, 245)');
  public static readonly LightGray: THREE.Color = new THREE.Color('rgb(242, 241, 240)');
}

/**
 * Some additional colors to supplement {@link CogniteColors}.
 */
export class RevealColors {
  public static readonly Red: THREE.Color = new THREE.Color('rgb(235,0,4)');
  public static readonly Green: THREE.Color = new THREE.Color('rgb(46,164,79)');
}

export type StyledTreeIndexSets = {
  back: IndexSet;
  ghost: IndexSet;
  inFront: IndexSet;
  visible: IndexSet;
};
