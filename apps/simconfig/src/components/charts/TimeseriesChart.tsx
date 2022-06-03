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

  fullSize?: boolean;
  primaryColor?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  yAxisLabel?: string;
}

export function TimeseriesChart({
  data = [],
  aggregateType = 'average',

  fullSize = false,
  width = 100,
  height = 60,
  margin = {
    top: 7,
    right: 3,
    bottom: fullSize ? 30 : 7,
    left: fullSize ? 54 : 15,
  },
  yAxisLabel = 'Value',

  ...additionalChartProps
}: TimeseriesChartProps) {
  const timestamps = data.map((it) => +it.timestamp);
  const values = data.map((it) => it[aggregateType] ?? 0);
  const latestDatapoint = data[data.length - 1];

  const aggregateValues = data.reduce<number[]>(
    (filteredValues, values) => [
      ...filteredValues,
      ...Object.values(values).reduce<number[]>((collection, value) => {
        if (value === undefined || typeof value !== 'number') {
          return collection;
        }
        return [...collection, value];
      }, []),
    ],
    []
  );
  const minValue = min(aggregateValues) ?? 0;
  const maxValue = max(aggregateValues) ?? 0;

  const xScaleGetter = timeScale({ datapoints: timestamps });
  const yScaleGetter = linearScale({
    datapoints: values,
    axis: 'y',
    boundary: {
      min: minValue === maxValue ? minValue - 1 : minValue,
      max: minValue === maxValue ? maxValue + 1 : maxValue,
    },
    nice: fullSize,
    padding: 0,
  });

  const curve = getCurve(aggregateType);

  const { geometry, Axis, Chart, Plot, Grid } = useBaseChart({
    height,
    width,
    margin,
    xScaleGetter,
    yScaleGetter,
  });

  const yMax = height - margin.top - margin.bottom;

  const Aggregate = Plot.LineRegular({
    data: data.map(({ timestamp, [aggregateType]: value }) => ({
      timestamp,
      value,
    })),
    width: 1,
    curve,
  });

  if (data.length < 2 || typeof latestDatapoint === 'undefined') {
    return null;
  }

  const upperThreshold = maxValue - (maxValue - minValue) * 0.5;
  const isRising = (latestDatapoint[aggregateType] ?? 0) > upperThreshold;

  const xScaleGeometry = xScaleGetter(geometry);
  const yScaleGeometry = yScaleGetter(geometry);

  return (
    <Chart {...additionalChartProps}>
      {fullSize && <Grid.Horizontal />}

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
        x={(d) => xScaleGeometry(+d.timestamp)}
        y0={(d) => yScaleGeometry(+(d.min ?? 0))}
        y1={(d) => yScaleGeometry(+(d.max ?? 0))}
      />

      {fullSize ? (
        <>
          <Axis.Left label={yAxisLabel} />
          <Axis.Bottom />
        </>
      ) : (
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
      )}

      <Aggregate.Plot />
      <circle
        cx={xScaleGeometry(+latestDatapoint.timestamp)}
        cy={yScaleGeometry(latestDatapoint[aggregateType] ?? 0)}
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
        x={xScaleGeometry(+latestDatapoint.timestamp)}
        y={yScaleGeometry(latestDatapoint[aggregateType] ?? 0)}
      >
        {formatNumber('.1f')(latestDatapoint[aggregateType] ?? 0)}
      </Text>

      <Aggregate.Tooltip />
    </Chart>
  );
}
