import { useMemo } from 'react';

import { curveStepAfter, max, min } from 'd3';

import { Colors, toast } from '@cognite/cogs.js';
import type {
  AggregateType,
  LogicalCheck,
} from '@cognite/simconfig-api-sdk/rtk';

import { logicalCheck } from 'utils/ssd';
import { Timeseries } from 'utils/ssd/timeseries';

import { useBaseChart } from './BaseChart';
import { linearScale, timeScale } from './BaseChart/scale';
import type { TemporalDatum } from './types';
import { getCurve, getY } from './utils';

interface LogicalCheckChartProps {
  threshold: number;
  check: Required<LogicalCheck>['check'];
  data: TemporalDatum[];
  granularity: number;
  aggregateType: AggregateType;

  primaryColor?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  yAxisLabel?: string;
}

export function LogicalCheckChart({
  threshold,
  check,
  data,
  granularity,
  aggregateType = 'stepInterpolation',

  width = 300,
  height = 200,
  margin,
  yAxisLabel = 'Value',
  ...additionalChartProps
}: LogicalCheckChartProps) {
  const timeseries = useMemo(() => {
    try {
      return Timeseries.fromDatapoints(
        data,
        granularity * 60 * 1000
      ).getEquallySpacedResampled();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      toast.error(`Could not plot time series: ${e}`);
      return null;
    }
  }, [data, granularity]);

  const timestamps = useMemo(
    () => timeseries?.time.map((ms) => new Date(ms)),
    [timeseries]
  );

  const resampledData = useMemo(
    () =>
      timeseries?.time.map((time, index) => ({
        timestamp: new Date(time),
        value: timeseries.data[index],
      })),
    [timeseries]
  );

  const logicalCheckTimeseries = useMemo(() => {
    try {
      if (!timeseries?.data.length) {
        throw new Error('empty time series');
      }
      return logicalCheck(timeseries, +threshold, check);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      toast.error(`Failed to perform logical check calculation: ${e}`);
      return null;
    }
  }, [timeseries, threshold, check]);

  const logicalCheckData = useMemo(
    () =>
      logicalCheckTimeseries?.data.map((value, index) => ({
        timestamp: new Date(timestamps?.[index] ?? 0),
        value: value === 1 ? +threshold : undefined,
      })),
    [logicalCheckTimeseries, timestamps, threshold]
  );

  const minValue = min(timeseries?.data ?? []) ?? 0;
  const maxValue = max(timeseries?.data ?? []) ?? 1;
  const isBoolean =
    (minValue === 0 || minValue === 1) && (maxValue === 0 || maxValue === 1);

  const xScale = timeScale({ datapoints: timeseries?.time ?? [] });
  const yScale = linearScale({
    datapoints: timeseries?.data ?? [],
    padding: 0.025,
    boundary: isBoolean
      ? { min: 0, max: 1 }
      : {
          min: Math.min(minValue, threshold),
          max: Math.max(maxValue, threshold),
        },
    axis: 'y',
  });

  const curve = getCurve(aggregateType);

  const { Chart, Plot, Grid, Axis } = useBaseChart({
    height,
    width,
    margin,
    xScale,
    yScale,
  });

  const LogicalCheck = Plot.AreaFilled({
    label: 'Check true',
    data: logicalCheckData ?? [],
    pattern: 'diagonal',
    opacity: 0.3,
    curve,
  });

  const InputValue = Plot.LineRegular({
    label: 'Input value',
    data: resampledData ?? [],
    width: 1.5,
    curve,
  });

  const Threshold = Plot.LineRegular({
    label: 'Check threshold',
    data: [],
    color: Colors.red,
    width: 1,
    threshold,
    dashes: '5,1',
    curve: curveStepAfter,
  });

  return (
    <Chart
      isValid={!!resampledData?.length}
      legend={
        <>
          <InputValue.Label />
          <LogicalCheck.Label />
          <Threshold.Label />
        </>
      }
      overlayText={!resampledData?.length ? 'Chart not available' : ''}
      {...additionalChartProps}
    >
      {!isBoolean && <Grid.Horizontal />}

      <Axis.Left
        label={yAxisLabel}
        numTicks={isBoolean ? 1 : undefined}
        {...(isBoolean && {
          tickValues: [0, 1],
          tickFormat: (value) => (value ? 'True' : 'False'),
        })}
      />
      <Axis.Bottom />

      <LogicalCheck.Plot />
      <InputValue.Plot />
      <Threshold.Plot />

      <InputValue.Tooltip
        {...(isBoolean && {
          tooltipFormat: (data) => (getY(data) ? 'True' : 'False'),
        })}
      />
    </Chart>
  );
}
