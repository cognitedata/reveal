import React, { useEffect, useState } from 'react';
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
import Plotly, {
  ModeBarButton,
  ModeBarDefaultButtons,
} from 'plotly.js-basic-dist';
import { convertLineStyle } from 'components/PlotlyChart';
import { useSDK } from '@cognite/sdk-provider';
import { functionResponseKey } from 'utils/cogniteFunctions';
import FunctionCall from 'components/FunctionCall';
import {
  AxisUpdate,
  calculateStackedYRange,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  PlotlyEventData,
  SeriesData,
} from './utils';
import StackedChartIconPath from './StackedChartIcon';

type ChartProps = {
  chart: Chart;
  onAxisChange?: ({ x, y }: { x: number[]; y: AxisUpdate[] }) => void;
  isPreview?: boolean;
  isInSearch?: boolean;
  defaultStackedMode?: boolean;
  cacheTimeseries?: boolean;
};

// Use "basic" version of plotly.js to reduce bundle size
const Plot = createPlotlyComponent(Plotly);

const PlotlyChartComponent = ({
  chart,
  onAxisChange,
  isPreview,
  isInSearch,
  defaultStackedMode = false,
  cacheTimeseries = false,
}: ChartProps) => {
  const sdk = useSDK();
  const pointsPerSeries = isPreview ? 100 : 1000;
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');
  const [stackedMode, setStackedMode] = useState<boolean>(defaultStackedMode);
  const [cache, setCache] = useState<Record<string, DatapointAggregate[]>>({});

  const enabledTimeSeries = (chart.timeSeriesCollection || []).filter(
    ({ enabled }) => enabled
  );

  useEffect(() => {
    if (!cacheTimeseries) {
      return;
    }

    const ids = enabledTimeSeries?.map((t) => t.tsId)?.map((i) => `${i}`) || [];
    const c = { ...cache };
    let updateCache = false;
    Object.keys(cache).forEach((k) => {
      if (!ids.includes(k)) {
        updateCache = true;
        delete c[k];
      }
    });
    if (updateCache) {
      setCache(c);
    }
  }, [cache, enabledTimeSeries, cacheTimeseries]);

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
        return r[0]?.datapoints || ([] as DatapointAggregate[]);
      },
    }))
  );

  useEffect(() => {
    if (!cacheTimeseries) {
      return;
    }
    let updateCache = false;
    const c = { ...cache };
    queryResult.forEach((r, i) => {
      if (
        r.isFetched &&
        r.data &&
        queries[i].items[0].id &&
        c[queries[i].items[0].id.toString()] !== r.data
      ) {
        updateCache = true;
        c[queries[i].items[0].id.toString()] = r.data as DatapointAggregate[];
      }
    });
    if (updateCache) {
      setCache(c);
    }
  }, [queryResult, cache, queries, cacheTimeseries]);

  const enabledWorkflows = !isPreview
    ? chart.workflowCollection?.filter((flow) => flow?.enabled)
    : [];

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
      retry: 1,
      retryDelay: 1000,
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
        outdatedData: !!cache[t.tsId] && !queryResult[i]?.data,
        datapoints: convertUnits(
          (queryResult[i]?.data || cache[t.tsId] || []) as DatapointAggregate[],
          t.unit,
          t.preferredUnit
        ),
        dash: convertLineStyle(t.lineStyle),
        mode: t.displayMode,
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
          mode: workflow.displayMode,
          width: workflow.lineWeight,
          dash: convertLineStyle(workflow.lineStyle),
          unit: units.find(
            (unitOption) =>
              unitOption.value === workflow.preferredUnit?.toLowerCase()
          )?.label,
          datapoints: convertUnits(
            transformSimpleCalcResult(
              (functionResults?.[i]?.data as any) || {}
            ),
            workflow.unit,
            workflow.preferredUnit
          ),
        })),
    ] || [];

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
        // Should not edit the saved y-axis ranges if in stacked mode or in search
        y: !(stackedMode || isInSearch)
          ? getYaxisUpdatesFromEventData(seriesData, eventdata)
          : [],
      });
    }

    setDragmode(eventdata.dragmode || dragmode);
  };

  const showYAxis = !isInSearch && !isPreview;
  const marginValue = isPreview ? 0 : 50;

  const layout = {
    margin: { l: marginValue, r: marginValue, b: marginValue, t: marginValue },
    xaxis: {
      type: 'date',
      domain: showYAxis ? [0.06 * (seriesData.length - 1), 1] : [0, 1],
      range: [chart.dateFrom, chart.dateTo],
    },
    showlegend: false,
    dragmode,
    annotations: [],
  };

  const yAxisDefaults = {
    hoverformat: '.2f',
    zeroline: false,
  };

  seriesData.forEach(({ unit, color, range, datapoints }, index) => {
    /**
     * For some reason plotly doesn't like that you overwrite the range input (doing this the wrong way?)
     */
    const serializedYRange = range
      ? JSON.parse(JSON.stringify(range))
      : undefined;

    if (isInSearch) {
      (layout as any)[`yaxis${index ? index + 1 : ''}`] = {
        ...yAxisDefaults,
        showticklabels: false,
        domain: [index / seriesData.length, (index + 1) / seriesData.length],
      };
    } else {
      (layout as any)[`yaxis${index ? index + 1 : ''}`] = {
        ...yAxisDefaults,
        visible: !isPreview,
        linecolor: color,
        linewidth: 1,

        tickcolor: color,
        tickwidth: 1,
        side: 'right',
        overlaying: index !== 0 ? 'y' : undefined,
        anchor: 'free',
        position: 0.05 * index,
        range: stackedMode
          ? calculateStackedYRange(
              datapoints as (Datapoints | DatapointAggregate)[],
              index,
              seriesData.length
            )
          : serializedYRange,
      };

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
    }
  });

  const config = {
    staticPlot: isPreview,
    responsive: true,
    scrollZoom: true,
    displaylogo: false,
    modeBarButtons: [
      [
        {
          name: `${stackedMode ? 'Disable' : 'Enable'} stacking`,
          icon: {
            width: '16',
            height: '16',
            path: StackedChartIconPath,
          },
          click: () => {
            setStackedMode(!stackedMode);
          },
        },
      ],
      ['pan2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
    ] as (ModeBarDefaultButtons[] | ModeBarButton[])[],
  };

  return (
    <>
      <Plot
        data={data as Plotly.Data[]}
        layout={(layout as unknown) as Plotly.Layout}
        config={config as Plotly.Config}
        onRelayout={handleRelayout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
      {calls?.map((call) => (
        <FunctionCall
          key={`${call.functionId}/${call.callId}`}
          id={call.functionId}
          callId={call.callId}
        />
      ))}
    </>
  );
};

export default PlotlyChartComponent;
