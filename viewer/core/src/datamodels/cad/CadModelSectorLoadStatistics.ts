/*!
 * Copyright 2021 Cognite AS
 */

export type CadModelSectorLoadStatistics = {
  /**
   * Estimated number of bytes to download sectors.
   */
  readonly downloadSize: number;
  /**
   * Estimated number of draw calls required to draw sectors.
   */
  readonly drawCalls: number;
  /**
   * Total number of sectors to load.
   */
  readonly loadedSectorCount: number;
  /**
   * Number of 'simple' sectors to load.
   */
  readonly simpleSectorCount: number;
  /**
   * Number of 'detailed' sectors to load.
   */
  readonly detailedSectorCount: number;
  /**
   * How many sectors that was "forced prioritized", e.g.
   * because they are near the camera.
   */
  readonly forcedDetailedSectorCount: number;
  /**
   * The total number of sectors in models we are loading.
   */
  readonly totalSectorCount: number;
  /**
   * How much of the prioritized nodes that are loaded (between 0 and 1).
   */
  readonly accumulatedPriority: number;
};
