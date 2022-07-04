import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import dayjs from 'dayjs';
import { useProject } from 'hooks/config';
import { useQuery, useQueryClient } from 'react-query';
import { fetchPublicCharts } from 'services/charts-storage';
import { ChartItem } from '../../my-charts/types/types';

const usePublicCharts = () => {
  const { data: { id } = {} } = useUserInfo();
  const project = useProject();
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
