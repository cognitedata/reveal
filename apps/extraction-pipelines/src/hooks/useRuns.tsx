import { useQuery } from 'react-query';
import { DEFAULT_RUN_LIMIT, getFilteredRuns, getRuns } from 'utils/RunsAPI';
import { useAppEnv } from 'hooks/useAppEnv';
import { SDKError } from 'model/SDKErrors';
import { RunsAPIResponse, RunUI } from 'model/Runs';
import { Range } from '@cognite/cogs.js';
import { RunStatusAPI } from 'model/Status';
import { mapStatusRow } from 'utils/runsUtils';
import { useCallback } from 'react';

export const useRuns = (
  externalId?: string,
  nextCursor?: string | null,
  limit?: number
) => {
  const { project } = useAppEnv();
  return useQuery<RunsAPIResponse, SDKError>(
    [project, externalId, nextCursor],
    (ctx) => {
      return getRuns(ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2], limit);
    },
    {
      enabled: !!externalId && nextCursor !== null,
      keepPreviousData: true,
    }
  );
};

export const useFilteredRuns = (params: CreateRunFilterParam) => {
  const { project } = useAppEnv();
  const data = createRunsFilter(params);
  return useQuery<
    RunsAPIResponse,
    SDKError,
    { runs: RunUI[]; nextCursor?: string }
  >(
    [
      project,
      data.cursor,
      data.filter.externalId,
      data.filter?.statuses,
      data.filter.message?.substring,
      data.filter.createdTime?.min,
      data.filter.createdTime?.max,
    ],
    (ctx) => {
      return getFilteredRuns(ctx.queryKey[0], data);
    },
    {
      enabled: !!data.filter.externalId,
      select: useCallback(selectMappedRuns, []),
    }
  );
};

const selectMappedRuns = (data: RunsAPIResponse) => {
  return { runs: mapStatusRow(data.items), nextCursor: data.nextCursor };
};

type CreateRunFilterParam = {
  externalId?: string;
  nextCursor?: string;
  search?: string;
  dateRange?: Range;
  statuses?: RunStatusAPI[];
  limit?: number;
};
export const createRunsFilter = ({
  externalId,
  dateRange,
  statuses,
  search,
  limit = DEFAULT_RUN_LIMIT,
  nextCursor,
}: CreateRunFilterParam) => {
  return {
    filter: {
      ...(externalId && { externalId }),
      ...(dateRange?.endDate && dateRange?.startDate
        ? {
            createdTime: {
              max: dateRange.endDate.getTime(),
              min: dateRange.startDate.getTime(),
            },
          }
        : {}),
      ...(statuses && statuses?.length > 0 && { statuses }),
      ...(search && {
        message: {
          substring: search,
        },
      }),
    },
    limit,
    cursor: nextCursor,
  };
};
