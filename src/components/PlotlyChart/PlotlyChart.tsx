import React, { useEffect, useState } from 'react';
import useSelector from 'hooks/useSelector';
import { Chart } from 'reducers/charts';
import client from 'services/CogniteSDK';
import {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DoubleDatapoint,
  StringDatapoint,
} from '@cognite/sdk';
import { calculateGranularity } from 'utils/timeseries';
import { convertUnits, units } from 'utils/units';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { convertLineStyle } from 'components/PlotlyChart';
import {
  AxisUpdate,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  PlotlyEventData,
  SeriesData,
} from './utils';

type ChartProps = {
  chart?: Chart;
  onAxisChange?: ({ x, y }: { x: number[]; y: AxisUpdate[] }) => void;
};

// Use "basic" version of plotly.js to reduce bundle size
const Plot = createPlotlyComponent(Plotly);

const PlotlyChartComponent = ({ chart, onAxisChange }: ChartProps) => {
  const [timeSeriesDataPoints, setTimeSeriesDataPoints] = useState<
    (Datapoints | DatapointAggregates)[]
  >([]);

  useEffect(() => {
    async function performQuery() {
      const enabledTimeSeries = (chart?.timeSeriesCollection || []).filter(
        ({ enabled }) => enabled
      );

      if (!chart || !enabledTimeSeries.length) {
        setTimeSeriesDataPoints([]);
        return;
      }

      const pointsPerSeries = 1000;

      const result = await client.datapoints.retrieve({
        items: enabledTimeSeries.map(({ id }) => ({ externalId: id })),
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
      });

      const convertedResult = await Promise.all(
        (result as (Datapoints | DatapointAggregates)[]).map(
          async (ts: Datapoints | DatapointAggregates) => {
            return {
              ...ts,
              datapoints: await convertUnits(
                ts.datapoints,
                chart?.timeSeriesCollection
                  ?.find(({ id }) => id === ts.externalId)
                  ?.unit?.toLowerCase(),
                chart?.timeSeriesCollection
                  ?.find(({ id }) => id === ts.externalId)
                  ?.preferredUnit?.toLowerCase()
              ),
            } as typeof ts;
          }
        )
      );

      setTimeSeriesDataPoints(convertedResult);
    }

    performQuery();
  }, [chart?.timeSeriesCollection, chart?.dateFrom, chart?.dateTo]);

  const enabledWorkflows = useSelector((state) =>
    chart?.workflowCollection
      ?.filter((flow) => flow?.enabled)
      .map(({ id }) => state.workflows.entities[id])
  )?.filter(Boolean);

  const seriesData: SeriesData[] =
    [
      ...timeSeriesDataPoints
        .filter((ts) => !ts.isString)
        .map((ts) => ({
          id: ts.externalId,
          type: 'timeseries',
          range: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.range,
          name: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.name,
          color: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.color,
          width: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.lineWeight,
          dash: convertLineStyle(
            chart?.timeSeriesCollection?.find(({ id }) => id === ts.externalId)
              ?.lineStyle
          ),
          unit: units.find(
            (unitOption) =>
              unitOption.value ===
              chart?.timeSeriesCollection
                ?.find(({ id }) => id === ts.externalId)
                ?.preferredUnit?.toLowerCase()
          )?.label,
          datapoints: ts.datapoints,
        })),
      ...(enabledWorkflows || [])
        .filter((workflow) => workflow?.latestRun?.status === 'SUCCESS')
        .map((workflow) => ({
          id: workflow?.id,
          type: 'workflow',
          range: chart?.workflowCollection?.find(
            (chartWorkflow) => workflow?.id === chartWorkflow.id
          )?.range,
          name: chart?.workflowCollection?.find(
            (chartWorkflow) => workflow?.id === chartWorkflow.id
          )?.name,
          color: chart?.workflowCollection?.find(
            (chartWorkflow) => workflow?.id === chartWorkflow.id
          )?.color,
          width: chart?.workflowCollection?.find(
            (chartWorkflow) => workflow?.id === chartWorkflow.id
          )?.lineWeight,
          dash: convertLineStyle(
            chart?.workflowCollection?.find(
              (chartWorkflow) => workflow?.id === chartWorkflow.id
            )?.lineStyle
          ),
          unit: workflow?.latestRun?.results?.datapoints.unit,
          datapoints: workflow?.latestRun?.results?.datapoints.datapoints as (
            | StringDatapoint
            | DoubleDatapoint
            | DatapointAggregate
          )[],
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

  /**
   * For some reason plotly doesn't like that you overwrite the range input (doing this the wrong way?)
   */
  const serializedXRange = chart?.visibleRange
    ? JSON.parse(JSON.stringify(chart?.visibleRange))
    : undefined;

  const layout = {
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
    },
    xaxis: {
      type: 'date',
      domain: [0.06 * (seriesData.length - 1), 1],
      range: serializedXRange,
    },
    showlegend: true,
    legend: { orientation: 'h', yshift: 10 },
    annotations: [],
  };

  seriesData.forEach(({ unit, color, range }, index) => {
    /**
     * For some reason plotly doesn't like that you overwrite the range input (doing this the wrong way?)
     */
    const serializedYRange = range
      ? JSON.parse(JSON.stringify(range))
      : undefined;

    (layout as any)[`yaxis${index ? index + 1 : ''}`] = {
      linecolor: color,
      linewidth: 3,
      tickcolor: color,
      tickwidth: 3,
      side: 'right',
      overlaying: index !== 0 ? 'y' : undefined,
      anchor: 'free',
      position: 0.05 * index,
      showline: true,
      range: serializedYRange,
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
