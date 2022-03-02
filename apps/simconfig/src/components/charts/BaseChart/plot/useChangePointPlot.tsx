import { useMemo } from 'react';

import { Group } from '@visx/group';

import { Colors } from '@cognite/cogs.js';

import { getX, getY } from 'components/charts/utils';

import { SymbolLegendItem } from '..';
import { usePortalTooltip } from '../usePortalTooltip';

import type { Plot, PlotFunctionProps, PlotProps } from './types';

export function useChangePointPlot({
  xScale,
  yScale,
  width,
  height,
  margin,
}: PlotProps) {
  return useMemo(() => {
    const usePlot = ({
      data,
      color = Colors.red,
      label = 'n/a',
    }: PlotFunctionProps): Plot => {
      function ChangePointSymbol({
        left,
        top,
        radius = 5.5,
      }: {
        left: number;
        top: number;
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

      return {
        Plot: () => (
          <>
            {data.map((datum) => {
              const x = getX(datum, 0);
              const y = getY(datum, 0);
              const left = xScale(x);
              const top = yScale(y);
              return (
                <ChangePointSymbol
                  key={`cp-glyph-${x}-${y}`}
                  left={left}
                  top={top}
                />
              );
            })}
          </>
        ),
        Label: ({ itemSize = 12 }) => (
          <SymbolLegendItem itemSize={itemSize} label={label}>
            <ChangePointSymbol left={itemSize / 2} top={itemSize / 2} />
          </SymbolLegendItem>
        ),
        Tooltip: usePortalTooltip({
          geometry: {
            width,
            height,
            margin,
            xScale,
            yScale,
          },
          data,
        }),
      };
    };
    return usePlot;
  }, [height, margin, width, xScale, yScale]);
}
