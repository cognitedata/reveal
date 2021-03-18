import React from 'react';
import { useQueries } from 'react-query';
import zipWith from 'lodash/zipWith';
import { Call, Chart } from 'reducers/charts/types';
import {
  DatapointAggregate,
  Datapoints,
  DatapointsMultiQuery,
  DoubleDatapoint,
} from '@cognite/sdk';
import { calculateGranularity } from 'utils/timeseries';
import { convertUnits, units } from 'utils/units';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly, { ModeBarDefaultButtons } from 'plotly.js-basic-dist';
import { convertLineStyle } from 'components/PlotlyChart';
import { useSDK } from '@cognite/sdk-provider';
import { functionResponseKey } from 'utils/cogniteFunctions';
import {
  AxisUpdate,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  PlotlyEventData,
  SeriesData,
} from './utils';

type ChartProps = {
  chart: Chart;
  onAxisChange?: ({ x, y }: { x: number[]; y: AxisUpdate[] }) => void;
  showYAxis?: boolean;
};

// Use "basic" version of plotly.js to reduce bundle size
const Plot = createPlotlyComponent(Plotly);

const PlotlyChartComponent = ({
  chart,
  onAxisChange,
  showYAxis,
}: ChartProps) => {
  const sdk = useSDK();
  const pointsPerSeries = 1000;

  const enabledTimeSeries = (chart.timeSeriesCollection || []).filter(
    ({ enabled }) => enabled
  );

  const queries = enabledTimeSeries?.map(({ tsId }) => ({
    items: [{ id: tsId }],
    start: new Date(chart.dateFrom),
    end: new Date(chart.dateTo),
    granularity: calculateGranularity(
      [new Date(chart.dateFrom).getTime(), new Date(chart.dateTo).getTime()],
      pointsPerSeries
    ),
    aggregates: ['average'],
    limit: pointsPerSeries,
  }));

  const queryResult = useQueries(
    queries?.map((q) => ({
      queryKey: ['timeseries', q],
      queryFn: async (): Promise<DatapointAggregate[]> => {
        const r = await sdk.datapoints.retrieve(q as DatapointsMultiQuery);
        return r[0]?.datapoints || [];
      },
    }))
  );

  const enabledWorkflows = chart.workflowCollection?.filter(
    (flow) => flow?.enabled
  );

  const calls = (enabledWorkflows || [])
    .map((wf) => wf.calls?.[0])
    .filter(Boolean) as Call[];

  const functionResults = useQueries(
    calls.map((c) => ({
      queryKey: functionResponseKey(c.functionId, c.callId),
      queryFn: (): Promise<string | undefined> =>
        sdk
          .get(
            `/api/playground/projects/${sdk.project}/functions/${c.functionId}/calls/${c.callId}/response`
          )
          .then((r) => r.data.response),
    }))
  );

  const transformSimpleCalcResult = ({
    value,
    timestamp,
  }: {
    value?: number[];
    timestamp?: number[];
  }) =>
    value?.length && timestamp?.length
      ? zipWith(value, timestamp, (v, t) => ({
          value: v,
          timestamp: new Date(t),
        }))
      : ([] as DoubleDatapoint[]);

  const seriesData: SeriesData[] =
    [
      ...(enabledTimeSeries || []).map((t, i) => ({
        ...t,
        type: 'timeseries',
        width: t.lineWeight,
        range: t.range,
        name: t.name,
        datapoints: convertUnits(
          (queryResult[i]?.data || []) as DatapointAggregate[],
          t.unit,
          t.preferredUnit
        ),
        dash: convertLineStyle(t.lineStyle),
        unit: units.find(
          (unitOption) => unitOption.value === t.preferredUnit?.toLowerCase()
        )?.label,
      })),
      ...(enabledWorkflows || [])
        .filter((wf) => wf.enabled)
        .map((workflow, i) => ({
          id: workflow?.id,
          type: 'workflow',
          range: workflow.range,
          name: workflow.name,
          color: workflow.color,
          width: workflow.lineWeight,
          dash: convertLineStyle(workflow.lineStyle),
          unit: '',
          datapoints: transformSimpleCalcResult(
            (functionResults?.[i]?.data as any) || {}
          ),
        })),
    ] || [];

  const data = seriesData.map(
    ({ name, color, width, dash, datapoints }, index) => {
      return {
        type: 'scatter',
        mode: 'line',
        name,
        marker: {
          color,
        },
        line: { color, width: width || 2, dash: dash || 'solid' },
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
      };
    }
  );

  const handleRelayout = (eventdata: PlotlyEventData) => {
    if (onAxisChange) {
      onAxisChange({
        x: getXaxisUpdateFromEventData(eventdata),
        y: getYaxisUpdatesFromEventData(seriesData, eventdata),
      });
    }
  };

  const layout = {
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
    },
    xaxis: {
      type: 'date',
      domain: showYAxis ? [0.06 * (seriesData.length - 1), 1] : [0, 1],
      range: [chart.dateFrom, chart.dateTo],
    },
    showlegend: false,
    dragmode: 'pan',
    annotations: [],
  };

  seriesData.forEach(({ unit, color, range }, index) => {
    /**
     * For some reason plotly doesn't like that you overwrite the range input (doing this the wrong way?)
     */
    const serializedYRange = range
      ? JSON.parse(JSON.stringify(range))
      : undefined;

    if (showYAxis) {
      (layout as any)[`yaxis${index ? index + 1 : ''}`] = {
        linecolor: color,
        linewidth: 1,
        tickcolor: color,
        tickwidth: 1,
        side: 'right',
        overlaying: index !== 0 ? 'y' : undefined,
        anchor: 'free',
        position: 0.05 * index,
        range: serializedYRange,
        hoverformat: '.2f',
        zeroline: false,
      };

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
    } else {
      (layout as any)[`yaxis${index ? index + 1 : ''}`] = {
        showticklabels: false,
        hoverformat: '.2f',
        domain: [index / seriesData.length, (index + 1) / seriesData.length],
        zeroline: false,
      };
    }
  });

  const config = {
    responsive: true,
    scrollZoom: true,
    displaylogo: false,
    modeBarButtons: [
      ['pan2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
    ] as ModeBarDefaultButtons[][],
  };

  return (
    <Plot
      data={data as Plotly.Data[]}
      layout={(layout as unknown) as Plotly.Layout}
      config={config as Plotly.Config}
      onRelayout={handleRelayout}
    />
  );
};

export default PlotlyChartComponent;
