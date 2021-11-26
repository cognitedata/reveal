import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

type Count = {
  value: string;
  count: number;
};

type Props = {
  distribution: Count[];
};
export default function Distribution({ distribution }: Props) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <Graph distribution={distribution} width={width} height={height} />
      )}
    </ParentSize>
  );
}

type GraphProps = {
  width: number;
  height: number;
  distribution: Count[];
  fill?: string;
};
export function Graph({
  distribution,
  width,
  height,
  fill = 'rgba(41, 114, 225, 1)',
}: GraphProps) {
  const verticalMargin = 0;
  const yMax = height - verticalMargin;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, width],
        round: true,
        domain: distribution.map((d) => d.value),
        padding: 0.4,
      }),
    [width, distribution]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...distribution.map((d) => d.count))],
      }),
    [yMax, distribution]
  );

  return (
    <svg width={width} height={height}>
      <Group top={verticalMargin / 2}>
        {distribution.map((d) => {
          const { value } = d;
          const barWidth = 5;
          const barHeight = yMax - (yScale(d.count) ?? 0);
          const barX = xScale(value);
          const barY = yMax - barHeight;
          return (
            <Bar
              key={`bar-${value}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={fill}
            />
          );
        })}
      </Group>
    </svg>
  );
}
