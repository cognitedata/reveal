import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import Plot from 'react-plotly.js';
import {
  GroupByTimeFormat,
  mapDataForChart,
} from 'components/chart/runChartUtils';
import { Colors } from '@cognite/cogs.js';
import { uppercaseFirstWord } from 'utils/primitivesUtils';
import Plotly from 'plotly.js';
import { RunStatusUI } from 'model/Status';
import { RunUI } from 'model/Runs';

interface ChartProps {
  allRuns: RunUI[];
  byTimeFormat: GroupByTimeFormat;
  timeFormat: string;
}

const layout = (text: string): Partial<Plotly.Layout> => {
  return {
    height: 400,
    title: 'Runs',
    xaxis: {
      title: `Grouped by date: ${text}`,
      tickfont: {
        size: 14,
        color: 'rgb(107, 107, 107)',
      },
    },
    yaxis: {
      title: 'Count',
      tickformat: ',d',
      tickfont: {
        size: 14,
        color: 'rgb(107, 107, 107)',
      },
    },
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'rgba(255, 255, 255, 0)',
      bordercolor: 'rgba(255, 255, 255, 0)',
    },
    barmode: 'stack',
    showlegend: false,
  };
};

export const RunChart: FunctionComponent<ChartProps> = ({
  allRuns,
  byTimeFormat,
  timeFormat,
}: PropsWithChildren<ChartProps>) => {
  const [seen, setSeen] = useState<number[]>([]);
  const [success, setSuccess] = useState<number[]>([]);
  const [failure, setFailure] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const {
      successByDate,
      failureByDate,
      seenByDate,
      allDates,
    } = mapDataForChart({ data: allRuns, by: byTimeFormat });
    setSeen(seenByDate);
    setSuccess(successByDate);
    setFailure(failureByDate);
    setDates(allDates);
  }, [allRuns, byTimeFormat]);

  const chartData: Partial<Plotly.PlotData>[] = [
    {
      x: dates, // dates
      y: success, // number of occuences per date
      name: `${uppercaseFirstWord(RunStatusUI.SUCCESS)}`,
      type: 'bar',
      marker: {
        color: `${Colors.success.hex()}`,
      },
    },
    {
      x: dates,
      y: failure,
      name: `${uppercaseFirstWord(RunStatusUI.FAILURE)}`,
      type: 'bar',
      marker: {
        color: `${Colors.danger.hex()}`,
      },
    },
    {
      x: dates,
      y: seen,
      name: `${uppercaseFirstWord(RunStatusUI.SEEN)}`,
      type: 'scatter',
      marker: {
        color: `${Colors.primary.hex()}`,
      },
    },
  ];
  return (
    <Plot
      data={chartData}
      layout={layout(timeFormat)}
      config={{ responsive: true }}
    />
  );
};
