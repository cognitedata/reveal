import {
  DatapointAggregate,
  DoubleDatapoint,
  StringDatapoint,
} from '@cognite/sdk';
import { hasRawPoints } from 'components/PlotlyChart/utils';
import { ChartThreshold } from 'models/charts/charts/types/types';
import { conversions } from '../models/charts/units/data/conversions';
import { getUnitConverter } from '../models/charts/units/utils/getUnitConverter';

export const convertUnits = (
  datapoints: (DoubleDatapoint | DatapointAggregate)[],
  inputUnit: string = '',
  outputUnit: string = ''
): (DoubleDatapoint | DatapointAggregate)[] => {
  const convert: (val: number) => number =
    (conversions[inputUnit] || {})[outputUnit] || ((val) => val);

  const convertedDataPoints = datapoints.map((x) => ({
    ...x,
    ...('average' in x
      ? {
          average: convert(x.average!),
        }
      : {}),
    ...('value' in x ? { value: convert(x.value) } : {}),
    ...('min' in x ? { min: convert(x.min!) } : {}),
    ...('max' in x ? { max: convert(x.max!) } : {}),
  }));

  return convertedDataPoints;
};

export const convertThresholdUnits = (
  thresholds: ChartThreshold[],
  inputUnit: string = '',
  outputUnit: string = ''
): ChartThreshold[] => {
  const convert: (val: number) => number =
    (conversions[inputUnit] || {})[outputUnit] || ((val) => val);

  const convertedThresholds = thresholds.map((th) => ({
    ...th,
    upperLimit: th.upperLimit ? convert(th.upperLimit) : th.upperLimit,
    lowerLimit: th.lowerLimit ? convert(th.lowerLimit) : th.lowerLimit,
  }));

  return convertedThresholds;
};

export type DatapointsSummary = {
  min: number | undefined;
  max: number | undefined;
  mean: number | undefined;
};

export function getUnitConvertedDatapointsSummary(
  datapoints: DoubleDatapoint[] | DatapointAggregate[] | StringDatapoint[],
  inputUnit?: string,
  outputUnit?: string
): DatapointsSummary {
  const isRaw = hasRawPoints(datapoints);
  const convert = getUnitConverter(inputUnit, outputUnit);

  let min: number | undefined;
  let max: number | undefined;
  let mean: number | undefined;

  if (isRaw) {
    const points = datapoints as DoubleDatapoint[];

    min = Math.min(...points.map((datapoint) => datapoint.value));
    max = Math.max(...points.map((datapoint) => datapoint.value));

    const totalSum = points.reduce(
      (total, { value }) => total + (value || 0),
      0
    );

    const totalCount = datapoints.length;

    mean = totalCount ? totalSum / totalCount : undefined;
  } else {
    const points = datapoints as DatapointAggregate[];

    min = points.length
      ? Math.min(
          ...points.map((datapoint) =>
            typeof datapoint.min === 'number' ? datapoint.min : NaN
          )
        )
      : NaN;

    max = points.length
      ? Math.max(
          ...points.map((datapoint) =>
            typeof datapoint.max === 'number' ? datapoint.max : NaN
          )
        )
      : NaN;

    const totalSum = points.reduce((total, { sum }) => total + (sum || 0), 0);

    const totalCount = points.reduce(
      (total, { count }) => total + (count || 0),
      0
    );

    mean = totalCount ? totalSum / totalCount : undefined;
  }

  const convertedValues = {
    min: convert(min),
    max: convert(max),
    mean: convert(mean),
  };

  return {
    min: Number.isNaN(convertedValues.min) ? undefined : convertedValues.min,
    max: Number.isNaN(convertedValues.max) ? undefined : convertedValues.max,
    mean: Number.isNaN(convertedValues.mean) ? undefined : convertedValues.mean,
  };
}
