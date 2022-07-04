import { toast } from '@cognite/cogs.js';
import { useProject } from 'hooks/config';
import { useTranslations } from 'hooks/translations';
import { Chart } from 'models/charts/charts/types/types';
import { useMutation, useQueryClient } from 'react-query';
import { deleteChart } from 'services/charts-storage';

const useDeleteMyChart = () => {
  const queryClient = useQueryClient();
  const project = useProject();
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
