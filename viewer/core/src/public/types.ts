/*!
 * Copyright 2021 Cognite AS
 */

import { SectorCuller, LoadingState } from '@reveal/cad-geometry-loaders';
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

/**
 * Handler for events about data being loaded.
 */
export type LoadingStateChangeListener = (loadingState: LoadingState) => any;

export * from '../datamodels/pointcloud/types';
export * from './migration/types';
