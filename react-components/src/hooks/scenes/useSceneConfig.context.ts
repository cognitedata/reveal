import { createContext } from 'react';
import { type QueryFunction, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { use3dScenes } from './use3dScenes';

export type UseSceneConfigDependencies = {
  useQuery: <T>(options: {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T>;
    enabled?: boolean;
    staleTime?: number;
  }) => UseQueryResult<T>;
  use3dScenes: typeof use3dScenes;
};

export const defaultUseSceneConfigDependencies: UseSceneConfigDependencies = {
  useQuery,
  use3dScenes
};

export const UseSceneConfigContext = createContext<UseSceneConfigDependencies>(
  defaultUseSceneConfigDependencies
);
