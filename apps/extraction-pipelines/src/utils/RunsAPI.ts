import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { RunsAPIResponse, StatusRow } from '../model/Runs';

const getBaseUrl = (project: string): string => {
  return `https://greenfield.cognitedata.com/api/playground/projects/${project}/integrations/runs`;
};
const get = async <D>(route: string, project: string) => {
  return sdkv3.get<D>(`${getBaseUrl(project)}${route}`, {
    withCredentials: true,
  });
};

export const getRuns = async (
  project: string,
  externalId: string
): Promise<StatusRow[]> => {
  const params = `?externalId=${externalId}`;
  const response = await get<RunsAPIResponse>(params, project);
  return response.data.items;
};
