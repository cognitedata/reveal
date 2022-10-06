/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Units supported by {@link Cognite3DModel}.
 */
export type WellKnownUnit =
  | 'Meters'
  | 'Centimeters'
  | 'Millimeters'
  | 'Micrometers'
  | 'Kilometers'
  | 'Feet'
  | 'Inches'
  | 'Yards'
  | 'Miles'
  | 'Mils'
  | 'Microinches';

export type GeometryFilter = {
  /**
   * The bounds to load geometry within. By default this box is in CDF coordinate space which
   * will be transformed into coordinates relative to the model using the the model transformation
   * which can be specified using {@link https://docs.cognite.com/api/v1/#operation/update3DRevisions |the CDF API},
   * or set in {@link https://fusion.cognite.com/ |Cognite Fusion}.
   * @see {@link isBoundingBoxInModelCoordinates}.
   */
  boundingBox?: THREE.Box3;

  /**
   * When set, the geometry filter {@link boundingBox} will be considered to be in "Reveal/ThreeJS space".
   * Rather than CDF space which is the default. When using Reveal space, the model transformation
   * which can be specified using {@link https://docs.cognite.com/api/v1/#operation/update3DRevisions |the CDF API},
   * or set in {@link https://fusion.cognite.com/ |Cognite Fusion}.
   */
  isBoundingBoxInModelCoordinates?: boolean;
};

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
