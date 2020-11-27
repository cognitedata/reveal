import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DataSet, IdEither } from '@cognite/sdk';
import { Integration } from '../model/Integration';
import { IntegrationAPIResponse } from '../model/IntegrationAPIResponse';
import get from './baseURL';

export const getIntegrations = async (
  project: string
): Promise<Integration[]> => {
  const response = await get<IntegrationAPIResponse>('/integrations', project);
  return response.data.items;
};

export const getDataSets = async (ids: IdEither[]): Promise<DataSet[]> => {
  const res = await sdkv3.datasets.retrieve(ids);
  return res;
};
