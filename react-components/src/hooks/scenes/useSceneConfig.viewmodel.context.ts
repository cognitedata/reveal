import { createContext } from 'react';
import { type QueryFunction, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';
import { type FdmSDK } from '../../data-providers/FdmSDK';

export type UseSceneConfigViewModelDependencies = {
  useFdmSdk: () => FdmSDK;
  useQuery: <T>(options: {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T>;
    enabled?: boolean;
    staleTime?: number;
  }) => UseQueryResult<T>;
};

export const defaultUseSceneConfigViewModelDependencies: UseSceneConfigViewModelDependencies = {
  useFdmSdk,
  useQuery
};

export const UseSceneConfigViewModelContext = createContext<UseSceneConfigViewModelDependencies>(
  defaultUseSceneConfigViewModelDependencies
);
