/*!
 * Copyright 2020 Cognite AS
 */

import { NodeAppearanceProvider } from '@/datamodels/cad';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { SectorCuller } from '@/internal';

/**
 * @property logMetrics might be used to disable usage statistics
 * @property nodeAppearanceProvider style node by tree-index
 * @property internal internals are for internal usage only (like unit-testing)
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
export type LoadingStateChangeListener = (isLoading: boolean) => any;
