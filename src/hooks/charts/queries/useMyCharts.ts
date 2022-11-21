import { useUserInfo } from 'hooks/useUserInfo';
import dayjs from 'dayjs';
import { getProject } from '@cognite/cdf-utilities';
import { useQuery } from 'react-query';
import { fetchUserCharts } from 'services/charts-storage';
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
