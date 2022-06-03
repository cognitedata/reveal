import { useMemo } from 'react';

import type { PatternOrientation } from '@visx/pattern';
import { PatternLines } from '@visx/pattern';
import { AreaClosed } from '@visx/shape';

import { curveMonotoneX } from 'd3';

import { Colors } from '@cognite/cogs.js';

import { getX, getY } from 'components/charts/utils';

import { SymbolLegendItem } from '..';
import { usePortalTooltip } from '../usePortalTooltip';

import type { Plot, PlotFunctionProps, PlotProps } from './types';

export function useAreaPlot({
  geometry,
  scale: defaultScale,
  defaultCurve = curveMonotoneX,
}: PlotProps) {
  return useMemo(() => {
    const usePlot = ({
      data,
      color = Colors.primary,
      curve = defaultCurve,
      label = 'n/a',
      pattern,
      opacity = 0.15,
      stroke = 1,
      size = 5,
      scale = defaultScale,
    }: PlotFunctionProps & {
      pattern?: keyof typeof PatternOrientation;
      opacity?: number;
      stroke?: number;
      size?: number;
    }): Plot => ({
      functionProps: { data, color, curve, label, scale },
      Plot: () => {
        const xScale = scale.xScaleGetter(geometry);
        const yScale = scale.yScaleGetter(geometry);
        return (
          <>
            {pattern && (
              <PatternLines
                height={size}
                id={`fill-${color.hex().substring(1)}-${pattern}`}
                orientation={[pattern]}
                stroke={color.hex()}
                strokeWidth={stroke}
                width={size}
              />
            )}
            <AreaClosed
              curve={curve}
              data={data}
              defined={(d) => getY(d) !== undefined}
              fill={
                pattern
                  ? `url(#fill-${color.hex().substring(1)}-${pattern})`
                  : color.hex()
              }
              fillOpacity={opacity}
              x={(d) => xScale(getX(d, 0))}
              y={(d) => yScale(getY(d, 0))}
              yScale={yScale}
            />
          </>
        );
      },
      Label: ({ itemSize = 12 }) => (
        <SymbolLegendItem itemSize={itemSize} label={label}>
          <rect
            fill={
              pattern
                ? `url(#fill-${color.hex().substring(1)}-${pattern})`
                : color.hex()
            }
            fillOpacity={opacity}
            height={itemSize}
            width={itemSize}
            x={0}
            y={0}
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
  }, [defaultCurve, defaultScale, geometry]);
}
