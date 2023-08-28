import { type AddResourceOptions } from '@cognite/reveal-react-components';

import { DataModelV2 } from '../app/services/types';

export type DataModelConfig = {
  name: string;
  space: string;
  version: string;
};

export type ProjectConfig = {
  company: 'Cognite' | 'Celanese';
  project: string;
  sites?: SiteConfig[];
  /** Enable this if you want to be able to select data models under the 'custom' site (development projects only!) */
  showCustomSite?: boolean;
};

export type SiteConfig = {
  name: string;
  imageUrl?: string;
  description?: string;
  dataModels?: DataModelV2[];
  instanceSpaces?: string[];
  threeDResources?: AddResourceOptions[];

  // Files and ts are fetched from the Cognite API, users might have
  // different data sets for each site, so we need to specify which

  fileConfig?: {
    dataSetIds: number[];
  };
  timeseriesConfig?: {
    dataSetIds: number[];
  };
};
