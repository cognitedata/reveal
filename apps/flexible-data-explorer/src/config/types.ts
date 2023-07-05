import { type AddResourceOptions } from '@cognite/reveal-react-components';

export type DataModelConfig = {
  name: string;
  space: string;
  version: string;
};

export type ProjectConfig = {
  project: string;
  site: string;
  imageUrl?: string;
  description?: string;
  dataModels: DataModelConfig[];
  nodeSpaces?: string[];
  threeDResources?: AddResourceOptions[];

  // Files and ts are fetched from the Cognite API, users might have
  // different data sets for each site, so we need to specify which

  fileConfig?: {
    dataSetIds: string[];
  };
  timeseriesConfig?: {
    dataSetIds: string[];
  };
};
