import React, { useMemo } from 'react';

import { Body, Colors } from '@cognite/cogs.js';
import { AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar, BarStack } from '@visx/shape';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import styled from 'styled-components';

import { Count } from 'hooks/profiling-service';

const BOTTOM_AXIS_HEIGHT = 24;
const NUMBER_OF_TICKS = 4;

type Props = {
  distribution: Count[];
  isBottomAxisDisplayed?: boolean;
  isGridDisplayed?: boolean;
  isTooltipDisplayed?: boolean;
  rangeEnd?: number;
};
export default function Distribution({
  distribution,
  isBottomAxisDisplayed,
  isGridDisplayed,
  isTooltipDisplayed,
  rangeEnd,
}: Props) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <Graph
          distribution={distribution}
          isBottomAxisDisplayed={isBottomAxisDisplayed}
          isGridDisplayed={isGridDisplayed}
          width={width}
          height={height}
          rangeEnd={rangeEnd}
          isTooltipDisplayed={isTooltipDisplayed}
        />
      )}
    </ParentSize>
  );
}

type GraphProps = {
  width: number;
  height: number;
  distribution: Count[];
  fill?: string;
  isBottomAxisDisplayed?: boolean;
  isGridDisplayed?: boolean;
  isTooltipDisplayed?: boolean;
  rangeEnd?: number;
};
export function Graph({
  distribution,
  width,
  height,
  fill = 'rgba(41, 114, 225, 1)',
  isBottomAxisDisplayed,
  isGridDisplayed,
  isTooltipDisplayed,
  rangeEnd,
}: GraphProps) {
  const horizontalMargin = 0;
  const verticalMargin = 0;
  const xMax = width - horizontalMargin;
  const yMax =
    height - verticalMargin - (isBottomAxisDisplayed ? BOTTOM_AXIS_HEIGHT : 0);

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{
    data: Count;
    index: number;
  }>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const tooltipIntervalEndValue = useMemo(() => {
    if (tooltipData?.index !== undefined) {
      if (tooltipData.index === distribution.length - 1) {
        return `${rangeEnd ?? ''}`;
      }
      return distribution[tooltipData.index + 1]?.value;
    }
    return '';
  }, [distribution, rangeEnd, tooltipData?.index]);

  const maxCount = useMemo(() => {
    return distribution.reduce((acc, cur) => {
      if (cur.count > acc) {
        return cur.count;
      }
      return acc;
    }, 0);
  }, [distribution]);

  const categories = useMemo(
    () =>
      scaleBand<string>({
        domain: distribution.map(({ value }) => value),
        padding: 0.4,
        range: [0, width],
        round: true,
      }),
    [distribution, width]
  );

  const counts = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...distribution.map(({ count }) => count))],
        range: [yMax, 0],
        round: true,
      }),
    [distribution, yMax]
  );

  const gridTickValues = useMemo(() => {
    let min = 0;
    let max = 0;
    distribution.forEach(({ count }) => {
      if (count < min) {
        min = count;
      } else if (count > max) {
        max = count;
      }
    });
    const interval = (max - min) / (NUMBER_OF_TICKS - 1);

    return [min, min + interval, max - interval, max];
  }, [distribution]);

  const handleMouseLeave = (): void => {
    hideTooltip();
  };

  const handleMouseMove = (data: Count, index: number, left: number): void => {
    showTooltip({
      tooltipData: {
        data: data,
        index,
      },
      tooltipTop: 0,
      tooltipLeft: left,
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group top={verticalMargin / 2}>
          {isGridDisplayed && (
            <GridRows
              scale={counts}
              width={xMax}
              height={yMax}
              numTicks={5}
              stroke={Colors['border-default'].hex()}
              strokeDasharray="6,6"
              strokeWidth={1}
              tickValues={gridTickValues}
            />
          )}
          {isTooltipDisplayed && rangeEnd !== undefined && (
            <BarStack
              data={distribution.map((value) => ({
                ...value,
                count: maxCount,
              }))}
              keys={['count']}
              x={(d) => d.value}
              xScale={categories}
              yScale={counts}
              color={() => ''}
            >
              {(barStacks) =>
                barStacks.map((barStack) =>
                  barStack.bars.map(
                    ({ bar, x, y, width, height }, barIndex) => {
                      return (
                        <Bar
                          key={`bar-${bar.data.value}`}
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={
                            tooltipData?.index === barIndex
                              ? Colors['bg-control--secondary']
                              : 'transparent'
                          }
                          onMouseLeave={handleMouseLeave}
                          onMouseMove={() => {
                            handleMouseMove(bar.data, barIndex, x + width / 2);
                          }}
                        />
                      );
                    }
                  )
                )
              }
            </BarStack>
          )}
          <BarStack
            data={distribution}
            keys={['count']}
            x={(d) => d.value}
            xScale={categories}
            yScale={counts}
            color={() => fill}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map(
                  ({ bar, color, x, y, width, height }, barIndex) => {
                    return (
                      <Bar
                        key={`bar-${bar.data.value}`}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={color}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={() => {
                          handleMouseMove(bar.data, barIndex, x + width / 2);
                        }}
                      />
                    );
                  }
                )
              )
            }
          </BarStack>
          {isBottomAxisDisplayed && (
            <AxisBottom
              hideTicks
              scale={categories}
              tickLabelProps={() => ({
                fill: Colors['text-primary'].hex(),
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: 500,
                textAnchor: 'middle',
              })}
              strokeWidth={0}
              top={yMax}
            />
          )}
        </Group>
      </svg>
      {isTooltipDisplayed &&
        rangeEnd !== undefined &&
        tooltipOpen &&
        tooltipData && (
          <TooltipInPortal
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              backgroundColor: Colors['bg-inverted'].hex(),
              borderRadius: 6,
            }}
          >
            <StyledTooltipContent>
              <StyledTooltipBody level={3}>
                From {tooltipData.data?.value} to {tooltipIntervalEndValue}
              </StyledTooltipBody>
              <StyledTooltipBody level={3}>
                Total: {distribution[tooltipData.index]?.count}
              </StyledTooltipBody>
            </StyledTooltipContent>
          </TooltipInPortal>
        )}
    </div>
  );
}

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTooltipBody = styled(Body)`
  color: ${Colors.white.hex()};
  font-family: Inter;
`;
