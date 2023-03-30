import { DateRange } from '../../../types';
import { calculateGranularity } from '../../../utils/calculateGranularity';
import { DatapointsQueryBase } from '../../service/types';
import { useDatapointAggregatesChartData } from './useDatapointAggregatesChartData';
import { useStringDatapointsChartData } from './useStringDatapointsChartData';

export interface Props {
  timeseriesId: number;
  dateRange?: DateRange;
  numberOfPoints: number;
  isString: boolean;
}

export const useTimeseriesChartData = ({
  timeseriesId,
  dateRange,
  numberOfPoints,
  isString,
}: Props) => {
  const queryBase: DatapointsQueryBase = {
    timeseriesId,
    start: dateRange?.[0],
    end: dateRange?.[1],
    limit: numberOfPoints,
  };

  const datapointAggregatesChartData = useDatapointAggregatesChartData({
    query: {
      ...queryBase,
      aggregates: ['average', 'max', 'min', 'count'],
      granularity: dateRange && calculateGranularity(dateRange, numberOfPoints),
    },
    enabled: !isString,
  });

  const stringDatapointsChartData = useStringDatapointsChartData({
    query: queryBase,
    enabled: isString,
  });

  if (isString) {
    return stringDatapointsChartData;
  }

  return datapointAggregatesChartData;
};
