import { curveMonotoneX } from '@visx/curve';

import { max, min } from 'd3';

import { Colors } from '@cognite/cogs.js';

import { useBaseChart } from './BaseChart';
import { linearScale } from './BaseChart/scale';
import type { Margin } from './BaseChart/types';
import { useMultiPlotTooltip } from './BaseChart/useMultiSeriesTooltip';
import type { OrdinalDatum } from './types';

import type { CurveFactory } from 'd3';

export interface CalculationResultDatum {
  gasRate: number;
  ipr: number;
  vlp: number;
}

interface CalculationResultChartProps {
  data: CalculationResultDatum[];
  solution?: Partial<OrdinalDatum>;
  width?: number;
  height?: number;
  curve?: CurveFactory;
  margin?: Margin;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function CalculationResultChart({
  data,
  solution,
  width = 800,
  height = 300,
  curve = curveMonotoneX,
  margin = { top: 6, right: 0, bottom: 40, left: 54 },
  xAxisLabel,
  yAxisLabel,
  ...additionalChartProps
}: CalculationResultChartProps) {
  const xScaleGetter = linearScale({
    datapoints: data.map(gasRateAccessor),
    axis: 'x',
    nice: false,
  });

  const allDatapoints = [...data.map(iprAccessor), ...data.map(vlpAccessor)];
  const yScaleGetter = linearScale({
    datapoints: data.map(iprAccessor),
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

  const Ipr = Plot.LineRegular({
    label: 'IPR',
    data: data.map((it) => ({ x: it.gasRate, y: it.ipr })),
    curve,
    color: Colors.primary,
    width: 1.25,
  });

  const Vlp = Plot.LineRegular({
    label: 'VLP',
    data: data.map((it) => ({ x: it.gasRate, y: it.vlp })),
    curve,
    color: Colors.red,
    width: 1.25,
  });

  const Solution = Plot.ChangePoint({
    label: 'Solution',
    data: solution ? [solution] : [],
    color: Colors.black,
    radius: 10,
  });

  const Tooltip = useMultiPlotTooltip({
    geometry,
    plots: [Ipr, Vlp, Solution],
  });

  return (
    <Chart
      legend={
        <>
          <Ipr.Label />
          <Vlp.Label />
          {solution && <Solution.Label />}
        </>
      }
      {...additionalChartProps}
    >
      <Grid.Horizontal />
      <Grid.Vertical />

      <Ipr.Plot />
      <Vlp.Plot />
      {solution && <Solution.Plot />}

      <Axis.Bottom label={xAxisLabel ?? '(unknown)'} />
      <Axis.Left label={yAxisLabel ?? '(unknown)'} />

      <Tooltip />
    </Chart>
  );
}

const gasRateAccessor = (d: CalculationResultDatum) => d.gasRate;
const iprAccessor = (d: CalculationResultDatum) => d.ipr;
const vlpAccessor = (d: CalculationResultDatum) => d.vlp;
