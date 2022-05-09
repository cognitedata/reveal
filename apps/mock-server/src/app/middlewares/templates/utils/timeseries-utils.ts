/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import {
  CdfMockDatabase,
  CdfResourceObject,
  Datapoint,
  DatapointGroup,
} from '../../../types';
import { filterCollection } from '../../../utils';
import {
  startOfDay,
  startOfHour,
  startOfMinute,
  addDays,
  addMinutes,
  addHours,
  addSeconds,
  startOfSecond,
} from 'date-fns';
import { Collection } from '../../../common/collection';

export const findDatapoints = (
  externalId: string,
  db: CdfMockDatabase
): CdfResourceObject[] => {
  const linkedData = CdfDatabaseService.from(db, 'datapoints').find({
    externalId,
  });
  return linkedData.datapoints as CdfResourceObject[];
};

function getTimeRangeBasedOnGranularity(
  timestamp: number,
  granularity: string,
  increment: boolean
): number {
  let generateTime;
  const timeRange = granularity.match(/\d/g)
    ? +granularity.replace(/\D/g, '')
    : 0;
  const unit = granularity.replace(/\d/g, '');

  switch (unit) {
    case 'd':
    case 'day':
    case 'days': {
      generateTime = increment
        ? addDays(startOfDay(timestamp), timeRange).getTime()
        : startOfDay(timestamp).getTime();
      break;
    }
    case 'm':
    case 'minute':
    case 'minutes': {
      generateTime = increment
        ? addMinutes(startOfMinute(timestamp), timeRange).getTime()
        : startOfMinute(timestamp).getTime();
      break;
    }
    case 'h':
    case 'hour':
    case 'hours': {
      generateTime = increment
        ? addHours(startOfHour(timestamp), timeRange).getTime()
        : startOfHour(timestamp).getTime();
      break;
    }
    case 's':
    case 'second':
    case 'seconds': {
      generateTime = increment
        ? addSeconds(startOfSecond(timestamp), timeRange).getTime()
        : startOfSecond(timestamp).getTime();
      break;
    }
  }

  return generateTime;
}

function groupTimesBy(datapoints, granularity = 'day') {
  const grouppedResults = {};

  let nextStepToMatch;
  for (let i = 0; i < datapoints.length; i++) {
    //get the new next value
    const datapoint = datapoints[i];

    const curDatapointTimestamp = getTimeRangeBasedOnGranularity(
      datapoint.timestamp,
      granularity,
      false
    );

    if (!nextStepToMatch || curDatapointTimestamp >= nextStepToMatch) {
      nextStepToMatch = getTimeRangeBasedOnGranularity(
        !nextStepToMatch ? curDatapointTimestamp : nextStepToMatch,
        granularity,
        true
      );
    }

    if (grouppedResults[nextStepToMatch] == null) {
      grouppedResults[nextStepToMatch] = [];
    }
    grouppedResults[nextStepToMatch].push({
      timestamp: nextStepToMatch,
      value: datapoint.value,
    });
  }

  const results = Object.values(grouppedResults).reduce(
    (a: any, b: any) => a.concat(b.length ? b : []),
    []
  );

  return results;
}

function mapDatapoints(
  isString: boolean,
  datapoints: Datapoint[]
): Datapoint[] {
  return datapoints.map((dp) => {
    return isString
      ? {
          ...dp,
          value: null,
          stringValue: dp.value.toString(),
          __typename: 'DatapointString',
        }
      : { ...dp, __typename: 'DatapointFloat' };
  });
}

export const filterTimeseriesDatapoints = (
  externalId: string,
  db: CdfMockDatabase,
  isString: boolean,
  prms: { [key: string]: string | number }
): Datapoint[] | DatapointGroup[] => {
  let result: Datapoint[] | DatapointGroup[];
  let datapoints = findDatapoints(externalId, db);

  if (prms.start || prms.end) {
    const filters = {
      timestamp: {},
    };

    if (prms.start) {
      filters.timestamp['gte'] = prms.start;
    }
    if (prms.end) {
      filters.timestamp['lte'] = prms.end;
    }

    datapoints = filterCollection(datapoints, filters) as CdfResourceObject[];
  }

  datapoints = Collection.from(datapoints)
    .orderBy((x) => x.timestamp, 'ASC')
    .toArray();

  if (prms.granularity) {
    console.log('total', datapoints.length);
    result = groupTimesBy(
      datapoints,
      prms.granularity as string
    ) as DatapointGroup[];
  } else {
    result = datapoints as any;
  }

  if (!result) {
    return [];
  }

  if (prms.limit) {
    result = result.slice(0, +prms.limit);
  }

  return mapDatapoints(isString, result as unknown as Datapoint[]);
};

export function aggregateDatapoints(
  datapoints: Datapoint[],
  aggregateFn: (prev: Datapoint, cur: Datapoint) => Datapoint,
  postAggregateFn?: (
    aggregatedDatapoint: Datapoint,
    results: Datapoint[]
  ) => Datapoint
): Datapoint[] {
  const grouppedResults = Collection.from<Datapoint>(datapoints).groupBy(
    (x) => x.timestamp
  );

  const result = Object.keys(grouppedResults).map((timestamp) => {
    let aggregatedDatapoint = Collection.from<Datapoint>(
      grouppedResults[timestamp]
    ).aggregate((acc, item) => aggregateFn(acc, item), {
      timestamp: +timestamp,
      value: 0,
    });

    if (postAggregateFn) {
      aggregatedDatapoint = postAggregateFn(
        aggregatedDatapoint,
        grouppedResults[timestamp]
      );
    }
    return aggregatedDatapoint;
  });

  return result;
}
