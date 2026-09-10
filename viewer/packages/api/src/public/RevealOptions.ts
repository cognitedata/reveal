/*!
 * Copyright 2022 Cognite AS
 */

import type { WebGLRenderTarget } from 'three';

import type { RenderOptions } from '@reveal/rendering';
import type { InternalRevealCadOptions } from '@reveal/cad-geometry-loaders';

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
  outputRenderTarget?: { target: WebGLRenderTarget; autoSize?: boolean };
  rendererResolutionThreshold?: number;
  internal?: {
    cad?: InternalRevealCadOptions;
  };
};
