import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import * as Sentry from '@sentry/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUndefined, omitBy } from 'lodash';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import { getProject } from '@cognite/cdf-utilities';
import {
  Chart,
  deleteChart,
  fetchChart,
  fetchPublicCharts,
  fetchUserCharts,
  updateChart,
} from '@cognite/charts-lib';

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
        // firestore updation fails if any value is sent as undefined
        // happened when we introduced scheduledCalculationCollection key,
        // will be useful for future introduction of new keys ( hopefully, will move to FDM before that)
        const cleanUpdatedChart = omitBy(updatedChart, isUndefined);
        await updateChart(project, chart.id, cleanUpdatedChart);
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
      onError(error, chart) {
        Sentry.captureException(error);
        cache.invalidateQueries(['chart', chart.id]);
      },
      onSettled() {
        cache.invalidateQueries(['charts']);
      },
    }
  );
};
