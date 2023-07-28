/*!
 * Copyright 2023 Cognite AS
 */
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
   */
  global3dSpace: string;
};

export type ThreeDModelMappings = {
  modelId: number;
  revisionId: number;
  mappings: Array<{ nodeId: number; externalId: string }>;
};
