import {
  DatapointAggregates,
  DatapointsMultiQuery,
  DatapointInfo,
  CogniteClient,
  IdEither,
} from '@cognite/sdk';

import { range, last } from 'lodash';
import { pAll } from 'utils/helpers';
import { getGranularityInMS } from 'utils/timeseries';

const CELL_LIMIT = 10000;

export interface TimeRange<T> {
  start: T;
  end: T;
}

const extractId = (either: IdEither): IdEither => {
  return 'id' in either
    ? {
        id: either.id,
      }
    : {
        externalId: either.externalId,
      };
};

const getTimestamps = (arr: { datapoints: DatapointInfo[] }[]) => {
  return arr
    .filter(({ datapoints }) => datapoints.length)
    .map(({ datapoints: [item] }) => item.timestamp.getTime());
};

const getLimits = async (
  sdk: CogniteClient,
  request: DatapointsMultiQuery
): Promise<TimeRange<number>> => {
  const { min, max } = Math;
  const { retrieveLatest, retrieve } = sdk.datapoints;
  let { start = 0, end = 0 } = request;
  const ids = request.items.map(extractId);
  const [startResults, endResults] = await Promise.all([
    retrieve({
      ...request,
      start,
      end,
      limit: 1,
    }),
    retrieveLatest(ids),
  ]);

  start = max(min(...getTimestamps(startResults)), Number(start));
  end = min(max(...getTimestamps(endResults)), Number(end));

  return { start, end };
};

export const fetchDataPoints = async (
  sdk: CogniteClient,
  request: DatapointsMultiQuery
): Promise<DatapointAggregates[]> => {
  const { start = 0, end = 0 } = await getLimits(sdk, request);
  const numericGranularity = getGranularityInMS(request.granularity!);
  const limit = Math.floor(CELL_LIMIT / request.items.length);
  const msPerRequest = limit * numericGranularity;

  const ranges = range(start, end, msPerRequest);
  const chunks = ranges.map((subRange) => [
    subRange,
    subRange + msPerRequest - numericGranularity,
  ]);
  const lastChunk = last(chunks);

  if (lastChunk![1] > end) {
    lastChunk![1] = end;
  }

  const requests = chunks
    .map(([chunkStart, chunkEnd]) => ({
      ...request,
      start: chunkStart,
      end: chunkEnd,
      limit,
    }))
    .map((params) => () => sdk.datapoints.retrieve(params));

  const results: DatapointAggregates[][] = (await pAll(
    requests,
    5
  )) as DatapointAggregates[][];

  return results.reduce((result, datapointsChunk) => {
    return result.map((dp, index) => {
      dp.datapoints = [...dp.datapoints, ...datapointsChunk[index].datapoints];

      return dp;
    });
  });
};
