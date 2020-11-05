/*!
 * Copyright 2020 Cognite AS
 */

import { NodeAppearanceProvider } from '../datamodels/cad';
import { SectorGeometry } from '../datamodels/cad/sector/types';
import { SectorQuads } from '../datamodels/cad/rendering/types';
import { SectorCuller } from '../internal';
import { LoadingState } from '../utilities';

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property nodeAppearanceProvider Style node by tree-index.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  nodeAppearanceProvider?: NodeAppearanceProvider;
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
