import { curveMonotoneX } from '@visx/curve';
import type { LinePathProps } from '@visx/shape/lib/shapes/LinePath';
import { LineSeries, XYChart, buildChartTheme } from '@visx/xychart';

import type { OrdinalDatum } from './types';

interface SparklineProps {
  data: OrdinalDatum[];
  width?: number;
  height?: number;
  curve?: LinePathProps<OrdinalDatum>['curve'];
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 50,
  height = 20,
  curve = curveMonotoneX,
  strokeWidth = 1,
}: SparklineProps) {
  return (
    <XYChart
      height={height}
      margin={{ top: 1, right: 0, bottom: 1, left: 0 }}
      theme={customTheme}
      width={width}
      xScale={{ type: 'band' }}
      yScale={{ type: 'linear' }}
    >
      <LineSeries
        curve={curve}
        data={data}
        dataKey="Sparkline"
        strokeWidth={strokeWidth}
        xAccessor={xAccessor}
        yAccessor={yAccessor}
      />
    </XYChart>
  );
}

const customTheme = buildChartTheme({
  backgroundColor: 'transparent',
  colors: ['#4a67fb'],
  gridColor: 'black',
  gridColorDark: 'black',
  tickLength: 2,
});

const xAccessor = (d: OrdinalDatum) => d.x;
const yAccessor = (d: OrdinalDatum) => d.y;
