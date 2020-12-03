import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import useSelector from 'hooks/useSelector';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'reducers/charts';
import client from 'services/CogniteSDK';
import {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DoubleDatapoint,
} from '@cognite/sdk';
import { calculateGranularity } from 'utils/timeseries';

const defaultOptions = {
  time: {
    useUTC: false,
  },
  chart: {
    zoomType: 'xy',
  },
  title: {
    text: undefined,
  },
  xAxis: {
    type: 'datetime',
  },
  legend: {
    enabled: true,
    verticalAlign: 'top',
  },
};

type ChartProps = {
  chart?: Chart;
};

const ChartComponent = ({ chart }: ChartProps) => {
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

      setTimeSeriesDataPoints(result);
    }

    performQuery();
  }, [chart?.timeSeriesCollection, chart?.dateFrom, chart?.dateTo]);

  const enabledWorkflows = useSelector((state) =>
    chart?.workflowCollection
      ?.filter((flow) => flow?.enabled)
      .map(({ id }) => state.workflows.entities[id])
  )?.filter(Boolean);

  const dataFromWorkflows =
    enabledWorkflows
      ?.filter((workflow) => workflow?.latestRun?.status === 'SUCCESS')
      .map((workflow) => ({
        id: workflow?.id,
        name: workflow?.name,
        data: workflow?.latestRun?.results,
      }))
      .filter(({ data }) => data) || [];

  const options = {
    ...defaultOptions,
    yAxis: [
      ...(chart?.timeSeriesCollection || []),
      ...(chart?.workflowCollection || []),
    ]
      .filter(({ enabled }) => enabled)
      .map(({ color }: ChartTimeSeries | ChartWorkflow) => ({
        title: {
          text: 'Unit',
          style: {
            color,
          },
        },
        lineColor: color,
        lineWidth: 1,
        tickColor: color,
        tickWidth: 1,
        labels: {
          style: {
            color,
          },
        },
        opposite: true,
      })),
    series: [
      ...timeSeriesDataPoints
        .filter((ts) => !ts.isString)
        .map((ts) => ({
          type: 'line',
          name: ts.externalId,
          color: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.color,
          data: (ts.datapoints as (Datapoints | DatapointAggregate)[]).map(
            (datapoint) => ({
              ...('timestamp' in datapoint
                ? {
                    x: datapoint.timestamp,
                  }
                : {}),
              ...('value' in datapoint
                ? {
                    y: (datapoint as DoubleDatapoint).value,
                  }
                : {}),
              ...('average' in datapoint
                ? {
                    y: datapoint.average,
                  }
                : {}),
            })
          ),
        })),
      ...dataFromWorkflows.map(({ data = {}, name, id }) => {
        return {
          type: 'line',
          name,
          color: chart?.workflowCollection?.find(
            (workflow) => id === workflow.id
          )?.color,
          data: data.datapoints.map((datapoint: any) => ({
            ...('timestamp' in datapoint
              ? {
                  x: datapoint.timestamp,
                }
              : {}),
            ...('value' in datapoint
              ? {
                  y: (datapoint as DoubleDatapoint).value,
                }
              : {}),
            ...('average' in datapoint
              ? {
                  y: datapoint.average,
                }
              : {}),
          })),
        };
      }),
    ].map((series, seriesIndex) => ({
      ...series,
      yAxis: seriesIndex,
    })),
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ChartComponent;
