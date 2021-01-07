/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Style hints that allows overriding how a CadNode (and its children)
 * are rendered.
 */
export interface CadRenderHints {
  /** Use to specify if bounding boxes for each sector should be visible */
  showSectorBoundingBoxes?: boolean;
}
