import { get } from './baseURL';
import { RunsAPIResponse } from '../model/Runs';
import { Nullable } from './helperTypes';

export const DEFAULT_LIMIT: Readonly<number> = 100;

export const createParams = (
  externalId: string,
  nextCursor: Nullable<string>,
  limit: number = DEFAULT_LIMIT
) => {
  return `?externalId=${externalId}&limit=${limit}${
    nextCursor ? `&cursor=${nextCursor}` : ''
  }`;
};

export const getRuns = async (
  project: string,
  externalId: string,
  nextCursor: Nullable<string>,
  limit: number = DEFAULT_LIMIT
): Promise<RunsAPIResponse> => {
  const response = await get<RunsAPIResponse>(
    `/runs`,
    project,
    createParams(externalId, nextCursor, limit)
  );
  return response.data;
};
