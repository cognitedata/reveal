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
  };
  
  export type ThreeDModelMappings = {
    modelId: number;
    revisionId: number;
    mappings: Array<{ nodeId: number; externalId: string }>;
  };