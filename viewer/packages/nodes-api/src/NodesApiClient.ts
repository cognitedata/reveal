/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteInternalId } from '@cognite/sdk';
import { NodeTreeIndexAndSubtreeSize } from './types';

export interface NodesApiClient {
  /**
   * Maps a set of "tree indexes" that identify nodes, to the respective
   * "node IDs".
   */
  mapTreeIndicesToNodeIds(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndices: number[]
  ): Promise<CogniteInternalId[]>;

  /**
   * Maps a set of "node IDs" that identify nodes, to the respective
   * "tree indexes".
   */
  mapNodeIdsToTreeIndices(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeIds: CogniteInternalId[]
  ): Promise<number[]>;

  /**
   * Determines tree index and subtreeSize (i.e. span of the subtree a node is parent
   * of) given a set of node IDs.
   */
  determineTreeIndexAndSubtreeSizesByNodeIds(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeIds: CogniteInternalId[]
  ): Promise<NodeTreeIndexAndSubtreeSize[]>;
}
