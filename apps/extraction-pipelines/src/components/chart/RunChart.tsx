import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import Plot from 'react-plotly.js';
import {
  DateFormatRecordType,
  mapDataForChart,
} from 'components/chart/runChartUtils';
import { Colors } from '@cognite/cogs.js';
import Plotly from 'plotly.js';
import { RunUI } from 'model/Runs';
import { useTranslation } from 'common';

interface ChartProps {
  allRuns: RunUI[];
  timeFormat: DateFormatRecordType;
}

export const RunChart: FunctionComponent<ChartProps> = ({
  allRuns,
  timeFormat,
}: PropsWithChildren<ChartProps>) => {
  const { t } = useTranslation();
  const [seen, setSeen] = useState<number[]>([]);
  const [success, setSuccess] = useState<number[]>([]);
  const [failure, setFailure] = useState<number[]>([]);
  const [customData, setCustomData] = useState<number[][]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const {
      successByDate,
      failureByDate,
      seenByDate,
      allDates,
      statusCountAndTotal,
    } = mapDataForChart({ data: allRuns, by: timeFormat.format });
    setSeen(seenByDate);
    setSuccess(successByDate);
    setFailure(failureByDate);
    setCustomData(statusCountAndTotal);
    setDates(allDates);
  }, [allRuns, timeFormat.format]);

  const layout = (text: string): Partial<Plotly.Layout> => {
    return {
      height: 400,
      title: 'Runs',
      xaxis: {
        title: t('run-chart-group-by-date', { text }),
        tickfont: {
          size: 14,
          color: 'rgb(107, 107, 107)',
        },
      },
      yaxis: {
        title: t('run-chart-count'),
        tickformat: ',d',
        tickfont: {
          size: 14,
          color: 'rgb(107, 107, 107)',
        },
      },
      hoverlabel: {
        bgcolor: 'white',
      },
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'rgba(255, 255, 255, 0)',
        bordercolor: 'rgba(255, 255, 255, 0)',
      },
      barmode: 'stack',
      showlegend: false,
      hovermode: 'x',
    };
  };

  const chartData: Plotly.Data[] = [
    {
      x: dates, // dates
      y: success, // number of occuences per date
      name: t('success'),
      type: 'bar',
      mode: 'lines',
      customdata: customData,
      hovertemplate: `<span style="padding: 20px">${t(
        'total'
      )}: <b>%{customdata[2]}</b> ${t(
        'failure'
      )}: <span style="color: red">%{customdata[1]}</span> ${t(
        'success'
      )}: %{customdata[0]}</span><extra></extra>`,
      marker: {
        color: `${Colors.success.hex()}`,
      },
      showlegend: false,
    },
    {
      x: dates,
      y: failure,
      name: t('failure'),
      type: 'bar',
      mode: 'markers',
      hoverinfo: 'x',
      marker: {
        color: `${Colors.danger.hex()}`,
      },
      showlegend: false,
    },
    {
      x: dates,
      y: seen,
      name: t('seen'),
      type: 'scatter',
      marker: {
        color: `${Colors.primary.hex()}`,
      },
    },
  ];

  return (
    //@ts-ignore
    <Plot
      data={chartData}
      layout={layout(timeFormat.label)}
      config={{ responsive: true }}
    />
  );
};
