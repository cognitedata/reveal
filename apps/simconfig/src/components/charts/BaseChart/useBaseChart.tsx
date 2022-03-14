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
import type { ScaleProps } from './scale';
import type { ChartGeometry, Margin } from './types';

interface BaseChartProps {
  xScale: (props: ScaleProps) => ChartGeometry['xScale'];
  yScale: (props: ScaleProps) => ChartGeometry['yScale'];
  width?: number;
  height?: number;
  margin?: Margin;
}

export function useBaseChart({
  xScale: getScaleX,
  yScale: getScaleY,
  width = 300,
  height = 200,
  margin = { top: 6, right: 24, bottom: 30, left: 54 },
}: BaseChartProps) {
  const xScale = getScaleX({ width, height, margin });
  const yScale = getScaleY({ width, height, margin });

  const geometry = {
    xScale,
    yScale,
    width,
    height,
    margin,
  };

  const Plot = {
    AreaFilled: useAreaPlot({ ...geometry, defaultCurve: curveMonotoneX }),
    LineRegular: useLinePlot({ ...geometry, defaultCurve: curveMonotoneX }),
    ChangePoint: useChangePointPlot(geometry),
  };

  const Axis = getAxis(geometry);
  const Grid = getGrid(geometry);

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
