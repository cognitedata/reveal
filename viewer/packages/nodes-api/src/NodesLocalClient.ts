/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { NodesApiClient } from './NodesApiClient';

import { CogniteInternalId } from '@cognite/sdk';
import { NodeTreeIndexAndSubtreeSize } from './types';

export class NodesLocalClient implements NodesApiClient {
  constructor(_modelBaseUrl: string) {}

  mapTreeIndicesToNodeIds(
    _modelId: CogniteInternalId,
    _revisionId: CogniteInternalId,
    treeIndices: number[]
  ): Promise<CogniteInternalId[]> {
    return Promise.resolve(treeIndices);
  }

  mapNodeIdsToTreeIndices(
    _modelId: CogniteInternalId,
    _revisionId: CogniteInternalId,
    nodeIds: CogniteInternalId[]
  ): Promise<number[]> {
    return Promise.resolve(nodeIds);
  }

  /**
   * Determines tree index and subtreeSize (i.e. span of the subtree a node is parent
   * of) given a set of node IDs.
   */
  determineTreeIndexAndSubtreeSizesByNodeIds(
    _modelId: CogniteInternalId,
    _revisionId: CogniteInternalId,
    _nodeIds: CogniteInternalId[]
  ): Promise<NodeTreeIndexAndSubtreeSize[]> {
    throw new Error('Not supported for local models');
  }

  /**
   * Not supported.
   */
  determineNodeAncestorsByNodeId(
    _modelId: CogniteInternalId,
    _revisionId: CogniteInternalId,
    _nodeId: CogniteInternalId,
    _generation: number
  ): Promise<NodeTreeIndexAndSubtreeSize> {
    throw new Error('Not supported for local models');
  }

  /**
   * Not supported.
   */
  getBoundingBoxByNodeId(
    _modelId: CogniteInternalId,
    _revisionId: CogniteInternalId,
    _nodeId: CogniteInternalId,
    _box?: THREE.Box3
  ): Promise<THREE.Box3> {
    throw new Error('Not supported for local models');
  }
}
