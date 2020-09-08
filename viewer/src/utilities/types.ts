/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';

import { mat4 } from 'gl-matrix';

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  RevealCadModel = 'reveal-directory',
  AnyFormat = 'all-outputs'
}

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
 * Represents the transformation matrix for a model. Stores both the model matrix and the inverse matrix.
 */
export type ModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};

/**
 * State holding information about data being loaded.
 */
export type LoadingState = {
  isLoading: boolean;
  itemsLoaded: number;
  itemsRequested: number;
};

/**
 * Represents a camera configuration, consisting of a camera position and target.
 */
export type CameraConfiguration = {
  readonly position: THREE.Vector3;
  readonly target: THREE.Vector3;
};
