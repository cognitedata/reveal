/*!
 * Copyright 2019 Cognite AS
 */

/**
 * Style that modifies how CAD sectors are loaded.
 */
export type CadLoadingStyle = {
  /**
   * The largest size low detail geometry (quads) can be before they are refined
   * relative to screen size.
   */
  maxQuadSize?: number;
};
