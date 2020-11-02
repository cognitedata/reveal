import { sdkv3 } from '@cognite/cdf-sdk-singleton';

const getBaseUrl = (project: string): string => {
  return `https://api.cognite.com/api/playground/projects/${project}/integrations`;
};

const get = async <D>(route: string, project: string) => {
  return sdkv3.get<D>(`${getBaseUrl(project)}${route}`, {
    withCredentials: true,
  });
};

export const getIntegrations = async <D>(project: string): Promise<D> => {
  const response = await get<D>('/', project);
  return response.data;
};
