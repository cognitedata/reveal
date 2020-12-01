import { get } from './baseURL';
import { RunsAPIResponse, RunResponse } from '../model/Runs';
import { mockDataRunsResponse } from '../utils/mockResponse';

export const getRuns = async (
  project: string,
  externalId: string
): Promise<RunResponse[]> => {
  /* const response = await get<RunsAPIResponse>(
    `/runs`,
    project,
    `?externalId=${externalId}`
  ); */
  const response = {
    data: mockDataRunsResponse,
  };
  return response.data.items;
};
