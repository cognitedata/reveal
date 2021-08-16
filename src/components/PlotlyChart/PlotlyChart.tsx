import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { DatapointAggregate, DatapointsMultiQuery } from '@cognite/sdk';
import { calculateGranularity } from 'utils/timeseries';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { useSDK } from '@cognite/sdk-provider';
import {
  getFunctionResponseWhenDone,
  transformSimpleCalcResult,
} from 'utils/backendService';
import { Chart } from 'reducers/charts/types';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { updateSourceAxisForChart } from 'utils/charts';
import { trackUsage } from 'utils/metrics';
import { useDebouncedCallback, useDebounce } from 'use-debounce';
import {
  calculateSeriesData,
  formatPlotlyData,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  SeriesData,
} from './utils';
import { generateLayout, PlotlyEventData } from '.';
import {
  AdjustButton,
  ChartingContainer,
  LoadingIcon,
  PlotWrapper,
} from './elements';

const Plot = createPlotlyComponent(Plotly);

const Y_AXIS_WIDTH = 60;
const Y_AXIS_MARGIN = 40;

type ChartProps = {
  chartId: string;
  isYAxisShown?: boolean;
  isMinMaxShown?: boolean;
  isGridlinesShown?: boolean;
  isPreview?: boolean;
  isInSearch?: boolean;
  stackedMode?: boolean;
  mergeUnits?: boolean;
};

const PlotlyChartComponent = ({
  chartId,
  isYAxisShown = true,
  isMinMaxShown = false,
  isGridlinesShown = false,
  isPreview = false,
  isInSearch = false,
  stackedMode = false,
  mergeUnits = false,
}: ChartProps) => {
  const [isAllowedToUpdate, setIsAllowedToUpdate] = useState(true);
  const sdk = useSDK();
  const client = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: originalChart } = useChart(chartId);
  const { mutate } = useUpdateChart();
  const [chart, setLocalChart] = useState(originalChart);
  const pointsPerSeries = isPreview ? 100 : 1000;
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');
  const [yAxisLocked, setYAxisLocked] = useState<boolean>(true);

  const enabledTimeseries = chart?.timeSeriesCollection?.filter(
    (ts) => ts.enabled
  ).length;
  const enabledWorkflows = chart?.workflowCollection?.filter(
    (wf) => wf.enabled
  ).length;

  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 1000, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const queries =
    chart?.timeSeriesCollection?.map(({ tsExternalId }) => ({
      items: [{ externalId: tsExternalId }],
      start: new Date(debouncedRange.dateFrom!),
      end: new Date(debouncedRange.dateTo!),
      granularity: calculateGranularity(
        [
          new Date(debouncedRange.dateFrom!).getTime(),
          new Date(debouncedRange.dateTo!).getTime(),
        ],
        pointsPerSeries
      ),
      aggregates: ['average', 'min', 'max'],
      limit: pointsPerSeries,
    })) || [];

  const {
    data: tsRaw,
    isFetching: timeseriesFetching,
    isSuccess: tsSuccess,
  } = useQuery(['chart-data', 'timeseries', queries], () =>
    Promise.all(
      queries.map((q) =>
        sdk.datapoints
          .retrieve(q as DatapointsMultiQuery)
          .then((r) => r[0]?.datapoints)
      )
    )
  );

  const calls = isPreview
    ? []
    : chart?.workflowCollection?.map((wf) =>
        omit(wf.calls?.[0], ['callDate'])
      ) || [];
  const {
    data: workflowsRaw,
    isSuccess: wfSuccess,
    isFetching: workflowsRunning,
  } = useQuery(
    ['chart-data', 'workflows', calls],
    () =>
      Promise.all(
        calls.map(async (call) => {
          if (call?.functionId && call.callId) {
            const functionResult = await getFunctionResponseWhenDone(
              sdk,
              call?.functionId,
              call?.callId
            );
            return transformSimpleCalcResult(functionResult);
          }
          return Promise.resolve([]);
        })
      ),
    { enabled: !isPreview }
  );

  const [timeseries, setLocalTimeseries] = useState<DatapointAggregate[][]>([]);
  const [workflows, setLocalWorkflows] = useState<
    { value: number; timestamp: Date }[][]
  >([]);

  useEffect(() => {
    if (tsSuccess && tsRaw) {
      setLocalTimeseries(tsRaw);
    }
  }, [tsSuccess, tsRaw]);

  useEffect(() => {
    if (wfSuccess && workflowsRaw) {
      setLocalWorkflows(workflowsRaw);
    }
  }, [wfSuccess, workflowsRaw]);

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

  const updateChart = useCallback(
    (c: Chart) => {
      const oldChart = client.getQueryData<Chart>(['chart', chart?.id]);
      const irrelevant = ['updatedAt'];
      if (!isEqual(omit(oldChart, irrelevant), omit(c, irrelevant))) {
        client.setQueryData(['chart', chart?.id], c);
        mutate(c);
      }
    },
    [chart?.id, client, mutate]
  );

  useEffect(() => {
    if (chart) {
      updateChart(chart);
    }
  }, [chart, updateChart]);

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

  const seriesData: SeriesData[] = useMemo(
    () =>
      calculateSeriesData(
        chart?.timeSeriesCollection,
        chart?.workflowCollection,
        timeseries,
        timeseriesFetching,
        workflows,
        workflowsRunning,
        mergeUnits
      ),
    [
      chart?.timeSeriesCollection,
      chart?.workflowCollection,
      timeseries,
      workflows,
      workflowsRunning,
      timeseriesFetching,
      mergeUnits,
    ]
  );

  const data: Plotly.Data[] = useMemo(
    () => formatPlotlyData(seriesData, isPreview || !isMinMaxShown),
    [seriesData, isMinMaxShown, isPreview]
  );

  const [activeData, setActiveData] = useState(data);

  useEffect(() => {
    if (isAllowedToUpdate) {
      setActiveData(data);
    }
  }, [data, isAllowedToUpdate]);

  const handleRelayout = useCallback(
    (eventdata: PlotlyEventData) => {
      if (isPreview) {
        return;
      }
      if (!chart) {
        return;
      }
      const x = getXaxisUpdateFromEventData(eventdata);
      // Should not edit the saved y-axis ranges if in stacked mode or in search
      const y = !(stackedMode || isInSearch)
        ? getYaxisUpdatesFromEventData(seriesData, eventdata)
        : [];

      const newChart = updateSourceAxisForChart(chart, { x, y });
      setLocalChart(newChart);

      if (eventdata.dragmode) {
        setDragmode(eventdata.dragmode || dragmode);
      }
    },
    // Some deps are left out to reduce re-renders
    // eslint-disable-next-line
    [
      seriesData,
      dragmode,
      isInSearch,
      stackedMode,
      updateChart,
      chartId,
      client,
      chart,
      enabledTimeseries,
      enabledWorkflows,
    ]
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

  useEffect(() => {
    if (isAllowedToUpdate && !isEqual(data, activeData)) {
      setActiveData(data);
    }
  }, [isAllowedToUpdate, data, activeData]);

  const allowUpdates = useDebouncedCallback(() => {
    setIsAllowedToUpdate(true);
  }, 100);

  const handleMouseWheel = useCallback(() => {
    setIsAllowedToUpdate(false);
    allowUpdates();
  }, [allowUpdates]);

  useEffect(() => {
    window.addEventListener('mousewheel', handleMouseWheel);

    return () => {
      window.removeEventListener('mousewheel', handleMouseWheel);
    };
  }, [handleMouseWheel]);

  /**
   * Overwrite the local chart and layout state when necessary
   * (adding/removing sources, adjusting chart externally, etc)
   *
   * TODO: This needs to handle changes via the external date picker as well
   */
  useEffect(() => {
    if (!originalChart || !chart) {
      return;
    }

    if (
      /**
       * Source has been added or removed
       */
      originalChart?.timeSeriesCollection?.length !==
        chart?.timeSeriesCollection?.length ||
      originalChart?.workflowCollection?.length !==
        chart?.workflowCollection?.length
    ) {
      setLocalChart(originalChart);
    }
  }, [originalChart, chart]);

  const chartStyles = useMemo(() => {
    return { width: '100%', height: '100%' };
  }, []);

  return (
    <ChartingContainer ref={containerRef}>
      {showAdjustButton && (
        <>
          {timeseriesFetching && <LoadingIcon />}
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
          data={activeData as Plotly.Data[]}
          layout={layout as unknown as Plotly.Layout}
          config={config as unknown as Plotly.Config}
          onRelayout={handleRelayout}
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
