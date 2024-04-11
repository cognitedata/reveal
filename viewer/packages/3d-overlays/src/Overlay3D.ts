/*!
 * Copyright 2023 Cognite AS
 */

import { Color, Vector3 } from 'three';

/**
 * Represents one 3d overlay
 */
export type Overlay3D<ContentType> = {
  /**
   * Set whether this overlay should be visible.
   * */
  setVisible(visible: boolean): void;
  /**
   * Get whether this overlay is visible.
   */
  getVisible(): boolean;
  /**
   * Get the position of this overlay.
   */
  getPosition(): Vector3;
  /**
   * Set the display color of this overlay.
   * */
  setColor(color: Color): void;
  /**
   * Get the display color of this overlay.
   * */
  getColor(): Color;
  /**
   * Get the metadata associated with this overlay.
   * */
  getContent(): ContentType;
};
