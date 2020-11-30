import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import useSelector from 'hooks/useSelector';
import { Chart } from 'reducers/charts';
import client from 'services/CogniteSDK';
import { Datapoints, DoubleDatapoint } from '@cognite/sdk';

const defaultOptions = {
  time: {
    useUTC: false,
  },
  chart: {
    margin: [30, 20, 65, 70],
    zoomType: 'xy',
  },
  title: {
    text: undefined,
  },
  xAxis: {
    type: 'datetime',
  },
  legend: {
    enabled: false,
  },
};

type ChartProps = {
  chart?: Chart;
};

const ChartComponent = ({ chart }: ChartProps) => {
  const [timeSeriesDataPoints, setTimeSeriesDataPoints] = useState<
    Datapoints[]
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

      const result = (await client.datapoints.retrieve({
        items: enabledTimeSeries.map(({ id }) => ({ externalId: id })),
        start: new Date(chart.dateFrom),
        end: new Date(chart.dateTo),
      })) as Datapoints[];

      setTimeSeriesDataPoints(result);
    }

    performQuery();
  }, [chart?.timeSeriesCollection, chart?.dateFrom, chart?.dateTo]);

  const workflows = useSelector((state) =>
    chart?.workflowIds
      ?.filter((flow) => flow?.enabled)
      .map(({ id }) => state.workflows.entities[id])
  )?.filter(Boolean);

  const dataFromWorkflows = workflows
    ?.filter((workflow) => workflow?.latestRun?.status === 'SUCCESS')
    .map((workflow) => ({
      id: workflow?.id,
      name: workflow?.name,
      data: workflow?.latestRun?.results,
    }));

  const options = {
    ...defaultOptions,
    series: [
      ...timeSeriesDataPoints
        .filter((ts) => !ts.isString)
        .map((ts) => ({
          type: 'line',
          name: ts.externalId,
          color: chart?.timeSeriesCollection?.find(
            ({ id }) => id === ts.externalId
          )?.color,
          data: (ts.datapoints as DoubleDatapoint[]).map((datapoint) => ({
            x: new Date(datapoint.timestamp),
            y: datapoint.value,
          })),
        })),
      ...(dataFromWorkflows || []).map(({ data = {}, name, id }: any) => {
        return {
          type: 'line',
          name,
          color: chart?.workflowIds?.find((flowEntry) => id === flowEntry.id)
            ?.color,
          data: ((data.datapoints || []) as DoubleDatapoint[]).map(
            (datapoint) => ({
              x: new Date(datapoint.timestamp),
              y: datapoint.value,
            })
          ),
        };
      }),
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ChartComponent;
