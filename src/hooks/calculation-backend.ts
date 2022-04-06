import {
  Calculation,
  CalculationResult,
  CalculationStatus,
  CreateStatisticsParams,
  StatisticsResult,
  StatisticsStatus,
} from '@cognite/calculation-backend';
import { useSDK } from '@cognite/sdk-provider';
import { DatapointAggregate, DatapointsMultiQuery } from '@cognite/sdk';
import { useMutation, useQuery, UseQueryOptions } from 'react-query';
import { RAW_DATA_POINTS_THRESHOLD } from 'utils/constants';
import { WorkflowResult } from 'models/workflows/types';
import {
  createCalculation,
  createStatistics,
  fetchCalculationQueryResult,
  fetchCalculationResult,
  fetchCalculationStatus,
  fetchStatisticsResult,
  fetchStatisticsStatus,
} from '../services/calculation-backend';

export const useCreateCalculation = () => {
  const sdk = useSDK();
  return useMutation(async ({ definition }: { definition: Calculation }) => {
    return createCalculation(sdk, definition);
  });
};

export const useCalculationStatus = (
  id: string | number,
  queryOpts?: UseQueryOptions<CalculationStatus>
) => {
  const sdk = useSDK();
  return useQuery<CalculationStatus>(
    ['calculation', 'status', id],
    () => fetchCalculationStatus(sdk, String(id)),
    {
      ...queryOpts,
      retry: 1,
      retryDelay: 1000,
      enabled: !!id,
    }
  );
};

export const useCalculationResult = (
  id?: string | number,
  queryOpts?: UseQueryOptions<CalculationResult>
) => {
  const sdk = useSDK();
  return useQuery<CalculationResult>(
    ['calculation', 'response', id],
    () => {
      return fetchCalculationResult(sdk, String(id));
    },
    {
      retry: 1,
      retryDelay: 1000,
      enabled: !!id,
      staleTime: 10000,
      ...queryOpts,
    }
  );
};

export const useCalculationQueryResult = (
  id: string | number,
  query: DatapointsMultiQuery,
  queryOpts?: UseQueryOptions<WorkflowResult>
) => {
  const sdk = useSDK();
  return useQuery<WorkflowResult>(
    ['calculation', 'response_query_v2', id, query],
    async () => {
      const aggregatedResult = await fetchCalculationQueryResult(
        sdk,
        String(id),
        query
      );

      const aggregatedCount = (
        aggregatedResult.datapoints as DatapointAggregate[]
      ).reduce((point: number, c: DatapointAggregate) => {
        return point + (c.count || 0);
      }, 0);

      const isRaw =
        !aggregatedResult.isDownsampled &&
        aggregatedCount < RAW_DATA_POINTS_THRESHOLD;

      const getRawResult = () =>
        fetchCalculationQueryResult(sdk, String(id), {
          ...query,
          granularity: undefined,
          aggregates: undefined,
        });

      return isRaw ? getRawResult() : aggregatedResult;
    },
    {
      retry: 1,
      retryDelay: 1000,
      enabled: !!id,
      staleTime: 10000,
      ...queryOpts,
    }
  );
};

export const useCreateStatistics = () => {
  const sdk = useSDK();
  return useMutation(async (createStatisticsParams: CreateStatisticsParams) => {
    return createStatistics(sdk, createStatisticsParams);
  });
};

export const useStatisticsStatus = (
  id: string | number,
  queryOpts?: UseQueryOptions<StatisticsStatus>
) => {
  const sdk = useSDK();
  return useQuery<StatisticsStatus>(
    ['calculation', 'status', id],
    () => fetchStatisticsStatus(sdk, String(id)),
    {
      ...queryOpts,
      retry: 1,
      retryDelay: 1000,
      enabled: !!id,
    }
  );
};

export const useStatisticsResult = (
  id: string | number,
  queryOpts?: UseQueryOptions<StatisticsResult>
) => {
  const sdk = useSDK();
  return useQuery<StatisticsResult>(
    ['calculation', 'response', id],
    () => fetchStatisticsResult(sdk, String(id)),
    {
      retry: 1,
      retryDelay: 1000,
      enabled: !!id,
      ...queryOpts,
    }
  );
};
