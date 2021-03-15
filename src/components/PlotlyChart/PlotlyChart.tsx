import React from 'react';
import { useQueries, useQuery } from 'react-query';
import zipWith from 'lodash/zipWith';
import { Call, Chart } from 'reducers/charts/types';
import {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DatapointsMultiQuery,
  DoubleDatapoint,
} from '@cognite/sdk';
import { calculateGranularity } from 'utils/timeseries';
import { convertUnits, units } from 'utils/units';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
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
  const query =
    !!chart && enabledTimeSeries.length > 0
      ? {
          items: enabledTimeSeries.map(({ tsId }) => ({ id: tsId })),
          start: new Date(chart.dateFrom),
          end: new Date(chart.dateTo),
          granularity: calculateGranularity(
            [
              new Date(chart.dateFrom).getTime(),
              new Date(chart.dateTo).getTime(),
            ],
            pointsPerSeries
          ),
          aggregates: ['average'],
          limit: pointsPerSeries,
        }
      : undefined;

  const { data: timeSeriesDataPoints = [] } = useQuery(
    ['timeseries', query],
    async () => {
      const result = await sdk.datapoints.retrieve(
        query as DatapointsMultiQuery
      );
      return Promise.all(
        (result as (Datapoints | DatapointAggregates)[]).map(
          async (ts: Datapoints | DatapointAggregates) => {
            return {
              ...ts,
              datapoints: await convertUnits(
                ts.datapoints,
                chart.timeSeriesCollection
                  ?.find(({ id }) => id === ts.externalId)
                  ?.unit?.toLowerCase(),
                chart.timeSeriesCollection
                  ?.find(({ id }) => id === ts.externalId)
                  ?.preferredUnit?.toLowerCase()
              ),
            } as typeof ts;
          }
        )
      );
    },
    {
      enabled: !!query,
    }
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
      ...(chart.timeSeriesCollection || [])
        .filter((t) => t.enabled)
        .map((t) => ({
          ...t,
          type: 'timeseries',
          width: t.lineWeight,
          range: t.range,
          datapoints:
            timeSeriesDataPoints.find((dp) => t.tsId === dp.id)?.datapoints ||
            [],
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
    ].filter(({ datapoints }) => datapoints?.length) || [];

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
        linewidth: 3,
        tickcolor: color,
        tickwidth: 3,
        side: 'right',
        overlaying: index !== 0 ? 'y' : undefined,
        anchor: 'free',
        position: 0.05 * index,
        range: serializedYRange,
        hoverformat: '.2f',
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

  return (
    <Plot
      // @ts-ignore
      data={data}
      // @ts-ignore
      layout={layout}
      config={{ responsive: true, scrollZoom: true }}
      onRelayout={handleRelayout}
    />
  );
};

export default PlotlyChartComponent;
