import { CogniteClient } from '@cognite/sdk';

import last from 'lodash/last';

import { TimeseriesDatapoint, TimeseriesDatapointsQuery } from '../types';
import { splitLimitIntoChunks } from '../utils';
import { getTimeseriesDatapoints } from './getTimeseriesDatapoints';

const MAX_RAW_DATAPOINTS_LIMIT = 100000;
const MAX_AGGREGATED_DATAPOINTS_LIMIT = 10000;

/**
 * API currently doesn't support pagination for retrieving datapoints.
 * Requests can be failed if the query.limt exceeds the capable limit.
 * This function takes care of it and makes sure that,
 * all the requests are made with the correct limits.
 */
export const getTimeseriesDatapointsSafe = (
  sdk: CogniteClient,
  query: TimeseriesDatapointsQuery
): Promise<TimeseriesDatapoint[]> => {
  const maxLimit =
    'aggregates' in query
      ? MAX_AGGREGATED_DATAPOINTS_LIMIT
      : MAX_RAW_DATAPOINTS_LIMIT;

  let { start, limit = maxLimit } = query;

  const chunks = splitLimitIntoChunks(limit, maxLimit);

  return Promise.all(
    chunks.map(async (limit) => {
      const datapoints = await getTimeseriesDatapoints(sdk, {
        ...query,
        start,
        limit,
      });

      /**
       * The datapoints are sorted by the timestamp.
       * Take the timestamp of last datapoint and,
       * set it as `start` for the next request.
       */
      start = last(datapoints)?.timestamp;

      return datapoints;
    })
  ).then((result) => result.flat());
};
