import React, { useMemo } from 'react';

import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { Legend, LegendItem, LegendLabel } from '@visx/legend';
import { PatternLines } from '@visx/pattern';
import { scaleLinear, scaleOrdinal, scaleTime } from '@visx/scale';
import { AreaClosed, LinePath } from '@visx/shape';

import { extent, max, min } from 'd3';
import { format } from 'date-fns';
import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js';
import type { LogicalCheck } from '@cognite/simconfig-api-sdk/rtk';

import { edPelt, logicalCheck, steadyStateDetection } from 'utils/ssd';
import { Timeseries } from 'utils/ssd/timeseries';
import type { Datapoint } from 'utils/ssd/timeseries';

import type Color from 'color';
import type { CurveFactory } from 'd3';

interface SteadyStateDetectionChartProps {
  threshold: number;
  check: Required<LogicalCheck>['check'];
  data: Datapoint[];
  minSegmentDistance: number;
  varianceThreshold: number;
  slopeThreshold: number;

  primaryColor?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  curve?: CurveFactory;
  isChangePointGridVisible?: boolean;
  yAxisLabel?: string;
}

const getX = (d: Partial<Datapoint>) =>
  d.timestamp ? new Date(d.timestamp).valueOf() : undefined;
const getY = (d: Partial<Datapoint>) =>
  d.value !== undefined ? Number(d.value) : undefined;

export function SteadyStateDetectionChart({
  threshold,
  check,
  data,

  minSegmentDistance,
  varianceThreshold,
  slopeThreshold,

  primaryColor = (Colors.primary as Color).hex(),
  width = 300,
  height = 200,
  margin = { top: 6, right: 24, bottom: 24, left: 54 },
  curve = curveMonotoneX,
  isChangePointGridVisible = false,
  yAxisLabel = 'Value',
}: SteadyStateDetectionChartProps) {
  // FIXME(SIM-209): Avoid converting back and forth between date/epoch
  // TODO(SIM-000): Ideally here we need to pass the granularity and isStep (aggregation === 'stepInterpolation') when initializing the Timeseries
  const timeseries = useMemo(
    () => Timeseries.fromDatapoints(data).getEquallySpacedResampled(),
    [data]
  );
  const timestamps = useMemo(
    () => timeseries.time.map((ms) => new Date(ms)),
    [timeseries]
  );
  const resampledData = useMemo(
    () =>
      timeseries.time.map((time, index) => ({
        timestamp: new Date(time),
        value: timeseries.data[index],
      })),
    [timeseries]
  );

  const logicalCheckTimeseries = useMemo(
    () => logicalCheck(timeseries, threshold, check),
    [timeseries, threshold, check]
  );
  const logicalCheckData = useMemo(
    () =>
      logicalCheckTimeseries.data.map((value, index) => ({
        timestamp: new Date(timestamps[index]),
        value: value === 1 ? timeseries.data[index] : undefined,
      })),
    [logicalCheckTimeseries, timestamps, timeseries.data]
  );
  const changePoints = useMemo(
    () => edPelt(timeseries.data, minSegmentDistance),
    [minSegmentDistance, timeseries.data]
  );
  const steadyStateDetectionTimeseries = useMemo(
    () =>
      steadyStateDetection(
        timeseries,
        minSegmentDistance,
        varianceThreshold,
        slopeThreshold
      ),
    [minSegmentDistance, timeseries, slopeThreshold, varianceThreshold]
  );
  const steadyStateDetectionData = useMemo(
    () =>
      resampledData.map((item, index) =>
        steadyStateDetectionTimeseries.data[index] === 1
          ? item
          : { timestamp: item.timestamp, value: undefined }
      ),
    [resampledData, steadyStateDetectionTimeseries.data]
  );

  const legend = useMemo(
    () => <SteadyStateDetectionChartLegend primaryColor={primaryColor} />,
    [primaryColor]
  );

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleTime<number>({
        // FIXME(SIM-209) fix types to avoid assertion
        domain: extent(timeseries.time) as unknown as [Date, Date],
        range: [0, xMax],
        nice: true,
      }),
    [timeseries.time, xMax]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [
          (min(timeseries.data) ?? 0) * 0.995,
          (max(timeseries.data) ?? 1) * 1.025,
        ],
        range: [yMax, 0],
        nice: true,
      }),
    [timeseries.data, yMax]
  );

  return (
    <ChartContainer>
      <svg height={height} width={width}>
        <rect fill="white" height={height} rx={14} width={width} x={0} y={0} />
        <Group left={margin.left} top={margin.top}>
          <AxisBottom
            numTicks={width > 520 ? 10 : 5}
            scale={xScale}
            tickFormat={(value) =>
              value instanceof Date
                ? format(value, 'HH:mm')
                : (+value).toString()
            }
            top={yMax}
          />
          <AxisLeft label={yAxisLabel} scale={yScale} />

          {/* Threshold line */}
          <GridRows
            height={yMax}
            scale={yScale}
            stroke="#e32351"
            strokeDasharray="5,1"
            strokeOpacity={0.5}
            strokeWidth={2}
            tickValues={[threshold]}
            width={xMax}
          />

          <GridRows
            height={yMax}
            scale={yScale}
            stroke="#000"
            strokeOpacity={0.1}
            strokeWidth={1}
            width={xMax}
          />

          {/* Change points */}
          {isChangePointGridVisible && (
            <GridColumns
              height={yMax}
              scale={xScale}
              stroke={primaryColor}
              strokeOpacity={0.2}
              tickValues={changePoints.map((it) => timeseries.time[it])}
              width={xMax}
            />
          )}
          {changePoints.map((index) => {
            const left = xScale(getX(resampledData[index]) ?? 0);
            const top = yScale(getY(resampledData[index]) ?? 0);

            return (
              <Group key={`cp-glyph-${index}`} left={left} top={top}>
                <circle
                  fill="transparent"
                  r={5}
                  stroke={primaryColor}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <circle fill={primaryColor} r={2} />
              </Group>
            );
          })}
          <LinePath
            curve={curve}
            data={steadyStateDetectionData}
            defined={(item) => item.value !== undefined}
            stroke={primaryColor}
            strokeOpacity={1}
            strokeWidth={2.5}
            x={(d) => xScale(getX(d) ?? 0)}
            y={(d) => yScale(getY(d) ?? 0)}
          />
          <AreaClosed
            curve={curve}
            data={steadyStateDetectionData}
            defined={(item) => item.value !== undefined}
            fill={primaryColor}
            fillOpacity={0.1}
            stroke="transparent"
            strokeWidth={1.5}
            x={(d) => xScale(getX(d) ?? 0)}
            y={(d) => yScale(getY(d) ?? 0)}
            yScale={yScale}
          />
          <LinePath
            curve={curve}
            data={resampledData}
            stroke={primaryColor}
            strokeOpacity={0.7}
            strokeWidth={1}
            x={(d) => xScale(getX(d) ?? 0)}
            y={(d) => yScale(getY(d) ?? 0)}
          />
          <PatternLines
            height={4}
            id="logicalCheckBg"
            orientation={['diagonal']}
            stroke="#18af8e"
            strokeWidth={1}
            width={4}
          />
          <AreaClosed
            curve={curve}
            data={logicalCheckData}
            defined={(item) => item.value !== undefined}
            fill="url(#lc)"
            fillOpacity={0.3}
            stroke="transparent"
            strokeWidth={1.5}
            x={(d) => xScale(getX(d) ?? 0)}
            y={(d) => yScale(getY(d) ?? 0)}
            yScale={yScale}
          />
        </Group>
      </svg>
      {legend}
    </ChartContainer>
  );
}

const ChartContainer = styled.div`
  position: relative;
`;

interface SteadyStateDetectionChartLegendProps {
  primaryColor: string;
  itemSize?: number;
}

function SteadyStateDetectionChartLegend({
  primaryColor,
  itemSize = 12,
}: SteadyStateDetectionChartLegendProps) {
  const legendScale = scaleOrdinal<string, React.ReactElement>({
    domain: [
      'Steady state',
      'Non-steady state',
      'Check threshold',
      'Change point',
      'Check true',
    ],
    range: [
      <line
        key="steadyState"
        stroke={primaryColor}
        strokeWidth={2}
        x1={0}
        x2={itemSize}
        y1={itemSize / 2}
        y2={itemSize / 2}
      />,
      <line
        key="nonSteadyState"
        stroke={primaryColor}
        strokeOpacity={0.5}
        strokeWidth={1}
        x1={0}
        x2={itemSize}
        y1={itemSize / 2}
        y2={itemSize / 2}
      />,
      <line
        key="logicalThreshold"
        stroke="#e32351"
        strokeDasharray="5,1"
        strokeOpacity={0.5}
        strokeWidth={2}
        x1={0}
        x2={itemSize}
        y1={itemSize / 2}
        y2={itemSize / 2}
      />,
      <Group key="changePoint" left={itemSize / 2} top={itemSize / 2}>
        <circle
          fill="transparent"
          r={5}
          stroke={primaryColor}
          strokeOpacity={0.5}
          strokeWidth={1}
        />
        <circle fill={primaryColor} r={2} />
      </Group>,
      <rect
        fill="url(#logicalCheckBg)"
        fillOpacity={0.5}
        height={itemSize}
        key="logicalCheck"
        width={itemSize}
        x={0}
        y={0}
      />,
    ],
  });

  return (
    <Legend scale={legendScale}>
      {(labels) => (
        <LegendContainer>
          {labels.map((label) => {
            const shape = React.cloneElement(legendScale(label.datum));
            return (
              <LegendItem key={`legend-quantile-${label.datum}`}>
                <svg height={itemSize} width={itemSize}>
                  {shape}
                </svg>
                <LegendLabel align="left" margin={0}>
                  {label.text}
                </LegendLabel>
              </LegendItem>
            );
          })}
        </LegendContainer>
      )}
    </Legend>
  );
}

const LegendContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  font-size: 10px;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.7);
  padding: 0 24px 0 6px;
  text-shadow: 0 0 1px #fff;
  .visx-legend-item {
    display: flex;
    gap: 6px;
  }
`;
