import type { SharedAxisProps, TickRendererProps } from '@visx/axis';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { Text } from '@visx/text';

import { format, isSameDay } from 'date-fns';

import { getExtents } from '../utils';

import type { ChartGeometry, ChartScale } from './types';

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

interface AxisProps {
  geometry: ChartGeometry;
  scale: ChartScale;
}

export function getAxis({ geometry, scale }: AxisProps) {
  const { yMax } = getExtents(geometry);
  const { xScaleGetter, yScaleGetter } = scale;

  return {
    Bottom: ({
      scale = xScaleGetter,
      ...additionalProps
    }: Partial<
      Omit<SharedAxisProps<ReturnType<ChartScale['xScaleGetter']>>, 'scale'> & {
        scale: ChartScale['xScaleGetter'];
      }
    >) => {
      const scaleGeometry = scale(geometry);
      let previousDate: Date | undefined;

      return (
        <AxisBottom
          scale={scaleGeometry}
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
      scale = yScaleGetter,
      ...additionalProps
    }: Partial<
      Omit<SharedAxisProps<ReturnType<ChartScale['yScaleGetter']>>, 'scale'> & {
        scale: ChartScale['yScaleGetter'];
      }
    >) => {
      const scaleGeometry = scale(geometry);
      return (
        <AxisLeft
          scale={scaleGeometry}
          tickFormat={(tickValue) =>
            scaleGeometry.tickFormat(undefined, 'f')(tickValue)
          }
          {...additionalProps}
        />
      );
    },
    Right: ({
      scale = yScaleGetter,
      ...additionalProps
    }: Partial<
      Omit<SharedAxisProps<ReturnType<ChartScale['yScaleGetter']>>, 'scale'> & {
        scale: ChartScale['yScaleGetter'];
      }
    >) => {
      const scaleGeometry = scale(geometry);
      return (
        <AxisRight
          scale={scaleGeometry}
          tickFormat={(tickValue) =>
            scaleGeometry.tickFormat(undefined, 'f')(tickValue)
          }
          {...additionalProps}
        />
      );
    },
  };
}
