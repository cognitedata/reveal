import { useMemo } from 'react';

import { Group } from '@visx/group';
import { LegendItem, LegendLabel } from '@visx/legend';
import { PatternLines } from '@visx/pattern';

import classNames from 'classnames';
import { curveMonotoneX } from 'd3';
import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js';

import { getAxis } from './axis';
import { getGrid } from './grid';
import { useAreaPlot, useChangePointPlot, useLinePlot } from './plot';
import type { ChartGeometry, ChartScale } from './types';

interface BaseChartProps extends ChartScale, Partial<ChartGeometry> {}

export function useBaseChart({
  xScaleGetter,
  yScaleGetter,
  width = 300,
  height = 200,
  margin = { top: 6, right: 24, bottom: 30, left: 54 },
}: BaseChartProps) {
  const geometry: ChartGeometry = {
    width,
    height,
    margin,
  };

  const scale: ChartScale = {
    xScaleGetter,
    yScaleGetter,
  };

  const Plot = {
    AreaFilled: useAreaPlot({
      geometry,
      scale,
      defaultCurve: curveMonotoneX,
    }),
    LineRegular: useLinePlot({
      geometry,
      scale,
      defaultCurve: curveMonotoneX,
    }),
    ChangePoint: useChangePointPlot({
      geometry,
      scale,
    }),
  };

  const Axis = getAxis({ geometry, scale });
  const Grid = getGrid({ geometry, scale });

  const chartId = useMemo(() => `chart-${Math.random()}`, []);

  return {
    geometry,
    Axis,
    Grid,
    Plot,
    Chart: ({
      children,
      legend,
      isValid = true,
      overlayText,
      ...additionalProps
    }: React.PropsWithChildren<{
      legend?: JSX.Element;
      isValid?: boolean;
      overlayText?: string;
    }>) => (
      <ChartContainer
        className={classNames({
          invalid: !isValid,
        })}
        {...additionalProps}
      >
        <svg height={height} width={width}>
          <PatternLines
            height={5}
            id={`${chartId}-invalid-fill`}
            orientation={['diagonal']}
            stroke={Colors.red.hex()}
            strokeWidth={1}
            width={5}
          />
          <mask id={`${chartId}-mask`}>
            <rect
              fill="#fff"
              height={height}
              rx={7}
              ry={7}
              width={width}
              x={0}
              y={0}
            />
          </mask>
          <Group
            height={height}
            left={0}
            mask={`url(#${chartId}-mask)`}
            top={0}
            width={width}
          >
            {isValid ? (
              <Group left={margin.left} top={margin.top}>
                {children}
              </Group>
            ) : null}

            {overlayText ? (
              <>
                <rect
                  fill={
                    isValid
                      ? Colors.white.fade(0.3).rgb().toString()
                      : Colors.red.fade(0.9).rgb().toString()
                  }
                  height={height}
                  width={width}
                  x={0}
                  y={0}
                />
                <text
                  className="overlay"
                  fill={
                    isValid
                      ? Colors.black.fade(0.5).rgb().toString()
                      : Colors.red.fade(0.5).rgb().toString()
                  }
                  x={
                    isValid
                      ? margin.left + (width - margin.left - margin.right) / 2
                      : '50%'
                  }
                  y={
                    isValid
                      ? margin.top + (height - margin.top - margin.bottom) / 2
                      : '50%'
                  }
                >
                  {overlayText}
                </text>
              </>
            ) : null}
          </Group>
        </svg>
        {legend && isValid ? <LegendContainer>{legend}</LegendContainer> : null}
      </ChartContainer>
    ),
  };
}

const ChartContainer = styled.div`
  position: relative;
  text.overlay {
    font-size: 20px;
    text-anchor: middle;
    dominant-baseline: middle;
  }
`;

const LegendContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  font-size: 10px;
  align-items: center;
  gap: 12px;
  padding: 0 24px 0 6px;
  text-shadow: 0 0 1px #fff;
  background: rgba(255, 255, 255, 0.7);
  .visx-legend-item {
    display: flex;
    gap: 6px;
  }
`;

interface SymbolLegendItemProps {
  itemSize: number;
  label: string;
}

export function SymbolLegendItem({
  itemSize,
  label,
  children,
}: React.PropsWithChildren<SymbolLegendItemProps>) {
  return (
    <LegendItem>
      <svg height={itemSize} width={itemSize}>
        {children}
      </svg>
      <LegendLabel align="left" margin={0}>
        {label}
      </LegendLabel>
    </LegendItem>
  );
}
