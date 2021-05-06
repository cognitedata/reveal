/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export type AxisBoxConfig = {
  size?: number;
  position?: Absolute | Relative;
  faces?: {
    xPositiveFace?: AxisBoxFaceConfig;
    xNegativeFace?: AxisBoxFaceConfig;
    yPositiveFace?: AxisBoxFaceConfig;
    yNegativeFace?: AxisBoxFaceConfig;
    zPositiveFace?: AxisBoxFaceConfig;
    zNegativeFace?: AxisBoxFaceConfig;
  };
  compass?: AxisBoxCompassConfig;
};

export type Absolute = {
  xAbsolute: number;
  yAbsolute: number;
};

export type Relative = {
  corner: Corner;
  padding: THREE.Vector2;
};

export type AxisBoxFaceConfig = {
  label?: string;
  fontSize?: number;
  fontColor?: THREE.Color;
  outlineSize?: number;
  outlineColor?: THREE.Color;
  faceColor?: THREE.Color;
};

export type AxisBoxCompassConfig = {
  ringLabel?: string;
  labelDelta?: number;
  fontSize?: number;
  tickColor?: THREE.Color;
  fontColor?: THREE.Color;
};

export enum Corner {
  TopRight,
  TopLeft,
  BottomLeft,
  BottomRight
}

export const defaultAxisBoxCompassConfig: AxisBoxCompassConfig = {
  ringLabel: 'N',
  labelDelta: Math.PI,
  fontSize: undefined,
  fontColor: new THREE.Color(0xff0000),
  tickColor: new THREE.Color(0x949494)
};

export const defaultFaceConfig: AxisBoxFaceConfig = {
  label: '',
  fontSize: undefined,
  fontColor: new THREE.Color(0x333333),
  outlineSize: undefined,
  outlineColor: new THREE.Color(0x333333),
  faceColor: new THREE.Color(0x949494)
};

export const defaultAxisBoxConfig: AxisBoxConfig = {
  size: 128,
  position: {
    corner: Corner.BottomRight,
    padding: new THREE.Vector2()
  },
  faces: {
    xPositiveFace: {
      ...defaultFaceConfig,
      label: 'X'
    },
    xNegativeFace: {
      ...defaultFaceConfig,
      label: '-X'
    },
    yPositiveFace: {
      ...defaultFaceConfig,
      label: 'Y'
    },
    yNegativeFace: {
      ...defaultFaceConfig,
      label: '-Y'
    },
    zPositiveFace: {
      ...defaultFaceConfig,
      label: 'Z'
    },
    zNegativeFace: {
      ...defaultFaceConfig,
      label: '-Z'
    }
  },
  compass: defaultAxisBoxCompassConfig
};
