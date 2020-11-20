import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import useSelector from 'hooks/useSelector';
import { Chart } from 'reducers/charts';
import client from 'services/CogniteSDK';
import { Datapoints, DoubleDatapoint } from '@cognite/sdk';

const defaultOptions = {
  chart: {
    margin: [30, 20, 65, 70],
  },
  title: {
    text: undefined,
  },
  xAxis: {
    type: 'datetime',
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
      if (!chart?.timeSeriesIds?.length) {
        return;
      }

      const result = (await client.datapoints.retrieve({
        items: chart.timeSeriesIds.map((id) => ({ externalId: id })),
      })) as Datapoints[];

      setTimeSeriesDataPoints(result);
    }

    performQuery();
  }, [chart?.timeSeriesIds]);

  const workflows = useSelector((state) =>
    chart?.workflowIds?.map((id) => state.workflows.entities[id])
  )?.filter(Boolean);

  const dataFromWorkflows = workflows
    ?.filter((workflow) => workflow?.latestRun?.status === 'SUCCESS')
    .map((workflow) => ({
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
          data: (ts.datapoints as DoubleDatapoint[]).map((datapoint) => [
            datapoint.timestamp,
            datapoint.value,
          ]),
        })),
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ChartComponent;
