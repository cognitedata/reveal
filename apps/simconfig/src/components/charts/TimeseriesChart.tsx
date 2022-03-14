import { rightTickLabelProps } from '@visx/axis/lib/axis/AxisRight';
import { Text } from '@visx/text';
import { Threshold } from '@visx/threshold';

import { format as formatNumber, max, min } from 'd3';

import { Colors } from '@cognite/cogs.js';
import type { DatapointAggregate } from '@cognite/sdk';
import type { AggregateType } from '@cognite/simconfig-api-sdk/rtk';

import { useBaseChart } from './BaseChart';
import { linearScale, timeScale } from './BaseChart/scale';
import { getCurve } from './utils';

interface TimeseriesChartProps {
  data?: DatapointAggregate[];
  aggregateType?: AggregateType;

  primaryColor?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  yAxisLabel?: string;
}

export function TimeseriesChart({
  data = [],
  aggregateType = 'average',

  width = 100,
  height = 60,
  margin = { top: 7, right: 3, bottom: 7, left: 15 },
  yAxisLabel = 'Value',

  ...additionalChartProps
}: TimeseriesChartProps) {
  const timestamps = data.map((it) => +it.timestamp);
  const values = data.map((it) => it.average ?? 0);
  const latestDatapoint = data[data.length - 1];

  const minValue = min(data.map((it) => it.min ?? 0)) ?? 0;
  const maxValue = max(data.map((it) => it.max ?? 1)) ?? 1;

  const xScale = timeScale({ datapoints: timestamps });
  const yScale = linearScale({
    datapoints: values,
    axis: 'y',
    boundary: {
      min: minValue,
      max: maxValue,
    },
    nice: false,
    padding: 0,
  });

  const curve = getCurve(aggregateType);

  const { geometry, Axis, Chart, Plot } = useBaseChart({
    height,
    width,
    margin,
    xScale,
    yScale,
  });

  const yMax = height - margin.top - margin.bottom;

  const Average = Plot.LineRegular({
    data: data.map(({ timestamp, average: value }) => ({ timestamp, value })),
    width: 1,
    curve,
  });

  if (data.length < 2 || typeof latestDatapoint === 'undefined') {
    return null;
  }

  const upperThreshold = maxValue - (maxValue - minValue) * 0.5;
  const isRising = (latestDatapoint.average ?? 0) > upperThreshold;

  return (
    <Chart {...additionalChartProps}>
      <Threshold<DatapointAggregate>
        belowAreaProps={{
          fill: Colors.primary.hex(),
          fillOpacity: 0.2,
        }}
        clipAboveTo={0}
        clipBelowTo={yMax}
        curve={curve}
        data={data}
        id={`${Math.random()}`}
        x={(d) => geometry.xScale(+d.timestamp)}
        y0={(d) => geometry.yScale(+(d.min ?? 0))}
        y1={(d) => geometry.yScale(+(d.max ?? 0))}
      />

      <Average.Plot />
      <circle
        cx={geometry.xScale(+latestDatapoint.timestamp)}
        cy={geometry.yScale(latestDatapoint.average ?? 0)}
        fill={Colors.primary.hex()}
        r={2}
      />

      <Text
        dy={isRising ? 3 : -3}
        fill={Colors.primary.hex()}
        fontSize={9}
        paintOrder="stroke"
        stroke={Colors.white.hex()}
        strokeWidth={2}
        textAnchor="end"
        verticalAnchor={isRising ? 'start' : 'end'}
        x={geometry.xScale(+latestDatapoint.timestamp)}
        y={geometry.yScale(latestDatapoint.average ?? 0)}
      >
        {formatNumber('.1f')(latestDatapoint.average ?? 0)}
      </Text>

      <Axis.Left
        label={yAxisLabel}
        labelOffset={10}
        tickLabelProps={() => ({
          ...rightTickLabelProps(),
          paintOrder: 'stroke',
          stroke: Colors.white.hex(),
          strokeWidth: 2,
        })}
        tickLength={-3}
        tickValues={[0, minValue, (minValue + maxValue) / 2, maxValue]}
      />

      <Average.Tooltip />
    </Chart>
  );
}
