import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components/macro';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import {
  DatapointAggregate,
  Datapoints,
  DatapointsMultiQuery,
  DoubleDatapoint,
} from '@cognite/sdk';
import { Button, Icon } from '@cognite/cogs.js';
import { calculateGranularity } from 'utils/timeseries';
import { convertUnits, units } from 'utils/units';
import Layers from 'utils/z-index';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { convertLineStyle } from 'components/PlotlyChart';
import { useSDK } from '@cognite/sdk-provider';
import {
  getFunctionResponseWhenDone,
  transformSimpleCalcResult,
} from 'utils/cogniteFunctions';
import { Chart } from 'reducers/charts/types';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { updateSourceAxisForChart } from 'utils/charts';
import { trackUsage } from 'utils/metrics';
import { roundToSignificantDigits } from 'utils/axis';
import {
  calculateStackedYRange,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  PlotlyEventData,
  SeriesData,
} from './utils';

type ChartProps = {
  chartId: string;
  isPreview?: boolean;
  isInSearch?: boolean;
  stackedMode?: boolean;
};

// Use "basic" version of plotly.js to reduce bundle size
const Plot = createPlotlyComponent(Plotly);

const PlotlyChartComponent = ({
  chartId,
  isPreview = false,
  isInSearch = false,
  stackedMode = false,
}: ChartProps) => {
  const sdk = useSDK();
  const client = useQueryClient();
  const { data: chart } = useChart(chartId);
  const { mutate, isLoading } = useUpdateChart();

  const pointsPerSeries = isPreview ? 100 : 1000;
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');
  const [yAxisLocked, setYAxisLocked] = useState<boolean>(true);

  const queries =
    chart?.timeSeriesCollection?.map(({ tsId }) => ({
      items: [{ id: tsId }],
      start: new Date(chart.dateFrom),
      end: new Date(chart.dateTo),
      granularity: calculateGranularity(
        [new Date(chart.dateFrom).getTime(), new Date(chart.dateTo).getTime()],
        pointsPerSeries
      ),
      aggregates: ['average'],
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

  const seriesData: SeriesData[] = useMemo(
    () =>
      [
        ...(chart?.timeSeriesCollection || [])
          .map((t, i) => ({
            ...t,
            type: 'timeseries',
            width: t.lineWeight,
            range: t.range,
            name: t.name,
            outdatedData: timeseriesFetching,
            datapoints: convertUnits(
              (timeseries?.[i] || []) as DatapointAggregate[],
              t.unit,
              t.preferredUnit
            ),
            dash: convertLineStyle(t.lineStyle),
            mode: t.displayMode,
            unit: units.find(
              (unitOption) =>
                unitOption.value === t.preferredUnit?.toLowerCase()
            )?.label,
          }))
          .filter((t) => t.enabled),
        ...(chart?.workflowCollection || [])
          .map((workflow, i) => ({
            enabled: workflow.enabled,
            outdatedData: workflowsRunning,
            id: workflow?.id,
            type: 'workflow',
            range: workflow.range,
            name: workflow.name,
            color: workflow.color,
            mode: workflow.displayMode,
            width: workflow.lineWeight,
            dash: convertLineStyle(workflow.lineStyle),
            unit: units.find(
              (unitOption) =>
                unitOption.value === workflow.preferredUnit?.toLowerCase()
            )?.label,
            datapoints: convertUnits(
              workflows?.[i] || [],
              workflow.unit,
              workflow.preferredUnit
            ),
          }))
          .filter((t) => t.enabled),
      ] || [],
    [
      chart?.timeSeriesCollection,
      chart?.workflowCollection,
      timeseries,
      workflows,
      workflowsRunning,
      timeseriesFetching,
    ]
  );

  const data = seriesData.map(
    ({ name, color, mode, width, dash, datapoints, outdatedData }, index) => {
      return {
        type: 'scatter',
        mode: mode || 'lines',
        opacity: outdatedData ? 0.5 : 1,
        name,
        marker: {
          color,
        },
        line: { color, width: width || 1, dash: dash || 'solid' },
        yaxis: `y${index !== 0 ? index + 1 : ''}`,
        x: (datapoints as (
          | Datapoints
          | DatapointAggregate
        )[]).map((datapoint) =>
          'timestamp' in datapoint ? new Date(datapoint.timestamp) : null
        ),
        y: (datapoints as (
          | Datapoints
          | DatapointAggregate
        )[]).map((datapoint) =>
          'average' in datapoint
            ? datapoint.average
            : (datapoint as DoubleDatapoint).value
        ),
        hovertemplate:
          '%{y} &#183; <span style="color:#8c8c8c">%{fullData.name}</span><extra></extra>',
        hoverlabel: {
          bgcolor: '#ffffff',
          bordercolor: color,
          font: {
            color: '#333333',
          },
        },
      };
    }
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
          const x = getXaxisUpdateFromEventData(seriesData, eventdata);
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
        updateChart,
        chartId,
        client,
        chart?.timeSeriesCollection?.length,
        chart?.workflowCollection?.length,
      ]
    ),
    1000
  );

  const showYAxis = !isInSearch && !isPreview;
  const marginValue = isPreview ? 0 : 50;

  const layout = {
    margin: { l: marginValue, r: marginValue, b: marginValue, t: marginValue },
    xaxis: {
      type: 'date',
      autorange: false,
      domain: showYAxis ? [0.06 * (seriesData.length - 1), 1] : [0, 1],
      range: [chart?.dateFrom, chart?.dateTo],
      showspikes: true,
      spikemode: 'across',
      spikethickness: 1,
      spikecolor: '#bfbfbf',
      spikedash: 'solid',
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

  seriesData.forEach(({ unit, color, range, datapoints }, index) => {
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
      position: 0.05 * index,
      range: rangeY,
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
          x: 0.05 * index,
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
            x0: 0.05 * index,
            y0: 1,
            x1: 0.05 * index + 0.005,
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
            x0: 0.05 * index,
            y0: 0,
            x1: 0.05 * index + 0.005,
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
    <ChartingContainer>
      {!isPreview && !isInSearch && seriesData.length > 0 && (
        <>
          {(isLoading || timeseriesFetching) && <LoadingIcon />}
          <AdjustButton
            type="tertiary"
            icon="YAxis"
            onClick={() => {
              trackUsage('ChartView.ToggleYAxisLock', {
                state: !yAxisLocked ? 'unlocked' : 'locked',
              });
              setYAxisLocked(!yAxisLocked);
            }}
            left={5 * seriesData.length}
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
const MemoizedPlot = React.memo(
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
    width: 40px;
  }
`;

const AdjustButton = styled(Button)`
  position: absolute;
  background-color: white;
  top: 50px;
  left: ${(props: { left: number }) => props.left}%;
  margin-left: 40px;
  z-index: ${Layers.MAXIMUM};
  background: white;
`;

export default PlotlyChartComponent;
