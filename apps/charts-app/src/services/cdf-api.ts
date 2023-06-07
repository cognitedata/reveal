import {
  CogniteClient,
  DatapointsMultiQuery,
  DatapointAggregates,
  DatapointAggregate,
  Datapoints,
} from '@cognite/sdk';
import { RAW_DATA_POINTS_THRESHOLD } from 'utils/constants';

export function fetchRawOrAggregatedDatapoints(
  sdk: CogniteClient,
  query: DatapointsMultiQuery
) {
  return sdk.datapoints
    .retrieve(query)
    .then((r: DatapointAggregates[] | Datapoints[]) => {
      const aggregatedCount = (r[0]?.datapoints as DatapointAggregate[]).reduce(
        (point: number, c: DatapointAggregate) => {
          return point + (c.count || 0);
        },
        0
      );

      const isRaw = aggregatedCount < RAW_DATA_POINTS_THRESHOLD;

      return isRaw
        ? sdk.datapoints.retrieve({
            ...query,
            granularity: undefined,
            aggregates: undefined,
            includeOutsidePoints: true,
          } as DatapointsMultiQuery)
        : r;
    })
    .then((r) => r[0]);
}
