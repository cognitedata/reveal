export type DataModelConfig = {
  name: string;
  space: string;
  version: string;
};

export type ModelIdentifier = {
  type: 'cad' | 'pointcloud';
  modelId: number;
  revisionId: number;
};

export type ThreeDResource = ModelIdentifier | Collection360;

export type Collection360 = {
  siteId: string;
};

export type ProjectConfig = {
  project: string;
  site: string;
  imageUrl?: string;
  description?: string;
  dataModels: DataModelConfig[];
  nodeSpaces?: string[];
  threeDResources?: ThreeDResource[];

  // Files and ts are fetched from the Cognite API, users might have
  // different data sets for each site, so we need to specify which

  fileConfig?: {
    dataSetIds: string[];
  };
  timeseriesConfig?: {
    dataSetIds: string[];
  };
};
