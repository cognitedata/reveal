import { useMemo } from 'react';

import { toast } from '@cognite/cogs.js';
import type { AggregateType } from '@cognite/simconfig-api-sdk/rtk';

import { edPelt, steadyStateDetection } from 'utils/ssd';
import { Timeseries } from 'utils/ssd/timeseries';

import { useBaseChart } from './BaseChart';
import { linearScale, timeScale } from './BaseChart/scale';
import type { TemporalDatum } from './types';
import { getCurve } from './utils';

interface SteadyStateDetectionChartProps {
  data: TemporalDatum[];
  granularity: number;

  minSegmentDistance: number;
  varianceThreshold: number;
  slopeThreshold: number;
  aggregateType: AggregateType;

  primaryColor?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  yAxisLabel?: string;
}

export function SteadyStateDetectionChart({
  data,
  granularity,

  minSegmentDistance,
  varianceThreshold,
  slopeThreshold,
  aggregateType = 'average',

  width = 300,
  height = 200,
  margin,
  yAxisLabel = 'Value',
  ...additionalChartProps
}: SteadyStateDetectionChartProps) {
  // TODO(SIM-000): Ideally here we need to pass the granularity and isStep (aggregation === 'stepInterpolation') when initializing the Timeseries
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

  const resampledData = useMemo(
    () =>
      timeseries?.time.map((time, index) => ({
        timestamp: new Date(time),
        value: timeseries.data[index],
      })),
    [timeseries]
  );

  const changePoints = useMemo(() => {
    try {
      if (!timeseries?.data.length) {
        throw new Error('empty time series');
      }
      return edPelt(timeseries.data, minSegmentDistance);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      toast.error(`Change point calculation failed: ${e}`);
      return [];
    }
  }, [minSegmentDistance, timeseries?.data]);

  const steadyStateDetectionTimeseries = useMemo(() => {
    try {
      if (!timeseries?.data.length) {
        throw new Error('empty time series');
      }
      return steadyStateDetection(
        timeseries,
        minSegmentDistance,
        varianceThreshold,
        slopeThreshold
      );
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      toast.error(`Steady state detection failed: ${e}`);
      return null;
    }
  }, [minSegmentDistance, timeseries, slopeThreshold, varianceThreshold]);

  const steadyStateDetectionData = useMemo(
    () =>
      resampledData?.map((item, index) =>
        steadyStateDetectionTimeseries?.data[index] === 1
          ? item
          : { timestamp: item.timestamp, value: undefined }
      ),
    [resampledData, steadyStateDetectionTimeseries?.data]
  );

  const xScale = timeScale({ datapoints: timeseries?.time ?? [] });
  const yScale = linearScale({
    datapoints: timeseries?.data ?? [],
    padding: 0.025,
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

  const NonSteadyState = Plot.LineRegular({
    label: 'Non-steady state',
    data: resampledData ?? [],
    opacity: 0.5,
    curve,
  });

  const SteadyState = Plot.LineRegular({
    label: 'Steady state',
    data: steadyStateDetectionData ?? [],
    width: 2.5,
    curve,
  });

  const SteadyStateFill = Plot.AreaFilled({
    data: steadyStateDetectionData ?? [],
    curve,
  });

  const ChangePoint = Plot.ChangePoint({
    label: 'Change point',
    data: resampledData
      ? changePoints.map((index) => resampledData[index])
      : [],
  });

  return (
    <Chart
      isValid={!!resampledData?.length}
      legend={
        <>
          <SteadyState.Label />
          <NonSteadyState.Label />
          <ChangePoint.Label />
        </>
      }
      overlayText={!resampledData?.length ? 'Chart not available' : ''}
      {...additionalChartProps}
    >
      <Grid.Horizontal />

      <NonSteadyState.Plot />
      <SteadyStateFill.Plot />
      <SteadyState.Plot />
      <ChangePoint.Plot />

      <NonSteadyState.Tooltip />

      <Axis.Left label={yAxisLabel} />
      <Axis.Bottom />
    </Chart>
  );
}
