/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteExternalId, type CogniteInternalId } from '@cognite/sdk';

export type ThreeDModelMappings = {
  modelId: number;
  revisionId: number;
  mappings: Map<CogniteExternalId, CogniteInternalId>;
};

export type Model3DEdgeProperties = {
  revisionId: number;
  revisionNodeId: number;
};
