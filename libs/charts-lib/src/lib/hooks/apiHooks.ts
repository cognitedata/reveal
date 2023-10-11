import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { fetchPublicCharts, fetchUserCharts } from '../api';
import { Chart } from '../types';

import { queryKeys } from './queryKeys';
import { useUserInfo } from './useUserInfo';

// This file contains all the api hooks.
export const useListPublicCharts = (
  { projectId }: { projectId: string },
  options?: UseQueryOptions<Chart[]>
) => {
  return useQuery<Chart[]>(
    queryKeys.publicCharts(projectId),
    async () => fetchPublicCharts(projectId),
    options
  );
};

export const useListUserCharts = (
  { projectId }: { projectId: string },
  options?: UseQueryOptions<Chart[]>
) => {
  const { data: user } = useUserInfo();
  const { id = 'unknown', mail = 'unknown' } = user || {};

  return useQuery<Chart[]>(
    queryKeys.userCharts(projectId, id, mail),
    async () => await fetchUserCharts(projectId, id, mail),
    options
  );
};
