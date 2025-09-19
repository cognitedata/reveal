import { createContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { type QueryFunction, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';

export type Use3dScenesViewModelDependencies = {
  useSDK: (userSdk?: CogniteClient) => CogniteClient;
  useQuery: <T>(options: {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T>;
  }) => UseQueryResult<T>;
};

export const defaultUse3dScenesViewModelDependencies: Use3dScenesViewModelDependencies = {
  useSDK,
  useQuery
};

export const Use3dScenesViewModelContext = createContext<Use3dScenesViewModelDependencies>(
  defaultUse3dScenesViewModelDependencies
);
