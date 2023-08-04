/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteExternalId, type CogniteInternalId } from '@cognite/sdk';
import { type Source } from '../utilities/FdmSDK';

export type FdmAssetMappingsConfig = {
  /**
   * 3D Data model source
   */
  source: Source;
  /*
   * FDM space where model assets are located
   */
  assetFdmSpace: string;
  /*
   * Global FDM 3D space
   * TODO: Remove when the system data model is functional
   */
  global3dSpace: string;
};

export type ThreeDModelMappings = {
  modelId: number;
  revisionId: number;
  mappings: Map<CogniteExternalId, CogniteInternalId>;
};

export type Model3DEdgeProperties = {
  revisionId: number;
  revisionNodeId: number;
};
