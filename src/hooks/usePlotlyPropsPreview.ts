import { useSDK } from '@cognite/sdk-provider';
import { availableWorkflows } from 'models/calculation-backend/calculation-results/atom-selectors/selectors';
import { Chart } from 'models/charts/charts/types/types';
import { useMemo } from 'react';
import { useQueries } from 'react-query';
import { useRecoilValue } from 'recoil';
import fetchPlotlyPropsPreview from 'utils/plotlyChart/fetchPlotlyPropsPreview';

const usePlotlyPropsPreview = (charts: Chart[]) => {
  const sdk = useSDK();
  const localWorkflows = useRecoilValue(availableWorkflows);

  // This "hack" is to guarantee the list of charts
  // will not change during renders, so the map operation
  // doesn't change the reference
  const listOfCharts = useMemo(
    () => charts,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(charts.map((c) => c.id))]
  );
  useQueries(
    listOfCharts.map((chart) => ({
      queryKey: ['plotlyProps', chart.id],
      queryFn: () => fetchPlotlyPropsPreview(chart, sdk, localWorkflows),
      enabled: charts.length > 0,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }))
  );
};

export default usePlotlyPropsPreview;
