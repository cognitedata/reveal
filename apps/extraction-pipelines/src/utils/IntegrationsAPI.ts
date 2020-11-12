import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DataSet, IdEither } from '@cognite/sdk';
import { Integration } from '../model/Integration';
import { IntegrationAPIResponse } from '../model/IntegrationAPIResponse';

const getBaseUrl = (project: string): string => {
  return `https://greenfield.cognitedata.com/api/playground/projects/${project}/integrations`;
};

const get = async <D>(route: string, project: string) => {
  return sdkv3.get<D>(`${getBaseUrl(project)}${route}`, {
    withCredentials: true,
  });
};

export const getIntegrations = async (
  project: string
): Promise<Integration[]> => {
  const response = await get<IntegrationAPIResponse>('/', project);
  return response.data.items;
};

export const getDataSets = async (ids: IdEither[]): Promise<DataSet[]> => {
  const res = await sdkv3.datasets.retrieve(ids);
  return res;
};
