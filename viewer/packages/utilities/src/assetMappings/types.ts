/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteInternalId, UnitDMSUniqueIdentifier } from '@cognite/sdk';

/**
 * A CAD asset mapping that is guaranteed to contain treeIndex and subtreeSize. The only CAD asset
 * mappings that don't satisfy this rule are from very old CAD models (about pre-2023).
 */
export type CdfAssetMapping = {
  /**
   * Tree index of the mapped node
   */
  treeIndex: number;
  /**
   * Size of the subtree with the mapped node as root
   */
  subtreeSize: number;
  /**
   * The node id of the mapped node
   */
  nodeId: CogniteInternalId;
  /**
   * The id of the asset mapped to the node
   */
  assetId: CogniteInternalId;
  /**
   * The ID of the associated Cognite Asset instance from Core Data Model.
   */
  assetInstanceId?: UnitDMSUniqueIdentifier;
};
