import { timeseriesAtom } from 'models/timeseries-results/atom';
import { availableWorkflows } from 'models/calculation-results/selectors';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Chart } from 'models/chart/types';
import { updateSourceAxisForChart } from 'models/chart/updates';
import { ChartingContainer } from './elements';
import { cleanTimeseriesCollection, cleanWorkflowCollection } from './utils';
import PlotlyChart, { PlotNavigationUpdate } from './PlotlyChart';

type Props = {
  chart?: Chart;
  setChart?: (
    valOrUpdater: ((currVal: Chart | undefined) => Chart) | Chart
  ) => void;
  isYAxisShown?: boolean;
  isMinMaxShown?: boolean;
  isGridlinesShown?: boolean;
  stackedMode?: boolean;
  mergeUnits?: boolean;
};

const ChartPlotContainer = ({
  chart = undefined,
  setChart = (val) => val,
  isYAxisShown = true,
  isMinMaxShown = false,
  isGridlinesShown = false,
  stackedMode = false,
  mergeUnits = false,
}: Props) => {
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');

  /**
   * Get local chart context
   */
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  /**
   * Get stored results for timeseries and calculations
   */
  const localTimeseries = useRecoilValue(timeseriesAtom);
  const localWorkflows = useRecoilValue(availableWorkflows);

  /**
   * Filter out callIDs that trigger unnecessary recalcs/rerenders
   */
  const tsCollectionAsString = JSON.stringify(
    cleanTimeseriesCollection(chart?.timeSeriesCollection || [])
  );
  const wfCollectionAsString = JSON.stringify(
    cleanWorkflowCollection(chart?.workflowCollection || [])
  );

  const timeseries = useMemo(
    () => JSON.parse(tsCollectionAsString),
    [tsCollectionAsString]
  );

  const calculations = useMemo(
    () => JSON.parse(wfCollectionAsString),
    [wfCollectionAsString]
  );

  const timeseriesData = localTimeseries;
  const calculationsData = localWorkflows;
  const thresholds = chart?.thresholdCollection;

  const handleChartNavigation = useCallback(
    ({ x, y, dragmode: newDragmode }: PlotNavigationUpdate) => {
      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, {
          x,
          y: !stackedMode ? y : [],
        })
      );

      if (newDragmode) {
        setDragmode(newDragmode);
      }
    },
    [setChart, stackedMode]
  );

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
    isYAxisShown,
    isMinMaxShown,
    isGridlinesShown,
    stackedMode,
    mergeUnits,
    dragmode,
    onPlotNavigation: handleChartNavigation,
  };

  return (
    <ChartingContainer>
      <PlotlyChart {...plotProps} />
    </ChartingContainer>
  );
};

export default ChartPlotContainer;
