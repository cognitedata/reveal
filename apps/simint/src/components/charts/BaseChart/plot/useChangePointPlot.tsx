import { useMemo } from 'react';

import { Group } from '@visx/group';
import Color from 'color';

import { Colors } from '@cognite/cogs.js';

import { SymbolLegendItem } from '..';
import { getX, getY } from '../../utils';
import { usePortalTooltip } from '../usePortalTooltip';

import type { Plot, PlotFunctionProps, PlotProps } from './types';

export function useChangePointPlot({
  geometry,
  scale: defaultScale,
}: PlotProps) {
  return useMemo(() => {
    const usePlot = ({
      data,
      color = Color(Colors['decorative--red--500']),
      label = 'n/a',
      radius = 5.5,
      scale = defaultScale,
    }: PlotFunctionProps & {
      radius?: number;
    }): Plot => ({
      functionProps: {
        data,
        color,
        label,
        scale,
      },
      Plot: () => {
        const xScale = scale.xScaleGetter(geometry);
        const yScale = scale.yScaleGetter(geometry);
        return (
          <>
            {data.map((datum) => {
              const x = getX(datum, 0);
              const y = getY(datum, 0);
              const left = xScale(x);
              const top = yScale(y);
              return (
                <ChangePointSymbol
                  color={color}
                  key={`cp-glyph-${x}-${y}`}
                  left={left}
                  radius={radius}
                  top={top}
                />
              );
            })}
          </>
        );
      },
      Label: ({ itemSize = 12 }) => (
        <SymbolLegendItem itemSize={itemSize} label={label}>
          <ChangePointSymbol
            color={color}
            left={itemSize / 2}
            top={itemSize / 2}
          />
        </SymbolLegendItem>
      ),
      Tooltip: usePortalTooltip({
        geometry,
        scale,
        data,
      }),
    });
    return usePlot;
  }, [geometry, defaultScale]);
}

function ChangePointSymbol({
  left,
  top,
  color,
  radius = 5.5,
}: {
  left: number;
  top: number;
  color: Color;
  radius?: number;
}) {
  return (
    <Group left={left} top={top}>
      <circle
        fill="transparent"
        r={radius}
        stroke={color.hex()}
        strokeOpacity={0.4}
        strokeWidth={1}
      />
      <circle fill={color.hex()} r={2} stroke="white" strokeWidth={1} />
    </Group>
  );
}
