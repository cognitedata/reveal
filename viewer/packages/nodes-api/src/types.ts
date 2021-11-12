/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteInternalId } from '@cognite/sdk';

export type ByTreeIndicesResponse = {
  items: CogniteInternalId[];
};

export type ByNodeIdsResponse = {
  items: number[];
};

export type NodeTreeIndexAndSubtreeSize = {
  treeIndex: number;
  subtreeSize: number;
};
