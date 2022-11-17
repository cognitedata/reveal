import { useUserInfo } from 'hooks/useUserInfo';
import dayjs from 'dayjs';
import { getProject } from '@cognite/cdf-utilities';
import { useQuery, useQueryClient } from 'react-query';
import { fetchPublicCharts } from 'services/charts-storage';
import { ChartItem } from '../types';

const usePublicCharts = () => {
  const { data: { id } = {} } = useUserInfo();
  const project = getProject();
  const queryClient = useQueryClient();

  return useQuery(
    ['charts', 'publicCharts'],
    async () => fetchPublicCharts(project),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
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

export default usePublicCharts;
