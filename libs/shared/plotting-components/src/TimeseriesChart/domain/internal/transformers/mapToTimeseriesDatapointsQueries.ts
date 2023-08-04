import {
  TimeseriesDatapointsQuery,
  TimeseriesDatapointsQueryBase,
} from '../../service/types';
import { TimeseriesChartMetadata, TimeseriesChartQuery } from '../types';
import { calculateGranularity } from '../utils';

interface Props {
  query: TimeseriesChartQuery;
  metadata: TimeseriesChartMetadata[];
}

export const mapToTimeseriesDatapointsQueries = ({
  query,
  metadata,
}: Props): TimeseriesDatapointsQuery[] => {
  const { dateRange } = query;

  return metadata.map(({ id, dataFetchMode, numberOfPoints }) => {
    const queryBase: TimeseriesDatapointsQueryBase = {
      item: { id },
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
  });
};
