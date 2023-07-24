import {
  assetsMockData,
  datasetsMockData,
  eventsMockData,
  timeseriesMockData,
  datapointsMockData,
  filesMockData,
  groupsMockData,
  transformationsMockData,
  fdmSpacesMockData,
  fdmContainersMockData,
  fdmViewsMockData,
  fdmInstancesMockData,
  fdmDataModelsMockData,
} from '@fusion/mock-data';

import { MockData } from './app/types';

export const mockDataSample = {
  assets: assetsMockData,
  timeseries: timeseriesMockData,
  datapoints: datapointsMockData,
  events: eventsMockData,
  datasets: datasetsMockData,
  files: filesMockData,
  groups: groupsMockData,
  transformations: transformationsMockData,
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],

  // dms v3 stuff
  dmsV3Spaces: fdmSpacesMockData,
  dmsV3Views: fdmViewsMockData,
  dmsV3Containers: fdmContainersMockData,
  containers: fdmContainersMockData,
  views: fdmViewsMockData,
  instances: fdmInstancesMockData,
  datamodels: fdmDataModelsMockData,
} as MockData;
