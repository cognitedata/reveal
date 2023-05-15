import {
  TimeseriesDatapointsQuery,
  TimeseriesDatapointsQueryBase,
} from '../../service/types';
import { TimeseriesChartMetadata, TimeseriesChartQuery } from '../types';
import { calculateGranularity } from '../utils';

interface Props {
  query: TimeseriesChartQuery;
  metadata: TimeseriesChartMetadata;
}

export const mapToTimeseriesDatapointsQuery = ({
  query,
  metadata,
}: Props): TimeseriesDatapointsQuery => {
  const { timeseriesId, dateRange } = query;
  const { numberOfPoints, dataFetchMode } = metadata;

  const queryBase: TimeseriesDatapointsQueryBase = {
    id: timeseriesId,
    start: dateRange?.[0],
    end: dateRange?.[1],
    limit: numberOfPoints,
  };

  if (dataFetchMode === 'raw') {
    return queryBase;
  }

  return {
    ...queryBase,
    aggregates: ['average', 'max', 'min', 'count'],
    granularity: calculateGranularity(dateRange, numberOfPoints),
  };
};
