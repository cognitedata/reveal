import { curveLinear } from '@visx/curve';

import { useBaseChart } from './BaseChart';
import { linearScale } from './BaseChart/scale';
import type { OrdinalDatum } from './types';
import { getX, getY } from './utils';

import type { CurveFactory } from 'd3';

interface ChokeCurveChartProps {
  data?: OrdinalDatum[];

  primaryColor?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  curve?: CurveFactory;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function ChokeCurveChart({
  data = [],

  width,
  height,
  margin = { top: 6, right: 24, bottom: 42, left: 54 },
  xAxisLabel,
  yAxisLabel = 'Value',
  curve = curveLinear,
  ...additionalChartProps
}: ChokeCurveChartProps) {
  const xScaleGetter = linearScale({
    datapoints: data.map(getX),
    axis: 'x',
    domain: [0, 100],
  });

  const yScaleGetter = linearScale({
    datapoints: data.map(getY),
    axis: 'y',
  });

  const { Chart, Plot, Grid, Axis } = useBaseChart({
    height,
    width,
    margin,
    xScaleGetter,
    yScaleGetter,
  });

  const ChokeCurve = Plot.LineRegular({
    label: 'Choke curve',
    data,
    curve,
    bulletSize: 2,
  });

  return (
    <Chart
      legend={<ChokeCurve.Label />}
      overlayText={!data.length ? 'Choke curve not set' : ''}
      {...additionalChartProps}
    >
      <Grid.Horizontal />

      <Axis.Left label={yAxisLabel} />
      <Axis.Bottom
        label={xAxisLabel}
        numTicks={10}
        tickFormat={(value) => `${value.valueOf()}%`}
      />

      <ChokeCurve.Plot />

      <ChokeCurve.Tooltip />
    </Chart>
  );
}
