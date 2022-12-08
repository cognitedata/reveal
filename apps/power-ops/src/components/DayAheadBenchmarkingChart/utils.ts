import { Data } from 'plotly.js';
import { pickChartColor } from 'utils/utils';
import dayjs from 'dayjs';
import { BenchmarkingData } from '@cognite/power-ops-api-types';
import { DoubleDatapoint } from '@cognite/sdk';
import { BenchmarkingTimeSeriesPoints, BenchmarkingTypeOption } from 'types';

export interface TooltipData {
  name: string | undefined;
  latestRunDate: string | undefined;
  latestRunValue: string | undefined;
  firstRunDate: string | undefined;
  firstRunValue: string | undefined;
  color: string;
}

export const normalizeDataPoints = (dataPoints: DoubleDatapoint[]) => {
  return dataPoints.reduce((acc, point) => {
    const day = dayjs(point.timestamp).format('YYYY-MM-DD');
    acc[day] = point.value;
    return acc;
  }, {} as BenchmarkingTimeSeriesPoints);
};

export const relativizeDataPoints = (
  targetDataPoints: BenchmarkingTimeSeriesPoints,
  baseLineDataPoints: BenchmarkingTimeSeriesPoints
) => {
  return Object.keys(targetDataPoints).reduce((acc, timestamp) => {
    if (baseLineDataPoints[timestamp]) {
      acc[timestamp] =
        targetDataPoints[timestamp] - baseLineDataPoints[timestamp];
    }
    return acc;
  }, {} as BenchmarkingTimeSeriesPoints);
};

export const formatPlotData = (
  data: BenchmarkingData[],
  type: BenchmarkingTypeOption,
  showFirstRuns: boolean
) => {
  const baseline: BenchmarkingTimeSeriesPoints[] = [];

  if (type !== 'absolute') {
    const baselineDataPoints = data.find(
      (row) => row.method.name === type
    )?.datapoints;
    if (baselineDataPoints) {
      baseline.push(normalizeDataPoints(baselineDataPoints));
      if (showFirstRuns) {
        baseline.push(normalizeDataPoints([...baselineDataPoints].reverse()));
      }
    }
  }

  const plotData = data
    .map((row, rowIndex) => {
      const methods: Array<BenchmarkingTimeSeriesPoints> = [];
      const color = pickChartColor(rowIndex);

      const lastValues = normalizeDataPoints(row.datapoints);
      if (baseline[0]) {
        methods.push(relativizeDataPoints(lastValues, baseline[0]));
      } else {
        methods.push(lastValues);
      }

      const firstValues = normalizeDataPoints([...row.datapoints].reverse());
      if (showFirstRuns) {
        if (baseline[1]) {
          methods.push(relativizeDataPoints(firstValues, baseline[1]));
        } else {
          methods.push(firstValues);
        }
      }

      return methods.map(
        (values, index) =>
          ({
            x: Object.keys(values),
            y: Object.keys(values).map((timestamp) => values[timestamp]),
            meta: {
              firstRunValues: firstValues,
              latestRunValues: lastValues,
              method: row.method,
            },
            type: 'scatter',
            marker: {
              size: 10,
              color,
            },
            text: '+',
            mode: index === 0 ? 'markers+lines' : 'text+lines',
            textfont: {
              size: index === 0 ? 10 : 20,
              color,
            },
            name: row.method.label,
            showlegend: !!(index === 0),
            line: {
              color: `${color}66`,
              dash: index === 0 ? 'solid' : 'dash',
            },
          } as Data)
      );
    })
    .flat();

  return plotData;
};
