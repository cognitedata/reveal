import { DatapointAggregate, Datapoints, DoubleDatapoint } from '@cognite/sdk';
import dayjs from 'dayjs';
import groupBy from 'lodash/groupBy';
import { ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import { roundToSignificantDigits } from 'utils/axis';
import { hexToRGBA } from 'utils/colors';
import { convertUnits, units } from 'utils/units';

export type PlotlyEventData = {
  [key: string]: any;
};

export type SeriesInfo = {
  id: string | undefined;
  type: string;
  name: string | undefined;
  color: string | undefined;
  width: number | undefined;
  dash: string;
  mode: string | undefined;
  datapoints: (Datapoints | DatapointAggregate)[];
  outdatedData?: boolean;
};

export type SeriesData = {
  enabled?: boolean;
  range: number[] | undefined;
  unit: string | undefined;
  series: SeriesInfo[];
};

export type AxisUpdate = {
  id: string;
  type: string;
  range: any[];
};

export function calculateSeriesData(
  timeSeriesCollection: ChartTimeSeries[] = [],
  workflowCollection: ChartWorkflow[] = [],
  timeseries: DatapointAggregate[][],
  timeseriesFetching: boolean,
  workflows: { value: number; timestamp: Date }[][],
  workflowsRunning: boolean,
  mergeUnits: boolean
): SeriesData[] {
  const seriesData: SeriesData[] = [
    ...timeSeriesCollection
      .map((t, i) => ({
        enabled: t.enabled,
        range: t.range,
        unit: units.find(
          (unitOption) => unitOption.value === t.preferredUnit?.toLowerCase()
        )?.label,
        series: [
          {
            ...t,
            type: 'timeseries',
            width: t.lineWeight,
            name: t.name,
            outdatedData: timeseriesFetching,
            datapoints: convertUnits(
              (timeseries?.[i] || []) as DatapointAggregate[],
              t.unit,
              t.preferredUnit
            ),
            dash: convertLineStyle(t.lineStyle),
            mode: t.displayMode,
          },
        ],
      }))
      .filter((t) => t.enabled),
    ...workflowCollection
      .map((workflow, i) => ({
        enabled: workflow.enabled,
        range: workflow.range,
        unit: units.find(
          (unitOption) =>
            unitOption.value === workflow.preferredUnit?.toLowerCase()
        )?.label,
        series: [
          {
            enabled: workflow.enabled,
            outdatedData: workflowsRunning,
            id: workflow?.id,
            type: 'workflow',
            name: workflow.name,
            color: workflow.color,
            mode: workflow.displayMode,
            width: workflow.lineWeight,
            dash: convertLineStyle(workflow.lineStyle),
            datapoints: convertUnits(
              workflows?.[i] || [],
              workflow.unit,
              workflow.preferredUnit
            ),
          },
        ],
      }))
      .filter((t) => t.enabled),
  ];

  if (mergeUnits) {
    const mergedSeries: SeriesData[] = [];
    const seriesGrouppedByUnit = groupBy(seriesData, 'unit');
    Object.keys(seriesGrouppedByUnit).forEach((unit) => {
      if (unit === 'undefined') {
        mergedSeries.push(...seriesGrouppedByUnit[unit]);
      } else {
        mergedSeries.push({
          enabled: true,
          unit,
          range: calculateMaxRange(seriesGrouppedByUnit[unit]),
          series: seriesGrouppedByUnit[unit].reduce(
            (result: any[], { series }: SeriesData) => result.concat(...series),
            []
          ),
        });
      }
    });
    return mergedSeries;
  }

  // Check if there is a workflow to be grouped
  const workflowsToBeAttached = workflowCollection.filter(
    (t) => t.enabled && t.attachTo
  );

  // Group workflows with the correct y-axes
  if (workflowsToBeAttached.length > 0) {
    seriesData.forEach((current, i) => {
      const { series } = current;
      const relatedWorkflowIds = workflowsToBeAttached
        .filter((wf) => wf.attachTo! === series[0].id)
        .map((wf) => wf.id);

      if (relatedWorkflowIds.length > 0) {
        relatedWorkflowIds.forEach((id) => {
          const workflowIndex = seriesData.findIndex(
            (s) => s.series[0].id === id
          );

          series.push(...seriesData[workflowIndex]!.series);
          current.range = calculateMaxRange([
            seriesData[i],
            seriesData[workflowIndex],
          ]);

          // Workflow is grouped, remove from seriesData
          seriesData.splice(workflowIndex, 1);
        });
      }
    });
  }

  return seriesData;
}

export function calculateMaxRange(series: SeriesData[]): number[] {
  const lowerRanges = series.map((s) => s.range?.[0]).filter(Boolean);
  const upperRanges = series.map((s) => s.range?.[1]).filter(Boolean);

  return [
    Math.min(...(lowerRanges as number[])),
    Math.max(...(upperRanges as number[])),
  ];
}

export function formatPlotlyData(
  seriesData: SeriesData[],
  hideMinMax: boolean
): Plotly.Data[] {
  const groupedAggregateTraces = seriesData.map(({ series }, index) =>
    series.map(
      ({ name, color, mode, width, dash, datapoints, outdatedData }) => {
        /* kinda hacky solution to compare min and avg in cases where min is less than avg and need to be fill based on that, 
    In addition, should min value be less than avg value? */
        const firstDatapoint = (
          datapoints as (Datapoints | DatapointAggregate)[]
        ).find((x) => x);
        const currMin = firstDatapoint
          ? ('min' in firstDatapoint
              ? firstDatapoint.min
              : (firstDatapoint as DoubleDatapoint).value) ?? 0
          : 0;
        const currAvg = firstDatapoint
          ? ('average' in firstDatapoint
              ? firstDatapoint.average
              : (firstDatapoint as DoubleDatapoint).value) ?? 0
          : 0;

        const avgYValues = (
          datapoints as (Datapoints | DatapointAggregate)[]
        ).map((datapoint) =>
          'average' in datapoint
            ? datapoint.average
            : (datapoint as DoubleDatapoint).value
        );

        const minYValues = (
          datapoints as (Datapoints | DatapointAggregate)[]
        ).map((datapoint) =>
          'min' in datapoint
            ? datapoint.min
            : (datapoint as DoubleDatapoint).value
        );

        const maxYValues = (
          datapoints as (Datapoints | DatapointAggregate)[]
        ).map((datapoint) =>
          'max' in datapoint
            ? datapoint.max
            : (datapoint as DoubleDatapoint).value
        );

        const average = {
          type: 'scatter',
          mode: mode || 'lines',
          opacity: outdatedData ? 0.5 : 1,
          name,
          marker: {
            color,
          },
          fill: 'none',
          line: { color, width: width || 1, dash: dash || 'solid' },
          yaxis: `y${index !== 0 ? index + 1 : ''}`,
          x: (datapoints as (Datapoints | DatapointAggregate)[]).map(
            (datapoint) =>
              'timestamp' in datapoint ? new Date(datapoint.timestamp) : null
          ),
          y: avgYValues,
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

        const min = {
          ...average,
          y: minYValues,
          line: { width: 0 },
          fill: currMin > currAvg ? 'tonexty' : 'none',
          fillcolor: hexToRGBA(color, 0.2) ?? 'none',
          hovertemplate: '',
          hoverinfo: 'skip',
        };

        const max = {
          ...average,
          y: maxYValues,
          fillcolor: hexToRGBA(color, 0.2) ?? 'none',
          line: { width: 0 },
          fill: 'tonexty',
          hovertemplate: '',
          hoverinfo: 'skip',
        };

        return hideMinMax ? [average] : [average, min, max];
      }
    )
  );

  // flatten the grouped traces into list of traces.
  return groupedAggregateTraces.flat(2) as Plotly.Data[];
}

export function getYaxisUpdatesFromEventData(
  seriesData: SeriesData[],
  eventdata: PlotlyEventData
) {
  const axisUpdates: AxisUpdate[] = Object.values(
    Object.keys(eventdata)
      .filter((key) => key.includes('yaxis'))
      .reduce((result: { [key: string]: any }, key) => {
        const axisIndex = (+key.split('.')[0].split('yaxis')[1] || 1) - 1;
        const { series } = seriesData[axisIndex];

        const update = series.reduce((diff: { [key: string]: any }, s) => {
          const { id = '', type = '' } = s;
          const range = ((result[id] || {}).range || []).concat(eventdata[key]);

          return {
            ...diff,
            [id]: { ...(diff[id] || {}), id, type, range },
          };
        }, {});

        return {
          ...result,
          ...update,
        };
      }, {})
  );

  return axisUpdates;
}

export function getXaxisUpdateFromEventData(
  eventdata: PlotlyEventData
): string[] {
  const xaxisKeys = Object.keys(eventdata).filter((key) =>
    key.includes('xaxis')
  );
  return xaxisKeys.map((key) => new Date(eventdata[key]).toJSON());
}

export function calculateStackedYRange(
  datapoints: (Datapoints | DatapointAggregate)[],
  index: number,
  numSeries: number
): number[] {
  const data = datapoints.map((datapoint) =>
    'average' in datapoint
      ? datapoint.average
      : (datapoint as DoubleDatapoint).value
  );

  const min = Math.min(...(data as number[]));
  const max = Math.max(...(data as number[]));
  const range = max - min;

  const lower = min - index * range;
  const upper = lower + numSeries * range;

  return [lower, upper];
}

export function convertLineStyle(lineStyle?: 'solid' | 'dashed' | 'dotted') {
  switch (lineStyle) {
    case 'solid':
      return 'solid';
    case 'dashed':
      return 'dash';
    case 'dotted':
      return 'dot';
    default:
      return 'solid';
  }
}

export function generateLayout({
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
}: any): any {
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
        dayjs(dateFrom).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(dateTo).format('YYYY-MM-DD HH:mm:ss'),
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

  seriesData.forEach(({ unit, range, series }: any, index: any) => {
    const { color } = series[0];
    const datapoints = series.reduce(
      (acc: (Datapoints | DatapointAggregate)[], s: SeriesInfo) =>
        acc.concat(s.datapoints),
      []
    );

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

  return layout;
}
