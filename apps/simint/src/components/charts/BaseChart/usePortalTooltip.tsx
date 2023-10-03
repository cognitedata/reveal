import { useCallback, useRef } from 'react';

import { localPoint } from '@visx/event';
import { Bar, Line } from '@visx/shape';
import { Portal, Tooltip, defaultStyles, useTooltip } from '@visx/tooltip';
import Color from 'color';
import { bisector } from 'd3';
import { formatISO9075 } from 'date-fns';
import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js';

import { getFormattedSciNumber } from '../../../utils/numberUtils';
import { LAYER } from '../../../utils/zIndex';
import type { DatumType } from '../types';
import { getExtents, getX, getY } from '../utils';

import type { ChartGeometry, ChartScale } from './types';

type TooltipData = Partial<DatumType> & {
  left?: number;
  top?: number;
};

interface TooltipHookProps {
  geometry: ChartGeometry;
  scale: ChartScale;
  data: Partial<DatumType>[];
  color?: Color;
}

export interface TooltipProps {
  tooltipFormat?: (data: TooltipData) => JSX.Element | string;
}

export function usePortalTooltip({
  geometry,
  scale,
  data,
  color = Color(Colors['surface--action--strong--default']),
}: TooltipHookProps) {
  const { margin } = geometry;
  const { xScaleGetter, yScaleGetter } = scale;
  const xScale = xScaleGetter(geometry);
  const yScale = yScaleGetter(geometry);
  const { xMax, yMax } = getExtents(geometry);

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<TooltipData>();

  const bisect = bisector<DatumType, Date | number>((it) => getX(it, 0));
  const cleanupTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const mouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event, event) ?? { x: 0 };
      const xValue = xScale.invert(x - margin.left);
      // @ts-ignore
      const index = bisect.center(data, xValue);
      const value = getY(data[index]);
      const { left, top } = event.currentTarget.getBoundingClientRect();
      if (cleanupTimeout.current === undefined) {
        cleanupTimeout.current = setTimeout(() => {
          // @ts-ignore
          const selector = `.${Array.from(event.target.classList).join('.')}`;
          const isHovered = document.querySelector(selector)?.matches(':hover');
          if (!isHovered) {
            hideTooltip();
          }
          clearTimeout(cleanupTimeout.current);
          cleanupTimeout.current = undefined;
        }, 250);
      }

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
    [
      data,
      margin.left,
      xScale,
      yScale,
      showTooltip,
      bisect,
      hideTooltip,
      cleanupTimeout,
    ]
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
        onMouseLeave={() => {
          hideTooltip();
        }}
        onMouseMove={mouseMove}
        onMouseOut={() => {
          hideTooltip();
        }}
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
  font-family: 'Inter';
  display: flex;
  flex-flow: column nowrap;
  row-gap: 6px;
  z-index: ${LAYER.TOOLTIP};
`;
