/*!
 * Copyright 2020 Cognite AS
 */

import { RenderMode } from './threejs/materials';

/**
 * Style hints that allows overriding how a CadNode (and its children)
 * are rendered.
 */
export interface CadRenderHints {
  showSectorBoundingBoxes?: boolean;
  renderMode?: RenderMode;
}
