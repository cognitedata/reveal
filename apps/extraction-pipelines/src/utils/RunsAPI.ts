import { get } from './baseURL';
import { RunsAPIResponse, StatusRow } from '../model/Runs';

export const getRuns = async (
  project: string,
  externalId: string
): Promise<StatusRow[]> => {
  const response = await get<RunsAPIResponse>(
    `/runs`,
    project,
    `?externalId=${externalId}`
  );
  return response.data.items;
};
