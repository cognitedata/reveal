import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getProject } from '@cognite/cdf-utilities';
import { fetchUserCharts } from '@cognite/charts-lib';

import { useUserInfo } from '../../useUserInfo';
import { ChartItem } from '../types';

const useMyCharts = () => {
  const { data: { id, mail } = {} } = useUserInfo();
  const project = getProject();

  return useQuery(
    ['charts', 'myCharts'],
    async () => {
      if (!id) return [];
      return fetchUserCharts(project, id, mail);
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      staleTime: 60 * 60 * 1000, // One hour
      select: (charts) =>
        charts.map((chart): ChartItem => {
          return {
            id: chart.id,
            name: chart.name,
            owner: chart.userInfo?.displayName ?? '',
            updatedAt: dayjs(chart.updatedAt).toISOString(),
            firebaseChart: chart,
          };
        }),
    }
  );
};

export default useMyCharts;
