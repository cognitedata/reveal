/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

export { File3dFormat } from '@reveal/cad-parsers';

/**
 * Colors from the Cognite theme.
 */
export class CogniteColors {
  public static readonly Black = new THREE.Color('rgb(0, 0, 0)');
  public static readonly White = new THREE.Color('rgb(255, 255, 255)');
  public static readonly Cyan = new THREE.Color('rgb(102, 213, 234)');
  public static readonly Blue = new THREE.Color('rgb(77, 106, 242)');
  public static readonly Purple = new THREE.Color('rgb(186, 82, 212)');
  public static readonly Pink = new THREE.Color('rgb(232, 64, 117)');
  public static readonly Orange = new THREE.Color('rgb(238, 113, 53)');
  public static readonly Yellow = new THREE.Color('rgb(246, 189, 65)');
  public static readonly VeryLightGray = new THREE.Color('rgb(247, 246, 245)');
  public static readonly LightGray = new THREE.Color('rgb(242, 241, 240)');
}

/**
 * Some additional colors to supplement {@link CogniteColors}.
 */
export class RevealColors {
  public static readonly Red = new THREE.Color('rgb(235,0,4)');
  public static readonly Green = new THREE.Color('rgb(46,164,79)');
}

/**
 * State holding information about data being loaded.
 */
export type LoadingState = {
  /**
   * Indicates if we are currently loading more data.
   */
  isLoading: boolean;
  /**
   * Items loaded so far in this batch.
   */
  itemsLoaded: number;
  /**
   * Totals number of items to load in this batch.
   */
  itemsRequested: number;
  /**
   * Number of items that has been 'culled' (i.e. deemed not necessary
   * to load) so far in this batch.
   */
  itemsCulled: number;
};

/**
 * General typed array.
 *
 * Note that this doesn't include BigInt64Array and BigUint64Array as
 * the type of these is not number which causes some type interference problems.
 */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;

