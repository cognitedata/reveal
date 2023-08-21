/*!
 * Copyright 2023 Cognite AS
 */
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';

export type ThreeDModelMappings = {
  modelId: number;
  revisionId: number;
  mappings: Map<CogniteExternalId, Node3D>;
};

export type Model3DEdgeProperties = {
  revisionId: number;
  revisionNodeId: number;
};
