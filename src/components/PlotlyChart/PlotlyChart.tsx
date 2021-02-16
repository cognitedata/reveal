import React, { useEffect, useState } from 'react';
import useSelector from 'hooks/useSelector';
import { Chart } from 'reducers/charts';
import client from 'services/CogniteSDK';
import {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DoubleDatapoint,
} from '@cognite/sdk';
import { calculateGranularity } from 'utils/timeseries';
import { convertUnits, units } from 'utils/units';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

type ChartProps = {
  chart?: Chart;
};

// Use "basic" version of plotly.js to reduce bundle size
const Plot = createPlotlyComponent(Plotly);

const PlotlyChartComponent = ({ chart }: ChartProps) => {
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

  const seriesData =
    [
      ...timeSeriesDataPoints
        .filter((ts) => !ts.isString)
        .map((ts) => ({
          id: ts.externalId,
          name: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.name,
          color: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.color,
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
          name: chart?.workflowCollection?.find(
            (chartWorkflow) => workflow?.id === chartWorkflow.id
          )?.name,
          color: chart?.workflowCollection?.find(
            (chartWorkflow) => workflow?.id === chartWorkflow.id
          )?.color,
          unit: workflow?.latestRun?.results?.datapoints.unit,
          datapoints: workflow?.latestRun?.results?.datapoints.datapoints as (
            | Datapoints
            | DatapointAggregate
          )[],
        })),
    ].filter(({ datapoints }) => datapoints?.length) || [];

  const data = seriesData.map(({ name, color, datapoints }, index) => {
    return {
      type: 'scatter',
      mode: 'line',
      name,
      marker: {
        color,
        line: { color },
      },
      yaxis: `y${index !== 0 ? index + 1 : ''}`,
      x: (datapoints as (Datapoints | DatapointAggregate)[]).map((datapoint) =>
        'timestamp' in datapoint ? new Date(datapoint.timestamp) : null
      ),
      y: (datapoints as (Datapoints | DatapointAggregate)[]).map((datapoint) =>
        'average' in datapoint
          ? datapoint.average
          : (datapoint as DoubleDatapoint).value
      ),
    };
  });

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
    },
    showlegend: true,
    legend: { orientation: 'h', yshift: 10 },
    annotations: [],
  };

  seriesData.forEach(({ unit, color }, index) => {
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
    />
  );
};

export default PlotlyChartComponent;
