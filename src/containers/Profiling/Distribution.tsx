import React, { useMemo } from 'react';

import { AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Bar, BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import { Count } from 'hooks/profiling-service';
import { Colors } from '@cognite/cogs.js';

const BOTTOM_AXIS_HEIGHT = 24;
const NUMBER_OF_TICKS = 4;

type Props = {
  distribution: Count[];
  isBottomAxisDisplayed?: boolean;
  isGridDisplayed?: boolean;
};
export default function Distribution({
  distribution,
  isBottomAxisDisplayed,
  isGridDisplayed,
}: Props) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <Graph
          distribution={distribution}
          isBottomAxisDisplayed={isBottomAxisDisplayed}
          isGridDisplayed={isGridDisplayed}
          width={width}
          height={height}
        />
      )}
    </ParentSize>
  );
}

type GraphProps = {
  width: number;
  height: number;
  distribution: Count[];
  fill?: string;
  isBottomAxisDisplayed?: boolean;
  isGridDisplayed?: boolean;
};
export function Graph({
  distribution,
  width,
  height,
  fill = 'rgba(41, 114, 225, 1)',
  isBottomAxisDisplayed,
  isGridDisplayed,
}: GraphProps) {
  const horizontalMargin = 0;
  const verticalMargin = 0;
  const xMax = width - horizontalMargin;
  const yMax =
    height - verticalMargin - (isBottomAxisDisplayed ? BOTTOM_AXIS_HEIGHT : 0);

  const categories = useMemo(
    () =>
      scaleBand<string>({
        domain: distribution.map(({ value }) => value),
        padding: 0.4,
        range: [0, width],
        round: true,
      }),
    [distribution, width]
  );

  const counts = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...distribution.map(({ count }) => count))],
        range: [yMax, 0],
        round: true,
      }),
    [distribution, yMax]
  );

  const gridTickValues = useMemo(() => {
    let min = 0;
    let max = 0;
    distribution.forEach(({ count }) => {
      if (count < min) {
        min = count;
      } else if (count > max) {
        max = count;
      }
    });
    const interval = (max - min) / (NUMBER_OF_TICKS - 1);

    return [min, min + interval, max - interval, max];
  }, [distribution]);

  return (
    <svg width={width} height={height}>
      <Group top={verticalMargin / 2}>
        {isGridDisplayed && (
          <GridRows
            scale={counts}
            width={xMax}
            height={yMax}
            numTicks={5}
            stroke={Colors['border-default'].hex()}
            strokeDasharray="6,6"
            strokeWidth={1}
            tickValues={gridTickValues}
          />
        )}
        <BarStack
          data={distribution}
          keys={['count']}
          x={(d) => d.value}
          xScale={categories}
          yScale={counts}
          color={() => fill}
        >
          {(barStacks) =>
            barStacks.map((barStack) =>
              barStack.bars.map(({ bar, color, x, y, width, height }) => {
                return (
                  <Bar
                    key={`bar-${bar.data.value}`}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                  />
                );
              })
            )
          }
        </BarStack>
        {isBottomAxisDisplayed && (
          <AxisBottom
            hideTicks
            scale={categories}
            tickLabelProps={() => ({
              fill: Colors['text-primary'].hex(),
              fontFamily: 'Inter',
              fontSize: 12,
              fontWeight: 500,
              textAnchor: 'middle',
            })}
            strokeWidth={0}
            top={yMax}
          />
        )}
      </Group>
    </svg>
  );
}
