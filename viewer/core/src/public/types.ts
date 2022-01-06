/*!
 * Copyright 2021 Cognite AS
 */

import { LoadingState, SectorCuller } from '@reveal/cad-geometry-loaders';
import { SectorQuads, RenderOptions } from '@reveal/rendering';
import { SectorGeometry } from '@reveal/cad-parsers';

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property nodeAppearanceProvider Style node by tree-index.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  renderOptions?: RenderOptions;
  continuousModelStreaming?: boolean;
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
};

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

/**
 * Handler for events about data being loaded.
 */
export type LoadingStateChangeListener = (loadingState: LoadingState) => any;

export * from '../datamodels/pointcloud/types';
export * from './migration/types';

export { SupportedModelTypes } from '../datamodels/base';
