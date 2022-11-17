import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getProject } from '@cognite/cdf-utilities';
import { Chart } from 'models/chart/types';
import { useUserInfo } from 'hooks/useUserInfo';
import {
  deleteChart,
  fetchChart,
  fetchPublicCharts,
  fetchUserCharts,
  updateChart,
} from 'services/charts-storage';

export const useMyCharts = () => {
  const { data: { id, mail } = {} } = useUserInfo();
  const project = getProject();

  return useQuery(
    ['charts', 'mine'],
    async () => (id ? fetchUserCharts(project, id, mail) : []),
    { enabled: !!id, refetchOnWindowFocus: false }
  );
};

export const usePublicCharts = () => {
  const { data } = useUserInfo();
  const project = getProject();

  return useQuery(
    ['charts', 'public'],
    async () => fetchPublicCharts(project),
    { enabled: !!data?.id }
  );
};

export const useChart = (id: string) => {
  const project = getProject();

  return useQuery(['chart', id], async () => fetchChart(project, id), {
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useDeleteChart = () => {
  const project = getProject();
  const cache = useQueryClient();

  return useMutation(
    async (chartId: string) => {
      await deleteChart(project, chartId);
      return chartId;
    },
    {
      onSuccess: (chartId) => {
        cache.invalidateQueries(['charts', 'mine']);
        cache.invalidateQueries(['charts', 'myCharts']);
        cache.invalidateQueries(['charts']);
        cache.removeQueries(['chart', chartId]);
      },
    }
  );
};

export const useUpdateChart = () => {
  const cache = useQueryClient();
  const { data } = useUserInfo();
  const project = getProject();

  return useMutation(
    async (chart: Chart) => {
      /**
       * Check if the chart you're changing is your own or a public one
       * For public ones we do not try to push the change to the server,
       * but still allow you to change it locally so that you can
       * later duplicate and save it as your own if you want
       */
      const skipPersist = !(
        data?.id === chart.user || data?.mail === chart.user
      );

      // skipPersist will result in only the local cache being updated.
      if (!skipPersist) {
        // The firestore SDK will retry indefinitely
        const updatedChart: Chart = omit(
          {
            ...chart,
            updatedAt: Date.now(),
          },
          'dirty'
        );
        await updateChart(project, chart.id, updatedChart);
      }
      return chart.id;
    },
    {
      onMutate(chart) {
        /**
         * Check if the chart you're changing is your own or a public one
         * For public ones we do not try to push the change to the server,
         * but still allow you to change it locally so that you can
         * later duplicate and save it as your own if you want
         */
        const skipPersist = !(
          data?.id === chart.user || data?.mail === chart.user
        );
        const key = ['chart', chart.id];
        const cachedChart = cache.getQueryData(key);

        if (!isEqual(cachedChart, chart)) {
          cache.setQueryData(key, {
            ...chart,
            dirty: skipPersist,
          });
        }
      },
      onError(_, chart) {
        cache.invalidateQueries(['chart', chart.id]);
      },
      onSettled() {
        cache.invalidateQueries(['charts']);
      },
    }
  );
};
