import {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DatapointsMultiQuery,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { chartAtom } from 'models/chart/atom';
import { timeseriesAtom } from 'models/timeseries/atom';
import { availableWorkflows } from 'models/workflows/selectors';
import dayjs from 'dayjs';
import isEqual from 'lodash/isEqual';
import Plotly from 'plotly.js-basic-dist';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { useDebounce } from 'use-debounce';
import { trackUsage } from 'services/metrics';
import { calculateGranularity } from 'utils/timeseries';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { updateSourceAxisForChart } from 'models/chart/updates';
import {
  cleanTimeseriesCollection,
  cleanWorkflowCollection,
  generateLayout,
  PlotlyEventData,
  useAllowedToUpdateChart,
} from '.';
import {
  AdjustButton,
  ChartingContainer,
  LoadingIcon,
  PlotWrapper,
} from './elements';
import {
  calculateSeriesData,
  formatPlotlyData,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  SeriesData,
} from './utils';

const Plot = createPlotlyComponent(Plotly);

const Y_AXIS_WIDTH = 60;
const Y_AXIS_MARGIN = 40;

type ChartProps = {
  chart?: Chart;
  isYAxisShown?: boolean;
  isMinMaxShown?: boolean;
  isGridlinesShown?: boolean;
  isPreview?: boolean;
  isInSearch?: boolean;
  stackedMode?: boolean;
  mergeUnits?: boolean;
};

const PlotlyChartComponent = ({
  chart = undefined,
  isYAxisShown = true,
  isMinMaxShown = false,
  isGridlinesShown = false,
  isPreview = false,
  isInSearch = false,
  stackedMode = false,
  mergeUnits = false,
}: ChartProps) => {
  const sdk = useSDK();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointsPerSeries = isPreview ? 100 : CHART_POINTS_PER_SERIES;
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');
  const [yAxisLocked, setYAxisLocked] = useState<boolean>(true);

  /**
   * Optimization hook to avoid rendering chart when user is navigating
   */
  const isAllowedToUpdate = useAllowedToUpdateChart();

  /**
   * Get local chart context
   */
  const [, setChart] = useRecoilState(chartAtom);

  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 1000, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const queries =
    chart?.timeSeriesCollection?.map(({ tsExternalId }) => ({
      items: [{ externalId: tsExternalId }],
      start: dayjs(debouncedRange.dateFrom!).toDate(),
      end: dayjs(debouncedRange.dateTo!).toDate(),
      granularity: calculateGranularity(
        [
          dayjs(debouncedRange.dateFrom!).valueOf(),
          dayjs(debouncedRange.dateTo!).valueOf(),
        ],
        pointsPerSeries
      ),
      aggregates: ['average', 'min', 'max', 'count', 'sum'],
      limit: pointsPerSeries,
    })) || [];

  const {
    data: tsRaw,
    isFetching: timeseriesFetching,
    isSuccess: tsSuccess,
  } = useQuery(
    ['chart-data', 'timeseries', queries],
    () => {
      return Promise.all(
        queries.map((q) =>
          sdk.datapoints
            .retrieve(q as DatapointsMultiQuery)
            .then((r: DatapointAggregates[] | Datapoints[]) => {
              if (isPreview) {
                return r;
              }

              const RAW_DATA_POINTS_THRESHOLD = pointsPerSeries / 2;

              const aggregatedCount = (
                r[0]?.datapoints as DatapointAggregate[]
              ).reduce((point: number, c: DatapointAggregate) => {
                return point + (c.count || 0);
              }, 0);

              const isRaw = aggregatedCount < RAW_DATA_POINTS_THRESHOLD;

              return isRaw
                ? sdk.datapoints.retrieve({
                    ...q,
                    granularity: undefined,
                    aggregates: undefined,
                    includeOutsidePoints: true,
                  } as DatapointsMultiQuery)
                : r;
            })
            .then((r) => r[0])
        )
      );
    },
    {
      enabled: !!chart,
    }
  );

  const [localTimeseries, setLocalTimeseries] = useRecoilState(timeseriesAtom);
  const localWorkflows = useRecoilValue(availableWorkflows);
  const timeseries = isPreview ? tsRaw : localTimeseries;
  const workflows = localWorkflows;

  useEffect(() => {
    if (tsSuccess && tsRaw) {
      setLocalTimeseries(tsRaw);
    }
  }, [tsSuccess, tsRaw, setLocalTimeseries]);

  const onAdjustButtonClick = useCallback(() => {
    trackUsage('ChartView.ToggleYAxisLock', {
      state: !yAxisLocked ? 'unlocked' : 'locked',
    });
    setYAxisLocked(!yAxisLocked);
  }, [yAxisLocked]);

  useEffect(() => {
    if (!isYAxisShown && !yAxisLocked) {
      setYAxisLocked(true);
    }
  }, [isYAxisShown, yAxisLocked, onAdjustButtonClick]);

  const [yAxisValues, setYAxisValues] = useState<{
    width: number;
    margin: number;
  }>({ width: 0.05, margin: 0.01 });

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const containerWidth = containerRef?.current?.clientWidth;
      setYAxisValues({
        width: Y_AXIS_WIDTH / containerWidth,
        margin: Y_AXIS_MARGIN / containerWidth,
      });
    }
  }, [containerRef]);

  /**
   * Filter out callIDs that trigger unnecessary recalcs/rerenders
   */
  const tsCollectionAsString = JSON.stringify(
    cleanTimeseriesCollection(chart?.timeSeriesCollection)
  );
  const wfCollectionAsString = JSON.stringify(
    cleanWorkflowCollection(chart?.workflowCollection)
  );

  const seriesData: SeriesData[] = useMemo(() => {
    const result = calculateSeriesData(
      JSON.parse(tsCollectionAsString) as ChartTimeSeries[],
      JSON.parse(wfCollectionAsString) as ChartWorkflow[],
      timeseries,
      timeseriesFetching,
      workflows,
      mergeUnits
    );
    return result;
  }, [
    tsCollectionAsString,
    wfCollectionAsString,
    timeseries,
    workflows,
    timeseriesFetching,
    mergeUnits,
  ]);

  const data: Plotly.Data[] = useMemo(
    () => formatPlotlyData(seriesData, isPreview || !isMinMaxShown),
    [seriesData, isMinMaxShown, isPreview]
  );

  const handleRelayout = useCallback(
    (eventdata: PlotlyEventData) => {
      if (isPreview) {
        return;
      }

      const x = getXaxisUpdateFromEventData(eventdata);

      // Should not edit the saved y-axis ranges if in stacked mode or in search
      const y = !(stackedMode || isInSearch)
        ? getYaxisUpdatesFromEventData(seriesData, eventdata)
        : [];

      setChart((oldChart) => updateSourceAxisForChart(oldChart!, { x, y }));

      if (eventdata.dragmode) {
        setDragmode(eventdata.dragmode || dragmode);
      }
    },
    [setChart, isPreview, seriesData, dragmode, isInSearch, stackedMode]
  );

  const showYAxis = !isInSearch && !isPreview && isYAxisShown;
  const showAdjustButton = showYAxis && seriesData.length > 0;

  const layout = useMemo(() => {
    return generateLayout({
      isPreview,
      isGridlinesShown,
      yAxisLocked,
      showYAxis,
      stackedMode,
      seriesData,
      yAxisValues,
      dateFrom,
      dateTo,
      dragmode,
    });
  }, [
    isPreview,
    isGridlinesShown,
    yAxisLocked,
    showYAxis,
    stackedMode,
    seriesData,
    yAxisValues,
    dateFrom,
    dateTo,
    dragmode,
  ]);

  const config = useMemo(() => {
    return {
      staticPlot: isPreview,
      autosize: true,
      responsive: true,
      scrollZoom: true,
      displaylogo: false,
      displayModeBar: false,
    };
  }, [isPreview]);

  /**
   * Local state for data and layout in the chart
   * that only updates when the user isn't doing any navigation
   */
  const [activeState, setActiveState] = useState({
    data,
    layout,
    handleRelayout,
  });

  /**
   * Update active state whenever allowed (not scrolling or navigating chart)
   */
  useEffect(() => {
    if (!isAllowedToUpdate) {
      return;
    }
    setActiveState({
      data,
      layout,
      handleRelayout,
    });
  }, [data, layout, isAllowedToUpdate, handleRelayout]);

  const chartStyles = useMemo(() => {
    return { width: '100%', height: '100%' };
  }, []);

  const isLoadingChartData = timeseriesFetching || !isAllowedToUpdate;

  return (
    <ChartingContainer ref={containerRef}>
      {showAdjustButton && (
        <>
          {isLoadingChartData && <LoadingIcon />}
          <AdjustButton
            type="tertiary"
            icon="YAxis"
            onClick={onAdjustButtonClick}
            left={yAxisValues.width * 100 * seriesData.length}
            className="adjust-button"
            style={{ background: 'white' }}
          >
            {yAxisLocked ? 'Adjust Y axis' : 'Finish'}
          </AdjustButton>
        </>
      )}
      <PlotWrapper>
        <MemoizedPlot
          data={activeState.data as Plotly.Data[]}
          layout={activeState.layout as unknown as Plotly.Layout}
          config={config as unknown as Plotly.Config}
          onRelayout={activeState.handleRelayout}
          style={chartStyles}
          useResizeHandler
        />
      </PlotWrapper>
    </ChartingContainer>
  );
};

const MemoizedPlot = memo(Plot, (prev, next) => {
  const areEqual =
    prev.data === next.data &&
    prev.layout === next.layout &&
    prev.config === next.config &&
    prev.onRelayout === next.onRelayout &&
    prev.style === next.style;

  return areEqual;
});

export default PlotlyChartComponent;
