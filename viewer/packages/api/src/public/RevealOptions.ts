/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { RenderOptions } from '@reveal/rendering';
import { InternalRevealCadOptions } from '@reveal/cad-geometry-loaders';

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property nodeAppearanceProvider Style node by tree-index.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  renderOptions?: RenderOptions;
  continuousModelStreaming?: boolean;
  outputRenderTarget?: { target: THREE.WebGLRenderTarget; autoSize?: boolean };
  rendererResolutionThreshold?: number;
  internal?: {
    cad?: InternalRevealCadOptions;
  };
};
