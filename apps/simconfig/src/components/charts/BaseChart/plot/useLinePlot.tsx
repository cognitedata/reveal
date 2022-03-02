import { useMemo } from 'react';

import { curveMonotoneX } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { LinePath } from '@visx/shape';

import { Colors } from '@cognite/cogs.js';

import { getExtents, getX, getY } from 'components/charts/utils';

import { SymbolLegendItem } from '..';
import { usePortalTooltip } from '../usePortalTooltip';

import type { Plot, PlotFunctionProps, PlotProps } from './types';

export function useLinePlot(geometry: PlotProps) {
  return useMemo(() => {
    const { xScale, yScale, defaultCurve = curveMonotoneX } = geometry;
    const { xMax, yMax } = getExtents(geometry);

    const usePlot = ({
      data,
      color = Colors.primary,
      curve = defaultCurve,
      label = 'n/a',
      width = 1,
      opacity = 1,
      threshold,
      dashes,
      bulletSize,
    }: PlotFunctionProps & {
      width?: number;
      opacity?: number;
      threshold?: number;
      dashes?: string;
      bulletSize?: number;
    }): Plot => ({
      Plot: () =>
        threshold ? (
          <GridRows
            height={yMax}
            scale={yScale}
            stroke={color.hex()}
            strokeDasharray={dashes}
            strokeOpacity={opacity}
            strokeWidth={width}
            tickValues={[threshold]}
            width={xMax}
          />
        ) : (
          <>
            <LinePath
              curve={curve}
              data={data}
              defined={(item) => getY(item) !== undefined}
              stroke={color.hex()}
              strokeDasharray={dashes}
              strokeOpacity={opacity}
              strokeWidth={width}
              x={(d) => xScale(getX(d, 0))}
              y={(d) => yScale(getY(d, 0))}
            />
            {bulletSize &&
              data.map((d) => (
                <circle
                  cx={xScale(getX(d, 0))}
                  cy={yScale(getY(d, 0))}
                  fill={color.hex()}
                  key={`graph-points--${getX(d, 0)}--${getY(d, 0)}`}
                  r={bulletSize}
                />
              ))}
          </>
        ),
      Label: ({ itemSize = 12 }) => (
        <SymbolLegendItem itemSize={itemSize} label={label}>
          <line
            stroke={color.hex()}
            strokeDasharray={dashes}
            strokeOpacity={opacity}
            strokeWidth={width}
            x1={0}
            x2={itemSize}
            y1={itemSize / 2}
            y2={itemSize / 2}
          />
        </SymbolLegendItem>
      ),
      Tooltip: usePortalTooltip({ geometry, data }),
    });

    return usePlot;
  }, [geometry]);
}
