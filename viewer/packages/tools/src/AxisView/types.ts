/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { AxisViewTool } from './AxisViewTool';
import { Corner } from '../utilities/Corner';

/**
 * Configuration of {@link AxisViewTool}.
 */
export type AxisBoxConfig = {
  /**
   * Size in pixels of the axis tool.
   */
  size?: number;
  /**
   * Position, either absolute or relative.
   */
  position?: AbsolutePosition | RelativePosition;
  /**
   * How long the camera animation lasts when
   * clicking a face of the orientation box.
   */
  animationSpeed?: number;
  /**
   * Configuration for each of the faces of the orientation box.
   * Note that Reveal uses a right-handed Y up coordinate system,
   * which might differ from the original model space. To account
   * for this, you might want to reassign labels of the faces.
   */
  faces?: {
    xPositiveFace?: AxisBoxFaceConfig;
    xNegativeFace?: AxisBoxFaceConfig;
    yPositiveFace?: AxisBoxFaceConfig;
    yNegativeFace?: AxisBoxFaceConfig;
    zPositiveFace?: AxisBoxFaceConfig;
    zNegativeFace?: AxisBoxFaceConfig;
  };
  /**
   * Configuration of the compass "base" of the tool.
   */
  compass?: AxisBoxCompassConfig;
};

/**
 * Absolute position in pixels.
 */
export type AbsolutePosition = {
  xAbsolute: number;
  yAbsolute: number;
};

/**
 * Relative position from a corner of the viewer
 * and a given padding.
 */
export type RelativePosition = {
  corner: Corner;
  padding: THREE.Vector2;
};

/**
 * Configuration of each face of the orientation box.
 */
export type AxisBoxFaceConfig = {
  /**
   * Label of the respective face, e.g. 'X' or 'Right'.
   */
  label?: string;
  fontSize?: number;
  fontColor?: THREE.Color;
  outlineSize?: number;
  outlineColor?: THREE.Color;
  faceColor?: THREE.Color;
};

/**
 * Configuration of the compass.
 */
export type AxisBoxCompassConfig = {
  /**
   * Label of the orientation indicator. Defaults
   * to 'N' for north.
   */
  ringLabel?: string;
  /**
   * Offset in radians of the orientation indicator.
   */
  labelDelta?: number;
  fontSize?: number;
  fontColor?: THREE.Color;
  tickColor?: THREE.Color;
};

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

export const defaultAxisBoxConfig: Required<AxisBoxConfig> = {
  size: 128,
  position: {
    corner: Corner.BottomRight,
    padding: new THREE.Vector2()
  },
  animationSpeed: 200,
  faces: {
    xPositiveFace: {
      ...defaultFaceConfig,
      label: 'Right'
    },
    xNegativeFace: {
      ...defaultFaceConfig,
      label: 'Left'
    },
    yPositiveFace: {
      ...defaultFaceConfig,
      label: 'Up'
    },
    yNegativeFace: {
      ...defaultFaceConfig,
      label: 'Down'
    },
    zPositiveFace: {
      ...defaultFaceConfig,
      label: 'Front'
    },
    zNegativeFace: {
      ...defaultFaceConfig,
      label: 'Back'
    }
  },
  compass: defaultAxisBoxCompassConfig
};
