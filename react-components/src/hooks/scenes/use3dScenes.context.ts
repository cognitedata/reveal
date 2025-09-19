import { createContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { type QueryFunction, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { FdmSDK } from '../../data-providers/FdmSDK';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { tryGetModelIdFromExternalId } from '../../utilities/tryGetModelIdFromExternalId';

export type Use3dScenesViewModelDependencies = {
  useSDK: (userSdk?: CogniteClient) => CogniteClient;
  FdmSDK: typeof FdmSDK;
  useQuery: <T>(options: {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T>;
  }) => UseQueryResult<T>;
  tryGetModelIdFromExternalId: typeof tryGetModelIdFromExternalId;
};

export const defaultUse3dScenesViewModelDependencies: Use3dScenesViewModelDependencies = {
  useSDK,
  FdmSDK,
  useQuery,
  tryGetModelIdFromExternalId
};

export const Use3dScenesViewModelContext = createContext<Use3dScenesViewModelDependencies>(
  defaultUse3dScenesViewModelDependencies
);
