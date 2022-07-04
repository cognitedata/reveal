import {
  DatapointAggregates,
  DatapointsMultiQuery,
  DatapointInfo,
  CogniteClient,
  IdEither,
  Datapoints,
  DatapointAggregate,
  DatapointsQueryExternalId,
} from '@cognite/sdk';
import dayjs from 'dayjs';

import { range, last } from 'lodash';
import { ChartTimeSeries } from 'models/charts/charts/types/types';
import { pAll } from 'utils/helpers';
import { calculateGranularity, getGranularityInMS } from 'utils/timeseries';

const CELL_LIMIT = 10000;

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
): Promise<{
  start: number;
  end: number;
}> => {
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

export const fetchRawDatapoints = async (
  sdk: CogniteClient,
  request: DatapointsMultiQuery,
  timeseriesCollection: ChartTimeSeries[] = []
): Promise<DatapointAggregates[]> => {
  /**
   * Check if any of the series being downloaded contain more than 100000 points
   * (which is the limit for a single query)
   */

  const parallelizedQueries = request.items.map((item) => ({
    ...request,
    items: [item],
  }));

  // eslint-disable-next-line no-restricted-syntax
  for (const parallelizedQuery of parallelizedQueries) {
    const countRequest: DatapointsMultiQuery = {
      ...parallelizedQuery,
      granularity: calculateGranularity(
        [dayjs(request.start).valueOf(), dayjs(request.end).valueOf()],
        1000
      ),
      aggregates: ['count'],
    };

    // eslint-disable-next-line no-await-in-loop
    const [countResult] = await sdk.datapoints.retrieve(countRequest);

    const aggregatedCount = (
      countResult?.datapoints as DatapointAggregate[]
    ).reduce((point: number, c: DatapointAggregate) => {
      return point + (c.count || 0);
    }, 0);

    const timeseriesName = timeseriesCollection.find(
      (ts) =>
        ts.tsExternalId ===
        (countRequest.items[0] as DatapointsQueryExternalId).externalId
    )?.name;

    if (aggregatedCount > 100000) {
      throw new Error(
        `You tried to download more than 100,000 data points for the time series named '${timeseriesName}'. Please choose a smaller time span and/or a larger granularity.`
      );
    }
  }

  const rawParallizedQueries = parallelizedQueries.map((query) => ({
    ...query,
    granularity: undefined,
    aggregates: undefined,
    includeOutsidePoints: true,
    limit: 100000,
  }));

  const rawParallizedRequestThunks = rawParallizedQueries.map(
    (query) => () => sdk.datapoints.retrieve(query)
  );

  const rawResults: Datapoints[][] = (await pAll(
    rawParallizedRequestThunks,
    5
  )) as Datapoints[][];

  const results: DatapointAggregates[] = rawResults.map((result) => {
    return {
      ...result[0],
      isStep: false,
      isString: false,
      datapoints: result[0].datapoints.map(
        (p) =>
          ({
            ...p,
            average: p.value,
          } as DatapointAggregate)
      ),
    };
  });

  return results;
};
