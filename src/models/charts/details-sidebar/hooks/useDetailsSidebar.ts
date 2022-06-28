import DetailsSidebar from 'components/DetailsSidebar/DetailsSidebar';
import dayjs from 'dayjs';
import { useProject } from 'hooks/config';
import useCdfAsset from 'models/calculation-backend/metadata/queries/useCdfAsset';
import useCdfDataset from 'models/calculation-backend/metadata/queries/useCdfDataset';
import useCdfTimeseries from 'models/calculation-backend/metadata/queries/useCdfTimeseries';
import useStatistics from 'models/calculation-backend/statistics/queries/useStatistics';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { useInitializedChart } from 'pages/ChartViewPage/hooks';
import { ComponentProps } from 'react';
import { useParams } from 'react-router-dom';
import detailsSidebarselector from '../selectors/detailsSidebarSelector';
import statisticsSelector from '../selectors/statisticsSelector';

export default function useDetailsSidebar(
  source: ChartWorkflow | ChartTimeSeries
): ComponentProps<typeof DetailsSidebar>['source'] {
  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useInitializedChart(chartId);
  const project = useProject();
  // Statistics results (for active item)
  const {
    results: statisticsResult,
    error: statisticsError = false,
    loading: statisticsLoading,
  } = useStatistics(
    source,
    chart?.dateFrom ?? dayjs().startOf('day').toISOString(),
    chart?.dateTo ?? dayjs().endOf('day').toISOString()
  );

  // CDF Timeseries
  const {
    timeseries,
    isLoading: isTimeseriesLoading,
    error: timeseriesLoadingError,
  } = useCdfTimeseries('tsId' in source ? source.tsId : undefined);

  // CDF Asset
  const { asset } = useCdfAsset(timeseries?.assetId);

  // CDF Dataset
  const { dataset } = useCdfDataset(timeseries?.dataSetId);

  return detailsSidebarselector(
    project,
    source,
    {
      loading: statisticsLoading,
      values: statisticsSelector(
        { ...source, unit: source.unit ?? timeseries?.unit },
        statisticsResult,
        statisticsError,
        statisticsLoading
      ),
      error: statisticsError,
    },
    {
      loading: isTimeseriesLoading,
      value: timeseries,
      error: timeseriesLoadingError,
    },
    asset,
    dataset
  );
}
