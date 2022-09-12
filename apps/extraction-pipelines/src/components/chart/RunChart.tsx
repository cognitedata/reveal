import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  DateFormatRecordType,
  DateFormatsRecord,
  mapDataForChart,
  mapRangeToGraphTimeFormat,
} from 'components/chart/runChartUtils';
import { Colors } from '@cognite/cogs.js';
import Plotly from 'plotly.js';
import { useTranslation } from 'common';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { useAllRuns } from 'hooks/useRuns';

interface ChartProps {
  externalId: string;
}

export const RunChart = ({ externalId }: ChartProps) => {
  const { t } = useTranslation();
  const [seen, setSeen] = useState<number[]>([]);
  const [success, setSuccess] = useState<number[]>([]);
  const [failure, setFailure] = useState<number[]>([]);
  const [customData, setCustomData] = useState<number[][]>([]);
  const [dates, setDates] = useState<string[]>([]);

  const [timeFormat, setTimeFormat] = useState<DateFormatRecordType>(
    DateFormatsRecord.DATE_FORMAT
  );

  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  useEffect(() => {
    setTimeFormat(mapRangeToGraphTimeFormat(dateRange));
  }, [dateRange, setTimeFormat]);

  const { data } = useAllRuns({
    externalId,
    dateRange,
    search,
    statuses,
  });

  const allRuns = useMemo(
    () =>
      data
        ? data.pages
            .map((page) => page.items)
            .reduce((accl, p) => [...accl, ...p], [])
        : [],
    [data]
  );

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

  if (!allRuns.length) {
    return null;
  }

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
