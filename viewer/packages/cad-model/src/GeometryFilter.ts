/*!
 * Copyright 2022 Cognite AS
 */

export interface GeometryFilter {
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
}
