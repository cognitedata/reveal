import { useQuery } from 'react-query';
import { getFilteredRuns, getRuns, FilteredRunsParams } from 'utils/RunsAPI';
import { useAppEnv } from 'hooks/useAppEnv';
import { SDKError } from 'model/SDKErrors';
import { RunsAPIResponse } from 'model/Runs';

export const useRuns = (externalId?: string, nextCursor?: string) => {
  const { project } = useAppEnv();
  return useQuery<RunsAPIResponse, SDKError>(
    [project, externalId, nextCursor],
    (ctx) => {
      return getRuns(ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2]);
    },
    {
      enabled: !!externalId,
    }
  );
};

export const useFilteredRuns = (data: FilteredRunsParams) => {
  const { project } = useAppEnv();
  return useQuery<RunsAPIResponse, SDKError>(
    [
      project,
      data,
      data.filter.externalId,
      data.filter?.status,
      data.filter.message?.substring,
      data.filter.createdTime?.min,
      data.filter.createdTime?.max,
    ],
    (ctx) => {
      return getFilteredRuns(ctx.queryKey[0], ctx.queryKey[1]);
    }
  );
};
