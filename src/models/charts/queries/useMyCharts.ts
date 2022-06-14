import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import dayjs from 'dayjs';
import { useProject } from 'hooks/config';
import { useQuery, useQueryClient } from 'react-query';
import { fetchUserCharts } from 'services/charts-storage';
import { ChartItem } from '../types';

const useMyCharts = () => {
  const { data: { id, email } = {} } = useUserInfo();
  const queryClient = useQueryClient();
  const project = useProject();

  return useQuery(
    ['charts', 'myCharts'],
    async () => {
      if (!id) return [];
      return fetchUserCharts(project, id, email);
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      staleTime: 60 * 60 * 1000, // One hour
      select: (charts) =>
        charts.map((chart): ChartItem => {
          const plotlyProps = queryClient.getQueryData<
            ChartItem['plotlyProps']
          >(['plotlyProps', chart.id]);
          return {
            id: chart.id,
            name: chart.name,
            owner: chart.userInfo?.displayName ?? '',
            updatedAt: dayjs(chart.updatedAt).toISOString(),
            firebaseChart: chart,
            loadingPlot: plotlyProps === undefined,
            plotlyProps,
          };
        }),
    }
  );
};

export default useMyCharts;
