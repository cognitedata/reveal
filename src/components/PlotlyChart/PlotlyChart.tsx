import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components/macro';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import dayjs from 'dayjs';

import {
  DatapointAggregate,
  Datapoints,
  DatapointsMultiQuery,
} from '@cognite/sdk';
import { Button, Icon } from '@cognite/cogs.js';
import { calculateGranularity } from 'utils/timeseries';
import Layers from 'utils/z-index';
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
import { roundToSignificantDigits } from 'utils/axis';
import {
  calculateSeriesData,
  calculateStackedYRange,
  formatPlotlyData,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  PlotlyEventData,
  SeriesData,
} from './utils';

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

// Use "basic" version of plotly.js to reduce bundle size
const Plot = createPlotlyComponent(Plotly);

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
  const sdk = useSDK();
  const client = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: chart } = useChart(chartId);
  const { mutate, isLoading } = useUpdateChart();

  const pointsPerSeries = isPreview ? 100 : 1000;

  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');
  const [yAxisLocked, setYAxisLocked] = useState<boolean>(true);

  const enabledTimeseries = chart?.timeSeriesCollection?.filter(
    (ts) => ts.enabled
  ).length;
  const enabledWorkflows = chart?.workflowCollection?.filter((wf) => wf.enabled)
    .length;

  const queries =
    chart?.timeSeriesCollection?.map(({ tsExternalId }) => ({
      items: [{ externalId: tsExternalId }],
      start: new Date(chart.dateFrom),
      end: new Date(chart.dateTo),
      granularity: calculateGranularity(
        [new Date(chart.dateFrom).getTime(), new Date(chart.dateTo).getTime()],
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
    if (!isYAxisShown && !yAxisLocked) setYAxisLocked(true);
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

  const handleRelayout = debounce(
    useCallback(
      (eventdata: PlotlyEventData) => {
        // Using client.getQueryData unstead of creating a closure over `chart`, which changes often
        const c = client.getQueryData<Chart>(['chart', chartId]);
        if (!c) {
          return;
        }

        if (!isPreview) {
          const x = getXaxisUpdateFromEventData(eventdata);
          // Should not edit the saved y-axis ranges if in stacked mode or in search
          const y = !(stackedMode || isInSearch)
            ? getYaxisUpdatesFromEventData(seriesData, eventdata)
            : [];

          const newChart = updateSourceAxisForChart(c, { x, y });
          updateChart(newChart);

          if (eventdata.dragmode) {
            setDragmode(eventdata.dragmode || dragmode);
          }
        }
      },
      // Some deps are left out to reduce re-renders
      // eslint-disable-next-line
      [
        dragmode,
        isInSearch,
        stackedMode,
        mergeUnits,
        updateChart,
        chartId,
        client,
        chart?.timeSeriesCollection?.length,
        chart?.workflowCollection?.length,
        enabledTimeseries,
        enabledWorkflows,
      ]
    ),
    1000
  );

  const showYAxis = !isInSearch && !isPreview && isYAxisShown;
  const showAdjustButton = showYAxis && seriesData.length > 0;
  const horizontalMargin = isPreview ? 0 : 20;
  const verticallMargin = isPreview ? 0 : 30;

  const layout = {
    margin: {
      l: horizontalMargin,
      r: horizontalMargin,
      b: verticallMargin,
      t: verticallMargin,
    },
    xaxis: {
      type: 'date',
      autorange: false,
      domain: showYAxis
        ? [yAxisValues.width * (seriesData.length - 1) + yAxisValues.margin, 1]
        : [0, 1],
      range: [
        dayjs(chart?.dateFrom!).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(chart?.dateTo!).format('YYYY-MM-DD HH:mm:ss'),
      ],
      showspikes: true,
      spikemode: 'across',
      spikethickness: 1,
      spikecolor: '#bfbfbf',
      spikedash: 'solid',
      showgrid: isGridlinesShown,
    },
    spikedistance: -1,
    hovermode: 'x',
    showlegend: false,
    dragmode,
    annotations: [],
    shapes: [],
  };

  const yAxisDefaults = {
    hoverformat: '.2f',
    zeroline: false,
    type: 'linear', // IMPORTANT! missing causes more renders
    fixedrange: yAxisLocked,
  };

  seriesData.forEach(({ unit, range, series }, index) => {
    const { color, datapoints } = series[0];

    /**
     * For some reason plotly doesn't like that you overwrite the range input (doing this the wrong way?)
     */
    const serializedYRange = range
      ? JSON.parse(JSON.stringify(range))
      : undefined;

    const rangeY = stackedMode
      ? calculateStackedYRange(
          datapoints as (Datapoints | DatapointAggregate)[],
          index,
          seriesData.length
        )
      : serializedYRange;

    let tickvals;
    if (rangeY) {
      const ticksAmount = 6;
      const rangeDifferenceThreshold = 0.001;
      tickvals =
        rangeY[1] - rangeY[0] < rangeDifferenceThreshold
          ? Array.from(Array(ticksAmount)).map(
              (_, idx) =>
                rangeY[0] + (idx * (rangeY[1] - rangeY[0])) / (ticksAmount - 1)
            )
          : undefined;
    }

    (layout as any)[`yaxis${index ? index + 1 : ''}`] = {
      ...yAxisDefaults,
      visible: showYAxis,
      linecolor: color,
      linewidth: 1,
      tickcolor: color,
      tickwidth: 1,
      tickvals,
      ticktext: tickvals
        ? tickvals.map((value) => roundToSignificantDigits(value, 3))
        : undefined,
      side: 'right',
      overlaying: index !== 0 ? 'y' : undefined,
      anchor: 'free',
      position: yAxisValues.width * index,
      range: rangeY,
      showgrid: isGridlinesShown,
    };

    if (showYAxis) {
      /**
       * Display units as annotations and manually placing them on top of y-axis lines
       * Plotly does not support labels on top of axes
       */
      if (unit) {
        (layout.annotations as any[]).push({
          xref: 'paper',
          yref: 'paper',
          x: yAxisValues.width * index,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: unit,
          showarrow: false,
          xshift: -3,
          yshift: 5,
        });
      }

      /**
       * Display y-axes top and bottom markers
       */
      (layout.shapes as any).push(
        ...[
          // Top axis marker
          {
            type: 'line',
            xref: 'paper',
            yref: 'paper',
            x0: yAxisValues.width * index,
            y0: 1,
            x1: yAxisValues.width * index + 0.005,
            y1: 1,
            line: {
              color,
              width: 1,
            },
          },
          // Bottom axis marker
          {
            type: 'line',
            xref: 'paper',
            yref: 'paper',
            x0: yAxisValues.width * index,
            y0: 0,
            x1: yAxisValues.width * index + 0.005,
            y1: 0,
            line: {
              color,
              width: 1,
            },
          },
        ]
      );
    }
  });

  const config = {
    staticPlot: isPreview || isLoading || data.length === 0,
    autosize: true,
    responsive: true,
    scrollZoom: true,
    displaylogo: false,
    displayModeBar: false,
  };

  return (
    <ChartingContainer ref={containerRef}>
      {showAdjustButton && (
        <>
          {(isLoading || timeseriesFetching) && <LoadingIcon />}
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
          data={data as Plotly.Data[]}
          layout={(layout as unknown) as Plotly.Layout}
          config={(config as unknown) as Plotly.Config}
          onRelayout={handleRelayout}
        />
      </PlotWrapper>
    </ChartingContainer>
  );
};

type MemoizedPlotProps = {
  data: Plotly.Data[];
  layout: Plotly.Layout;
  config: Plotly.Config;
  onRelayout: (e: Plotly.PlotRelayoutEvent) => void;
};
const MemoizedPlot = memo(
  ({ data, layout, config, onRelayout }: MemoizedPlotProps) => (
    <Plot
      data={data}
      layout={layout}
      config={config}
      onRelayout={onRelayout}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
    />
  ),
  (prev, next) => isEqual(prev, next)
);
/* eslint-disable @cognite/no-number-z-index */
const LoadingIcon = () => (
  <Icon
    type="Loading"
    style={{
      top: 10,
      left: 10,
      position: 'relative',
      zIndex: 2,
      float: 'left',
    }}
  />
);

const ChartingContainer = styled.div`
  height: 100%;
  width: 100%;

  & > .adjust-button {
    visibility: hidden;
  }

  &:hover > .adjust-button {
    visibility: visible;
  }
`;

const PlotWrapper = styled.div`
  height: 100%;
  width: 100%;
  // Expanding the y-axis hitbox
  .nsdrag {
    width: 60px;
    transform: translateX(-17px);
  }
`;

const AdjustButton = styled(Button)`
  position: absolute;
  background-color: white;
  top: 30px;
  left: ${(props: { left: number }) => props.left}%;
  margin-left: 40px;
  z-index: ${Layers.MAXIMUM};
  background: white;
`;

export default PlotlyChartComponent;
