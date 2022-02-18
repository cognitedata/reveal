import { MockData } from './app/types';
import {
  assetsMockData,
  datasetsMockData,
  eventsMockData,
  timeseriesMockData,
  datapointsMockData,
  templategroupsMockData,
  templatesMockData,
} from '@platypus/mock-data';

export const mockDataSample = {
  assets: assetsMockData,
  timeseries: timeseriesMockData,
  datapoints: datapointsMockData,
  events: eventsMockData,
  datasets: datasetsMockData,
  templategroups: templategroupsMockData,
  templates: templatesMockData,
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
} as MockData;
