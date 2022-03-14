import type { SharedAxisProps, TickRendererProps } from '@visx/axis';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Text } from '@visx/text';

import { format, isSameDay } from 'date-fns';

import { getExtents } from '../utils';

import type { ChartGeometry } from './types';

function TickComponent({ formattedValue, x, y }: TickRendererProps) {
  const [time, date] = (formattedValue ?? '').split(' ');
  return (
    <g>
      <Text
        fontSize={10}
        textAnchor="middle"
        verticalAnchor="middle"
        x={x}
        y={y - 3}
      >
        {time}
      </Text>
      <Text
        fontSize={10}
        textAnchor="middle"
        verticalAnchor="middle"
        x={x}
        y={y + 8}
      >
        {date}
      </Text>
    </g>
  );
}

export function getAxis(geometry: ChartGeometry) {
  const { xScale, yScale } = geometry;
  const { yMax } = getExtents(geometry);

  return {
    Bottom: ({
      ...additionalProps
    }: Partial<SharedAxisProps<ChartGeometry['xScale']>>) => {
      let previousDate: Date | undefined;

      return (
        <AxisBottom
          scale={xScale}
          stroke="#333"
          tickComponent={TickComponent}
          tickFormat={(tickValue) => {
            if (tickValue instanceof Date) {
              const dateFormat =
                previousDate && isSameDay(tickValue, previousDate)
                  ? 'HH:mm'
                  : 'HH:mm yyyy-MM-dd';
              previousDate = tickValue;
              return format(tickValue, dateFormat);
            }
            return (+tickValue).toString();
          }}
          top={yMax}
          {...additionalProps}
        />
      );
    },
    Left: ({
      ...additionalProps
    }: Partial<SharedAxisProps<ChartGeometry['yScale']>>) => (
      <AxisLeft
        scale={yScale}
        tickFormat={(tickValue) => yScale.tickFormat(undefined, 'f')(tickValue)}
        {...additionalProps}
      />
    ),
  };
}
