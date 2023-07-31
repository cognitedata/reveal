import React, { useCallback } from 'react';

import { localPoint } from '@visx/event';
import { Bar, Line } from '@visx/shape';
import { Portal, Tooltip, defaultStyles, useTooltip } from '@visx/tooltip';

import { bisector } from 'd3';
import styled from 'styled-components/macro';

import type { DatumType, OrdinalDatum } from 'components/charts/types';
import { getExtents, getX, getY } from 'components/charts/utils';
import { getFormattedSciNumber } from 'utils/numberUtils';
import { LAYER } from 'utils/zIndex';

import type { Plot, PlotFunctionProps } from './plot/types';
import type { ChartGeometry } from './types';

type TooltipData = Partial<OrdinalDatum> & {
  left?: number;
  top?: number;
  props: PlotFunctionProps;
};

interface MultiPlotTooltipHookProps {
  plots: Plot[];
  geometry: ChartGeometry;
}

export interface MultiPlotTooltipProps {
  tooltipFormat?: (data: TooltipData) => JSX.Element | string;
}

export function useMultiPlotTooltip({
  plots,
  geometry,
}: MultiPlotTooltipHookProps) {
  const { margin } = geometry;
  const { xMax, yMax } = getExtents(geometry);

  const { tooltipData, tooltipLeft, showTooltip, hideTooltip } =
    useTooltip<
      { tooltipLeft: number; tooltipData: TooltipData; tooltipTop: number }[]
    >();

  const bisect = bisector<DatumType, Date | number>((it) => getX(it, 0));

  const mouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event, event) ?? { x: 0 };
      const { left, top } = event.currentTarget.getBoundingClientRect();
      const tooltips = plots
        .map((plot) => {
          if (!plot.functionProps) {
            return undefined;
          }
          const xScale = plot.functionProps.scale?.xScaleGetter(geometry);
          const yScale = plot.functionProps.scale?.yScaleGetter(geometry);
          if (!xScale || !yScale) {
            return undefined;
          }
          const { data = [] } = plot.functionProps;
          if (!data.length) {
            return undefined;
          }
          const xValue = xScale.invert(x - margin.left);
          const index = bisect.center(data as DatumType[], xValue);
          const value = getY(data[index]);
          if (value === undefined) {
            return undefined;
          }
          return {
            tooltipLeft: xScale(getX(data[index], 0)),
            tooltipTop: yScale(getY(data[index], 0)),
            tooltipData: {
              ...data[index],
              props: plot.functionProps,
              left,
              top,
            },
          };
        })
        .reduce<
          {
            tooltipLeft: number;
            tooltipTop: number;
            tooltipData: TooltipData;
          }[]
        >((acc, cur) => (cur !== undefined ? [...acc, cur] : acc), []);

      if (tooltips.length) {
        showTooltip({
          tooltipLeft: tooltips[0]?.tooltipLeft,
          tooltipTop: tooltips[0]?.tooltipTop,
          tooltipData: tooltips,
        });
      } else {
        hideTooltip();
      }
    },
    [margin.left, bisect, geometry, plots, hideTooltip, showTooltip]
  );

  return ({
    tooltipFormat = (data) => (
      <div>
        <strong>{data.props.label}:</strong>{' '}
        {data.y !== undefined ? getFormattedSciNumber(data.y) : 'n/a'}
      </div>
    ),
  }: MultiPlotTooltipProps) => (
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
          {tooltipData.map((tooltip) => (
            <React.Fragment key={Math.random()}>
              <Line
                from={{ x: tooltip.tooltipLeft, y: tooltip.tooltipTop }}
                pointerEvents="none"
                stroke={tooltip.tooltipData.props.color?.hex()}
                strokeWidth={1}
                to={{ x: tooltip.tooltipLeft + 20, y: tooltip.tooltipTop + 20 }}
              />
              <circle
                cx={tooltip.tooltipLeft}
                cy={tooltip.tooltipTop}
                fill={tooltip.tooltipData.props.color?.hex()}
                pointerEvents="none"
                r={4}
                stroke="white"
                strokeWidth={1}
              />
            </React.Fragment>
          ))}
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
          {tooltipData.map((tooltip) => (
            <MultiPlotTooltipStyled
              key={Math.random()}
              left={tooltip.tooltipLeft + (tooltip.tooltipData.left ?? 0)}
              style={{
                ...defaultStyles,
                background: tooltip.tooltipData.props.color?.hex(),
              }}
              top={tooltip.tooltipTop + (tooltip.tooltipData.top ?? 0)}
            >
              {tooltipFormat(tooltip.tooltipData)}
            </MultiPlotTooltipStyled>
          ))}
        </Portal>
      )}
    </>
  );
}

const MultiPlotTooltipStyled = styled(Tooltip)`
  color: white !important;
  border: 0 !important;
  font-size: 11px !important;
  display: flex;
  flex-flow: column nowrap;
  row-gap: 6px;
  z-index: ${LAYER.TOOLTIP};
`;
