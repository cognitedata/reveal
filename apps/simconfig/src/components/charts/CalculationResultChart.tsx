import { curveMonotoneX } from '@visx/curve';

import { max, min } from 'd3';

import { Colors } from '@cognite/cogs.js';

import { useBaseChart } from './BaseChart';
import { linearScale } from './BaseChart/scale';
import type { Margin } from './BaseChart/types';
import { useMultiPlotTooltip } from './BaseChart/useMultiSeriesTooltip';

import type Color from 'color';
import type { CurveFactory } from 'd3';

export interface CalculationResultDatum {
  gasRate: number;
  ipr: number;
  vlp: number;
}

interface CalculationResultChartProps<
  AxisColumnsType extends string[] = string[]
> {
  xAxisColumn: string;
  yAxisColumns: AxisColumnsType;
  data: Record<AxisColumnsType[number], number>[];
  width?: number;
  height?: number;
  curve?: CurveFactory;
  margin?: Margin;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function CalculationResultChart({
  data,
  width = 800,
  height = 300,
  curve = curveMonotoneX,
  margin = { top: 6, right: 0, bottom: 40, left: 54 },
  xAxisLabel,
  yAxisLabel,
  xAxisColumn,
  yAxisColumns,
  ...additionalChartProps
}: CalculationResultChartProps) {
  const xScaleGetter = linearScale({
    datapoints: data.map((d) => d[xAxisColumn]),
    axis: 'x',
    nice: false,
  });

  const allDatapoints = data.reduce<number[]>(
    (acc, cur) => [...acc, ...yAxisColumns.map((column) => cur[column])],
    []
  );

  const yScaleGetter = linearScale({
    datapoints: allDatapoints,
    padding: 0.025,
    axis: 'y',
    boundary: {
      min: min(allDatapoints) ?? 0,
      max: max(allDatapoints) ?? 0,
    },
  });

  const { Chart, Plot, Grid, Axis, geometry } = useBaseChart({
    height,
    width,
    margin,
    xScaleGetter,
    yScaleGetter,
  });

  const plots = yAxisColumns.map((column, index) => ({
    id: Math.random(),
    plot: Plot.LineRegular({
      label: column,
      data: data
        .map((it) => ({ x: it[xAxisColumn], y: it[column] }))
        .sort((dataPointA, dataPointB) => dataPointA.x - dataPointB.x),
      curve,
      color: palette[index],
      width: 1.25,
    }),
  }));

  const Tooltip = useMultiPlotTooltip({
    geometry,
    plots: plots.map(({ plot }) => plot),
  });

  return (
    <Chart
      legend={
        <>
          {plots.map(({ id, plot: ColumnPlot }) => (
            <ColumnPlot.Label key={id} />
          ))}
        </>
      }
      {...additionalChartProps}
    >
      <Grid.Horizontal />
      <Grid.Vertical />

      {plots.map(({ id, plot: ColumnPlot }) => (
        <ColumnPlot.Plot key={id} />
      ))}

      <Axis.Bottom label={xAxisLabel ?? '(unknown)'} />
      <Axis.Left label={yAxisLabel ?? '(unknown)'} />

      <Tooltip />
    </Chart>
  );
}

const palette: Color[] = [Colors.primary, Colors.red];
