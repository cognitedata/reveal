import { post } from 'utils/baseURL';
import {
  CreateRunRequest,
  CreateRunsAPIResponse,
  GetRunsRequest,
  RunsAPIResponse,
} from 'model/Runs';

import { CogniteClient } from '@cognite/sdk';

export const getFilteredRuns = async (
  sdk: CogniteClient,
  data: GetRunsRequest
): Promise<RunsAPIResponse> => {
  const { nextCursor, items } = (
    await post<RunsAPIResponse, GetRunsRequest>(sdk, `/runs/list`, data)
  ).data;
  return {
    nextCursor,
    items: items.map((i) => ({ ...i, externalId: data.filter.externalId })),
  };
};

export const createRun = async (
  sdk: CogniteClient,
  runs: CreateRunRequest[]
) => {
  const response = await post<
    CreateRunsAPIResponse,
    { items: CreateRunRequest[] }
  >(sdk, `/runs`, {
    items: runs,
  });
  return response.data;
};
