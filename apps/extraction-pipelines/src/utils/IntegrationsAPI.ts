import { sdkv3 } from '@cognite/cdf-sdk-singleton';
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
