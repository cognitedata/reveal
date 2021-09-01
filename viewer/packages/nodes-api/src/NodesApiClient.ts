/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteInternalId } from '@cognite/sdk';

export interface NodesApiClient {
  mapTreeIndicesToNodeIds(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    treeIndices: number[]
  ): Promise<CogniteInternalId[]>;

  mapNodeIdsToTreeIndices(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeIds: CogniteInternalId[]
  ): Promise<number[]>;
}
