/*!
 * Copyright 2023 Cognite AS
 */
import { type Source } from '../FdmSDK';

export const SYSTEM_SPACE_3D_SCHEMA = 'cdf_3d_schema'; // Data model, views, containers and types for edges

export const SYSTEM_SPACE_3D_MODEL_ID = 'Cdf3dModel';
export const SYSTEM_SPACE_3D_MODEL_VERSION = '1';

// Source of view that contains edge properties
export const SYSTEM_3D_EDGE_SOURCE: Source = {
  type: 'view',
  version: '1',
  externalId: 'Cdf3dConnectionProperties',
  space: SYSTEM_SPACE_3D_SCHEMA
};

export type InModel3dEdgeProperties = {
  revisionId: number;
  revisionNodeId: number;
};
