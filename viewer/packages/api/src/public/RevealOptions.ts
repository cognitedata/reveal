/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { RenderOptions } from '@reveal/rendering';
import { InternalRevealCadOptions } from '@reveal/cad-geometry-loaders';

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property movingCameraResolutionFactor Factor with which the resolution (number of screen pixels) is scaled
 * when camera is moving.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  renderOptions?: RenderOptions;
  continuousModelStreaming?: boolean;
  outputRenderTarget?: { target: THREE.WebGLRenderTarget; autoSize?: boolean };
  rendererResolutionThreshold?: number;
  movingCameraResolutionFactor?: number;
  internal?: {
    cad?: InternalRevealCadOptions;
  };
};
