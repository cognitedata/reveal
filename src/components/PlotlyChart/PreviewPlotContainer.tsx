import { Chart } from 'models/chart/types';
import { Skeleton } from 'antd';
import { ChartingContainer } from './elements';
import PlotlyChart from './PlotlyChart';
import { usePreviewData } from './preview-hooks';

type Props = {
  chart?: Chart;
  isMinMaxShown?: boolean;
  mergeUnits?: boolean;
};

const PreviewPlotContainer = ({
  chart = undefined,
  isMinMaxShown = false,
  mergeUnits = false,
}: Props) => {
  const { timeseriesData, calculationsData, isLoading } = usePreviewData(chart);

  /**
   * Get local chart context
   */
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  const timeseries = chart?.timeSeriesCollection;
  const calculations = chart?.workflowCollection;
  const thresholds = chart?.thresholdCollection;

  const hasValidDates =
    !Number.isNaN(new Date(dateFrom || '').getTime()) &&
    !Number.isNaN(new Date(dateTo || '').getTime());

  if (!hasValidDates) {
    return null;
  }

  const plotProps: React.ComponentProps<typeof PlotlyChart> = {
    dateFrom,
    dateTo,
    timeseries,
    timeseriesData,
    calculations,
    calculationsData,
    thresholds,
    isYAxisShown: false,
    isMinMaxShown,
    isPreview: true,
    mergeUnits,
  };

  return (
    <ChartingContainer>
      {isLoading ? (
        <Skeleton.Image style={{ height: 80, width: 86 }} />
      ) : (
        <PlotlyChart {...plotProps} />
      )}
    </ChartingContainer>
  );
};

export default PreviewPlotContainer;
