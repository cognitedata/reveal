import { get, post } from 'utils/baseURL';
import { RunsAPIResponse } from 'model/Runs';
import { Nullable } from 'utils/helperTypes';
import { RunStatusAPI } from 'model/Status';
import { CogniteClient } from '@cognite/sdk';

export const DEFAULT_RUN_LIMIT: Readonly<number> = 1000;

export const createParams = (
  externalId: string,
  nextCursor: Nullable<string>,
  limit: number = DEFAULT_RUN_LIMIT
) => {
  return `?externalId=${externalId}&limit=${limit}${
    nextCursor ? `&cursor=${nextCursor}` : ''
  }`;
};

export const getRuns = async (
  sdk: CogniteClient,
  externalId: string,
  nextCursor: Nullable<string>,
  limit: number = DEFAULT_RUN_LIMIT
): Promise<RunsAPIResponse> => {
  const response = await get<RunsAPIResponse>(
    sdk,
    `/runs`,
    createParams(externalId, nextCursor, limit)
  );
  return response.data;
};

export interface FilteredRunsParams {
  filter: {
    externalId?: string;
    status?: RunStatusAPI;
    message?: {
      substring?: string;
    };
    createdTime?: { min: number; max: number };
  };
  limit: number;
  cursor?: string;
}

export const getFilteredRuns = async (
  sdk: CogniteClient,
  data: FilteredRunsParams
): Promise<RunsAPIResponse> => {
  const response = await post<RunsAPIResponse, FilteredRunsParams>(
    sdk,
    `/runs/list`,
    data
  );
  return response.data;
};
