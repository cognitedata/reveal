import { useTranslations } from '@charts-app/hooks/translations';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { Chart, deleteChart } from '@cognite/charts-lib';
import { toast } from '@cognite/cogs.js';

const useDeleteMyChart = () => {
  const queryClient = useQueryClient();
  const project = getProject();
  const { t } = useTranslations(
    ['Chart deleted successfully', 'Could not delete chart'],
    'ToastMessages'
  );

  return useMutation(
    async (chartId: string) => {
      await deleteChart(project, chartId);
      return chartId;
    },
    {
      onMutate: (chartId) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        queryClient.cancelQueries(['charts', 'myCharts']);
        // Snapshot the previous value
        const previousMyCharts = queryClient.getQueryData<Chart[]>([
          'charts',
          'myCharts',
        ]);
        // Optimistically update to the new value
        queryClient.setQueryData(
          ['charts', 'myCharts'],
          previousMyCharts?.filter((item) => item.id !== chartId)
        );
        // Return a context object with the snapshotted value
        return previousMyCharts;
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (_err, _chartId, previousMyCharts) => {
        queryClient.setQueryData(['charts', 'myCharts'], previousMyCharts);
        toast.error(t['Could not delete chart'], { autoClose: 1500 });
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(['charts', 'myCharts']);
      },
      onSuccess: (chartId) => {
        queryClient.removeQueries(['chart', chartId]);
        queryClient.removeQueries(['plotlyProps', chartId]);
        toast.success(t['Chart deleted successfully'], { autoClose: 1500 });
      },
    }
  );
};

export default useDeleteMyChart;
