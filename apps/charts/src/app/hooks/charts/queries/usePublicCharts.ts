import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getProject } from '@cognite/cdf-utilities';
import { fetchPublicCharts } from '@cognite/charts-lib';

import { useUserInfo } from '../../useUserInfo';
import { ChartItem } from '../types';

const usePublicCharts = () => {
  const { data: { id } = {} } = useUserInfo();
  const project = getProject();

  return useQuery(
    ['charts', 'publicCharts'],
    async () => fetchPublicCharts(project),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
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

export default usePublicCharts;
