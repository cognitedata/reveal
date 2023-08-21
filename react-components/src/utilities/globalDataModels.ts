/*!
 * Copyright 2023 Cognite AS
 */
import { type DmsUniqueIdentifier, type Source } from './FdmSDK';

export const SYSTEM_SPACE_3D_SCHEMA = 'cdf_3d_schema'; // Data model, views, containers and types for edges

export const INSTANCE_SPACE_3D_DATA = 'cog_3d_data'; // Instances of 3D models

// Type of edge that connects equipment to 3D
export const SYSTEM_3D_EDGE_TYPE: DmsUniqueIdentifier = {
  externalId: 'cdf3dEntityConnection',
  space: SYSTEM_SPACE_3D_SCHEMA
};

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
