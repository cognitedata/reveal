import {
  Calculation,
  CalculationResult,
  CalculationStatus,
  CreateStatisticsParams,
  StatisticsResult,
  StatisticsStatus,
} from '@cognite/calculation-backend';
import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQuery, UseQueryOptions } from 'react-query';
import {
  createCalculation,
  createStatistics,
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
