import { createContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { type QueryFunction, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { FdmSDK, type FdmSDK as FdmSDKType } from '../../data-providers/FdmSDK';

export type Use3dScenesViewModelDependencies = {
  useSDK: (userSdk?: CogniteClient) => CogniteClient;
  useQuery: <T>(options: {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T>;
  }) => UseQueryResult<T>;
  createFdmSdk: (sdk: CogniteClient) => FdmSDKType;
};

export const defaultUse3dScenesViewModelDependencies: Use3dScenesViewModelDependencies = {
  useSDK,
  useQuery,
  createFdmSdk: (sdk: CogniteClient) => new FdmSDK(sdk)
};

export const Use3dScenesViewModelContext = createContext<Use3dScenesViewModelDependencies>(
  defaultUse3dScenesViewModelDependencies
);
