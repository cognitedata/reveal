/*!
 * Copyright 2020 Cognite AS
 */

import { NodeAppearanceProvider } from '../datamodels/cad';
import { SectorGeometry, SectorQuads } from '../datamodels/cad/rendering/types';
import { SectorCuller } from '../internal';
import { LoadingState } from '../utilities';

/**
 * Anti-aliasing modes supported by Reveal.
 */
export enum AntiAliasingMode {
  /**
   * No anti-aliasing (0).
   */
  NoAA = 0,
  /**
   * Fast-approximate anti-aliasing (FXAA) (1).
   */
  FXAA = 1
}

/**
 * Options and hints for how the Reveal viewer applies rendering effects.
 */
export type RenderOptions = {
  /**
   * Anti-aliasing mode used to avoid aliasing effects in the rendered view.
   */
  antiAliasing?: AntiAliasingMode;
  /**
   * When provided, Reveal will use multi-sampling to reduce aliasing effects when WebGL 2 is
   * available. Ignored if using WebGL 1.
   */
  multiSampleCountHint?: number;
};

/**
 * Defaults for {@ref RevealRenderOptions}.
 */
export const defaultRenderOptions: Required<RenderOptions> = {
  antiAliasing: AntiAliasingMode.FXAA,
  multiSampleCountHint: 1
};

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property nodeAppearanceProvider Style node by tree-index.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  nodeAppearanceProvider?: NodeAppearanceProvider;
  renderOptions?: RenderOptions;
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
};

/**
 * Event notifying about a nodeId -> treeIndex map being loaded
 * as a result of parsing a sector.
 * @property blobUrl Identifies the model the nodeID map was loaded for.
 * @property nodeIdToTreeIndexMap Map defining a mapping from nodeId to treeIndex.
 */
export type SectorNodeIdToTreeIndexMapLoadedEvent = {
  blobUrl: string;
  nodeIdToTreeIndexMap: Map<number, number>;
};

/**
 * Handler for SectorNodeIdToTreeIndexMapLoadedEvent.
 */
export type SectorNodeIdToTreeIndexMapLoadedListener = (event: SectorNodeIdToTreeIndexMapLoadedEvent) => void;

/**
 * Handler for events about data being loaded.
 */
export type LoadingStateChangeListener = (loadingState: LoadingState) => any;

export * from '../datamodels/pointcloud/types';
export * from './migration/types';

export { CadLoadingHints } from '../datamodels/cad/CadLoadingHints';
export { CadRenderHints } from '../datamodels/cad/rendering/CadRenderHints';

export { SupportedModelTypes } from '../datamodels/base';
export { CadModelMetadata } from '../datamodels/cad/CadModelMetadata';
export { NodeAppearanceProvider } from '../datamodels/cad/NodeAppearance';
