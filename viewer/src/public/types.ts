/*!
 * Copyright 2020 Cognite AS
 */

import { NodeAppearanceProvider } from '@/datamodels/cad';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { SectorCuller } from '@/internal';

export type RevealOptions = {
  logMetrics?: boolean;
  nodeAppearanceProvider?: NodeAppearanceProvider;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
};

/**
 * Event notifying about a nodeId -> treeIndex map being loaded
 * as a result of parsing a sector.
 */
export type SectorNodeIdToTreeIndexMapLoadedEvent = {
  /**
   * Identifies the model the nodeID map was loaded for.
   */
  blobUrl: string;

  /**
   * Map defining a mapping from nodeId to treeIndex.
   */
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
