import { StatisticsResultResults } from '@cognite/calculation-backend';
import DetailsSidebar from 'components/DetailsSidebar/DetailsSidebar';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import getDisplayUnit from 'models/charts/units/utils/getDisplayUnit';
import { ComponentProps } from 'react';
import { getUnitConverter } from 'models/charts/units/utils/getUnitConverter';

type StatisticsProps = ComponentProps<
  typeof DetailsSidebar
>['source']['statistics'];

const unitConvertStatistics = (
  statistics: StatisticsResultResults,
  converter: (value?: number) => number
): Omit<StatisticsProps, 'error' | 'loading' | 'unit'> => {
  return {
    count: converter(statistics.count),
    min: converter(statistics.min),
    max: converter(statistics.max),
    median: converter(statistics.median),
    mean: converter(statistics.mean),
    std: converter(statistics.std),
    q25: converter(statistics.q25),
    q50: converter(statistics.q50),
    q75: converter(statistics.q75),
    skewness: converter(statistics.skewness),
    kurtosis: converter(statistics.kurtosis),
    histogram:
      statistics.histogram?.map((value) => ({
        ...value,
        rangeStart: converter(value.range_start),
        rangeEnd: converter(value.range_end),
      })) ?? [],
  };
};

export default function statisticsSelector(
  source: ChartWorkflow | ChartTimeSeries,
  statistics: StatisticsResultResults | null | undefined,
  error: unknown,
  loading: boolean
): StatisticsProps {
  const baseResult = {
    count: NaN,
    min: NaN,
    max: NaN,
    median: NaN,
    mean: NaN,
    std: NaN,
    q25: NaN,
    q50: NaN,
    q75: NaN,
    skewness: NaN,
    kurtosis: NaN,
    histogram: [],
    loading,
    unit: getDisplayUnit(
      source.preferredUnit,
      source.customUnitLabel ?? source.unit
    ),
    error: error ? String(error) : false,
  };

  if (statistics) {
    const converter = getUnitConverter(
      source.preferredUnit,
      source.customUnitLabel
    );
    return {
      ...baseResult,
      ...unitConvertStatistics(statistics, converter),
    };
  }
  return baseResult;
}
