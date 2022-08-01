import React, { useMemo } from 'react';

import { Body, Colors, Tooltip } from '@cognite/cogs.js';
import { AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar, BarStack } from '@visx/shape';
import { TextProps } from '@visx/text/lib/Text';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import styled from 'styled-components';

import { Count } from 'hooks/profiling-service';
import { useTranslation } from 'common/i18n';

const BOTTOM_AXIS_HEIGHT = 24;
const MAXIMUM_BAR_WIDTH = 16;
const NUMBER_OF_TICKS = 4;

const getAxisTickLabelStyle = (
  _: any,
  index: number,
  values: any[]
): Partial<TextProps> => {
  // The tick label is centered if there is only one tick. But if there are two
  // ticks, we left and right align the label at the both end of the axis.
  let textAnchor: TextProps['textAnchor'] = 'middle';
  let dx: TextProps['dx'] = 0;
  if (values.length > 1) {
    if (index === 0) {
      textAnchor = 'start';
      dx = -3;
    } else {
      textAnchor = 'end';
      dx = 3;
    }
  }

  return {
    fill: Colors['text-primary'].hex(),
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 500,
    textAnchor,
    dx,
  };
};

type Props = {
  distribution: Count[];
  isBottomAxisDisplayed?: boolean;
  isGridDisplayed?: boolean;
  isTooltipDisplayed?: boolean;
  maximumBarWidth?: number;
  rangeEnd?: number;
};
export default function Distribution({
  distribution,
  isBottomAxisDisplayed,
  isGridDisplayed,
  isTooltipDisplayed,
  maximumBarWidth,
  rangeEnd,
}: Props) {
  return (
    <ParentSize>
      {({ width, height }) =>
        width &&
        height && (
          <Graph
            distribution={distribution}
            isBottomAxisDisplayed={isBottomAxisDisplayed}
            isGridDisplayed={isGridDisplayed}
            width={width}
            height={height}
            rangeEnd={rangeEnd}
            isTooltipDisplayed={isTooltipDisplayed}
            maximumBarWidth={maximumBarWidth}
          />
        )
      }
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
  maximumBarWidth?: number;
  rangeEnd?: number;
};
export function Graph({
  distribution: rawDistribution,
  width,
  height,
  fill = 'rgba(41, 114, 225, 1)',
  isBottomAxisDisplayed,
  isGridDisplayed,
  isTooltipDisplayed,
  maximumBarWidth = MAXIMUM_BAR_WIDTH,
  rangeEnd,
}: GraphProps) {
  const { t } = useTranslation();
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

  const { containerRef } = useTooltipInPortal({
    scroll: true,
  });

  const distribution = useMemo(() => {
    return rawDistribution.map((value) => {
      const formattedValue =
        +Math.round((Number.parseFloat(value.value) + Number.EPSILON) * 100) /
        100;
      return {
        ...value,
        value: String(formattedValue),
      };
    });
  }, [rawDistribution]);

  const tickValues = useMemo(() => {
    if (distribution.length === 0) {
      return [];
    }
    if (distribution.length === 1) {
      return [distribution[0].value];
    }
    return [distribution[0].value, distribution[distribution.length - 1].value];
  }, [distribution]);

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
    <StyledTooltip
      $tooltipLeft={tooltipLeft}
      $tooltipTop={tooltipTop}
      content={
        <StyledTooltipContent>
          <StyledTooltipBody level={3}>
            {t('profiling-row-distribution-graph-tooltip-range', {
              start: tooltipData?.data?.value,
              end: tooltipIntervalEndValue,
            })}
          </StyledTooltipBody>
          <StyledTooltipBody level={3}>
            {t('profiling-row-distribution-graph-tooltip-total', {
              total: distribution[tooltipData?.index ?? 0]?.count,
            })}
          </StyledTooltipBody>
        </StyledTooltipContent>
      }
      disabled={
        !(
          isTooltipDisplayed &&
          rangeEnd !== undefined &&
          tooltipOpen &&
          tooltipData
        )
      }
      placement="right-start"
      visible={tooltipOpen}
    >
      <div style={{ position: 'relative' }}>
        <svg ref={containerRef} width={width} height={height}>
          <Group top={verticalMargin / 2}>
            {isTooltipDisplayed && rangeEnd !== undefined && (
              <BarStack
                data={distribution.map((value, i) => ({
                  ...value,
                  count: maxCount,
                  key: i.toString(),
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
                        const actualWidth = Math.min(width, maximumBarWidth);
                        const leftOffset = (width - actualWidth) / 2;
                        return (
                          <Bar
                            key={`bar-${bar.data.key}`}
                            x={x + leftOffset}
                            y={y}
                            width={actualWidth}
                            height={height}
                            fill={
                              tooltipData?.index === barIndex
                                ? Colors['bg-control--secondary']
                                : 'transparent'
                            }
                            onMouseLeave={handleMouseLeave}
                            onMouseMove={() => {
                              handleMouseMove(
                                bar.data,
                                barIndex,
                                x + width / 2
                              );
                            }}
                          />
                        );
                      }
                    )
                  )
                }
              </BarStack>
            )}
            {isGridDisplayed && (
              <GridRows
                scale={counts}
                width={xMax}
                height={yMax}
                numTicks={5}
                stroke={Colors['border-default'].hex()}
                strokeDasharray="6,6"
                strokeWidth={1}
                dy={1}
                tickValues={gridTickValues}
              />
            )}
            {isBottomAxisDisplayed && (
              <AxisBottom
                scale={categories}
                tickLabelProps={getAxisTickLabelStyle}
                tickValues={tickValues}
                strokeWidth={0}
                tickLineProps={{
                  stroke: Colors['border-default'].hex(),
                  strokeWidth: 1,
                  y2: 6,
                }}
                top={yMax}
              />
            )}
            <BarStack
              data={distribution.map((value, i) => ({
                ...value,
                key: i.toString(),
              }))}
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
                      const actualWidth = Math.min(width, maximumBarWidth);
                      const leftOffset = (width - actualWidth) / 2;
                      return (
                        <Bar
                          key={`bar-${bar.data.key}`}
                          x={x + leftOffset}
                          y={y}
                          width={actualWidth}
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
          </Group>
        </svg>
      </div>
    </StyledTooltip>
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

const StyledTooltip = styled(Tooltip)<{
  $tooltipLeft?: number;
  $tooltipTop?: number;
}>`
  left: ${({ $tooltipLeft = 0 }) => $tooltipLeft}px;
  transition: none;
  top: ${({ $tooltipTop = 0 }) => $tooltipTop + 8}px;
`;
