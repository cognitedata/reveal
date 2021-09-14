/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

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

  /**
   * Determine ancestor subtree span of a given node. If the node doesn't have an
   * ancestor at the generation given, the span of the root node is returned.
   * @param modelId       ID of 3D model
   * @param revisionId    ID of 3D model revision
   * @param nodeId        Node ID of node
   * @param generation    Generation to retrieve (0 means node itself, 1 is parent, 2 grand-parent etc).
   */
  determineNodeAncestorsByNodeId(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    generation: number
  ): Promise<NodeTreeIndexAndSubtreeSize>;

  /**
   * Determines the bounds of the node provided. Note that the returned
   * box returned will be in "CDF coordinates" and not transformed using
   * the model transformation for the given model.
   *
   * @param modelId       ID of 3D model
   * @param revisionId    ID of 3D model revision
   * @param nodeId        Node ID of node
   * @param box           Pre-allocated THREE.Box3 (optional).
   */
  getBoundingBoxByNodeId(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    box?: THREE.Box3
  ): Promise<THREE.Box3>;
}
