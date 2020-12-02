import { get } from './baseURL';
import { RunsAPIResponse, RunResponse } from '../model/Runs';

export const getRuns = async (
  project: string,
  externalId: string
): Promise<RunResponse[]> => {
  const response = await get<RunsAPIResponse>(
    `/runs`,
    project,
    `?externalId=${externalId}`
  );
  return response.data.items;
};
