import React, { useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  RUN_HISTORY_CHART_DEFAULT_MARGIN,
  RUN_HISTORY_CHART_NUMBER_OF_TICKS_X_AXIS,
  RUN_HISTORY_CHART_NUMBER_OF_TICKS_Y_AXIS,
  RUN_HISTORY_CHART_STROKE_DASHARRAY,
  RUN_HISTORY_CHART_STROKE_OPACITY,
  RUN_HISTORY_CHART_TIME_FORMAT,
} from '@transformations/common';
import {
  JobMetric,
  JobMetricsGroup,
  useGroupedJobMetrics,
  useJobDetails,
} from '@transformations/hooks';
import { Job } from '@transformations/types';
import {
  generateRunHistoryChartTickValues,
  getRunHistoryChartCategoryColor,
  getRunHistoryChartXAxisTickLabelStyle,
  getRunHistoryChartYAxisTickLabelStyle,
  parseMetricName,
} from '@transformations/utils';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Circle, LinePath } from '@visx/shape';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import dayjs from 'dayjs';

import { getDetailedTime } from '@cognite/cdf-utilities';
import { Colors, Flex, Tooltip } from '@cognite/cogs.js';

import RunHistoryChartLegend from './RunHistoryChartLegend';

type RunHistoryChartProps = {
  jobId: Job['id'];
};

const RunHistoryChart = ({ jobId }: RunHistoryChartProps) => {
  const { data: details } = useJobDetails(jobId);
  const { data: groupedJobMetrics } = useGroupedJobMetrics(jobId);

  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  if (!details || !groupedJobMetrics.length || !details.startedTime) {
    return <></>;
  }

  return (
    <ParentSize>
      {({ width, height }) =>
        width &&
        height && (
          <div>
            <RunHistoryChartContent
              height={300}
              hiddenCategories={hiddenCategories}
              groupedJobMetrics={groupedJobMetrics}
              width={width}
            />
            <RunHistoryChartLegend
              hiddenCategories={hiddenCategories}
              setHiddenCategories={setHiddenCategories}
              groupedJobMetrics={groupedJobMetrics}
            />
          </div>
        )
      }
    </ParentSize>
  );
};

type RunHistoryChartContentProps = {
  height: number;
  hiddenCategories: string[];
  groupedJobMetrics: JobMetricsGroup[];
  width: number;
};

const RunHistoryChartContent = ({
  height,
  hiddenCategories,
  groupedJobMetrics,
  width,
}: RunHistoryChartContentProps) => {
  const [minTimestamp, maxTimestamp, maxCount] = useMemo(() => {
    const values = Object.values(groupedJobMetrics);
    const timestamps = values.flatMap(({ metrics }) =>
      metrics.map(({ timestamp }) => timestamp)
    );
    const counts = values.flatMap(({ metrics }) =>
      metrics.map(({ count }) => count)
    );
    return [
      Math.min(...timestamps),
      Math.max(...timestamps),
      Math.max(...counts),
    ];
  }, [groupedJobMetrics]);

  const margin = RUN_HISTORY_CHART_DEFAULT_MARGIN;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const timeScale = scaleTime<number>({
    domain: [minTimestamp, maxTimestamp],
  });
  timeScale.range([0, xMax]);

  const requestScale = scaleLinear<number>({
    domain: [0, maxCount],
    nice: true,
  });
  requestScale.range([yMax, 0]);

  const gridTickValues = generateRunHistoryChartTickValues(
    0,
    maxCount,
    RUN_HISTORY_CHART_NUMBER_OF_TICKS_Y_AXIS
  ).slice(1);

  const timeScaleTickValues = generateRunHistoryChartTickValues(
    minTimestamp,
    maxTimestamp,
    RUN_HISTORY_CHART_NUMBER_OF_TICKS_X_AXIS
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{
    data: JobMetric;
  }>();

  const { containerRef } = useTooltipInPortal({
    scroll: true,
  });

  const handleMouseLeave = (): void => {
    hideTooltip();
  };

  const handleMouseMove = (
    data: JobMetric,
    top: number,
    left: number
  ): void => {
    showTooltip({
      tooltipData: {
        data,
      },
      tooltipTop: top,
      tooltipLeft: left + margin.left,
    });
  };

  return (
    <StyledTooltip
      $tooltipLeft={tooltipLeft}
      $tooltipTop={tooltipTop}
      content={
        <Flex direction="column">
          <span>
            {tooltipData?.data?.timestamp
              ? getDetailedTime(tooltipData?.data?.timestamp!)
              : ''}
          </span>
          <span>
            {`${
              parseMetricName(tooltipData?.data?.name ?? '').label
            }: ${new Intl.NumberFormat().format(
              tooltipData?.data?.count ?? 0
            )}`}
          </span>
        </Flex>
      }
      disabled={!(tooltipOpen && tooltipData)}
      placement="right-start"
      visible={tooltipOpen}
    >
      <div>
        <svg ref={containerRef} width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            <line
              x1={-10}
              x2={xMax + 10}
              y1={yMax}
              y2={yMax}
              stroke={Colors['border--status-undefined--muted']}
            />
            <GridRows
              scale={requestScale}
              width={xMax}
              height={yMax}
              stroke={Colors['border--status-undefined--muted']}
              strokeDasharray={RUN_HISTORY_CHART_STROKE_DASHARRAY}
              strokeWidth={1}
              dy={1}
              tickValues={gridTickValues}
            />
            <AxisBottom
              top={yMax}
              scale={timeScale}
              tickLabelProps={getRunHistoryChartXAxisTickLabelStyle}
              tickFormat={(d) =>
                dayjs(d as Date).format(RUN_HISTORY_CHART_TIME_FORMAT)
              }
              tickLineProps={{
                stroke: Colors['border--status-undefined--muted'],
                strokeWidth: 1,
                y2: 6,
              }}
              strokeWidth={0}
              tickValues={
                minTimestamp !== maxTimestamp
                  ? timeScaleTickValues
                  : timeScaleTickValues.slice(0, 1)
              }
            />
            <AxisLeft
              scale={requestScale}
              tickFormat={(d) =>
                new Intl.NumberFormat(undefined, {
                  compactDisplay: 'short',
                  notation: 'compact',
                }).format(d as number)
              }
              tickLabelProps={getRunHistoryChartYAxisTickLabelStyle}
              tickValues={gridTickValues}
              strokeWidth={0}
            />
            {groupedJobMetrics.map(({ action, metrics, name }, index) =>
              !hiddenCategories.includes(name) ? (
                <React.Fragment key={name}>
                  <LinePath
                    key={name}
                    data={metrics}
                    x={(d) => timeScale(d.timestamp) ?? 0}
                    y={(d) => requestScale(d.count) ?? 0}
                    stroke={
                      Colors[
                        `decorative--${getRunHistoryChartCategoryColor(
                          index
                        )}--700`
                      ]
                    }
                    strokeWidth={1.5}
                    strokeOpacity={RUN_HISTORY_CHART_STROKE_OPACITY}
                    strokeDasharray={
                      action === 'read'
                        ? RUN_HISTORY_CHART_STROKE_DASHARRAY
                        : undefined
                    }
                  />
                </React.Fragment>
              ) : (
                <></>
              )
            )}
            {groupedJobMetrics.map(({ metrics, name }, index) =>
              !hiddenCategories.includes(name) ? (
                <React.Fragment key={name}>
                  {metrics.map((item) => (
                    <Circle
                      key={`${name}-${item.timestamp}-${item.id}`}
                      cx={timeScale(item.timestamp) ?? 0}
                      cy={requestScale(item.count) ?? 0}
                      r={3}
                      fill={
                        Colors[
                          `decorative--${getRunHistoryChartCategoryColor(
                            index
                          )}--600`
                        ]
                      }
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={() => {
                        handleMouseMove(
                          item,
                          requestScale(item.count) ?? 0,
                          timeScale(item.timestamp) ?? 0
                        );
                      }}
                    />
                  ))}
                </React.Fragment>
              ) : (
                <></>
              )
            )}
          </Group>
        </svg>
      </div>
    </StyledTooltip>
  );
};

const StyledTooltip = styled(Tooltip)<{
  $tooltipLeft?: number;
  $tooltipTop?: number;
}>`
  left: ${({ $tooltipLeft = 0 }) => $tooltipLeft}px;
  transition: none;
  top: ${({ $tooltipTop = 0 }) => $tooltipTop + 8}px;
`;

export default RunHistoryChart;
