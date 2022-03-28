import { useCallback } from 'react';

import { localPoint } from '@visx/event';
import { Bar, Line } from '@visx/shape';
import { Portal, Tooltip, defaultStyles, useTooltip } from '@visx/tooltip';

import { bisector } from 'd3';
import { formatISO9075 } from 'date-fns';
import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js';

import type { DatumType } from 'components/charts/types';
import { getExtents, getX, getY } from 'components/charts/utils';
import { getFormattedSciNumber } from 'utils/numberUtils';
import { LAYER } from 'utils/zIndex';

import type { ChartGeometry } from './types';

import type Color from 'color';

type TooltipData = Partial<DatumType> & {
  left?: number;
  top?: number;
};

interface TooltipHookProps {
  geometry: ChartGeometry;
  data: Partial<DatumType>[];
  color?: Color;
}

export interface TooltipProps {
  tooltipFormat?: (data: TooltipData) => JSX.Element | string;
}

export function usePortalTooltip({
  geometry,
  data,
  color = Colors.primary,
}: TooltipHookProps) {
  const { xScale, yScale, margin } = geometry;
  const { xMax, yMax } = getExtents(geometry);

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<TooltipData>();

  const bisect = bisector<DatumType, Date | number>((it) => getX(it, 0));

  const mouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event, event) ?? { x: 0 };
      const xValue = xScale.invert(x - margin.left);
      const index = bisect.center(data as DatumType[], xValue);

      const value = getY(data[index]);
      const { left, top } = event.currentTarget.getBoundingClientRect();

      if (value !== undefined) {
        showTooltip({
          tooltipLeft: xScale(getX(data[index], 0)),
          tooltipTop: yScale(getY(data[index], 0)),
          tooltipData: {
            ...data[index],
            left,
            top,
          },
        });
      } else {
        hideTooltip();
      }
    },
    [data, margin.left, xScale, yScale, showTooltip, bisect, hideTooltip]
  );

  return ({
    tooltipFormat = (data) => {
      const x = getX(data);
      const xLabel =
        typeof x === 'object' && x instanceof Date
          ? formatISO9075(x)
          : (x ?? 'n/a').toString();
      const y = getY(data);
      const yLabel = y !== undefined ? getFormattedSciNumber(y) : 'n/a';
      return (
        <>
          <strong className="tooltip-y">{yLabel}</strong>
          <span className="tooltip-x">{xLabel}</span>
        </>
      );
    },
  }: TooltipProps) => (
    <>
      {tooltipData && (
        <g>
          <Line
            from={{ x: tooltipLeft, y: 0 }}
            pointerEvents="none"
            stroke="black"
            strokeOpacity={0.1}
            strokeWidth={1}
            to={{ x: tooltipLeft, y: yMax }}
          />
          <circle
            cx={tooltipLeft}
            cy={tooltipTop}
            fill={color.hex()}
            pointerEvents="none"
            r={4}
            stroke="white"
            strokeWidth={1}
          />
        </g>
      )}

      <Bar
        fill="transparent"
        height={yMax}
        width={xMax}
        x={0}
        y={0}
        onMouseLeave={hideTooltip}
        onMouseMove={mouseMove}
      />
      {tooltipData && (
        <Portal>
          <TooltipStyled
            left={(tooltipLeft ?? 0) + (tooltipData.left ?? 0)}
            style={{
              ...defaultStyles,
            }}
            top={(tooltipTop ?? 0) + (tooltipData.top ?? 0)}
          >
            {tooltipFormat(tooltipData)}
          </TooltipStyled>
        </Portal>
      )}
    </>
  );
}

const TooltipStyled = styled(Tooltip)`
  font-size: 11px !important;
  display: flex;
  flex-flow: column nowrap;
  row-gap: 6px;
  z-index: ${LAYER.TOOLTIP};
`;
