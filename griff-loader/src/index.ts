import { Map } from 'immutable';
import { CogniteClient, DatapointsMultiQueryBase } from '@cognite/sdk';
import { TimeSeries } from '@cognite/sdk/dist/src/resources/classes/timeSeries';

import {
  Datapoint,
  AggregateDatapoint,
  DoubleDatapoint,
  StringDatapoint,
  SDKDatapoint,
  Options,
} from './types';
import { Console } from 'console';

let cogniteClient: CogniteClient | undefined = undefined;

function getSdk(): CogniteClient {
  if (!cogniteClient) {
    throw new Error(
      'CogniteClient has no been configured. You can configure it using setClient(client)'
    );
  }
  return cogniteClient;
}

function isAggregateDatapoint(
  datapoint: Datapoint
): datapoint is AggregateDatapoint {
  const valueDatapoint = datapoint as DoubleDatapoint | StringDatapoint;
  return valueDatapoint.value === undefined;
}

type GriffSeries = {
  firstSeries: Datapoint[];
  subDomain: number[];
  granularity: string;
};

let SERIES_GETTERS = Map<TimeseriesId, GriffSeries>();

export type TimeseriesId = number | string;

export declare type AccessorFunc = (point: Datapoint) => number;

const timeseries = {
  results: Map<TimeseriesId, Promise<TimeSeries>>(),
  requests: Map<TimeseriesId, Promise<TimeSeries>>(),
};

export function setClient(client: CogniteClient) {
  cogniteClient = client;
}

export const getSubdomain = (id: string) =>
  id ? (SERIES_GETTERS.get(id) || { subDomain: [0, 1] }).subDomain : [0, 1];

export const getGranularity = (id: string) =>
  id ? (SERIES_GETTERS.get(id) || { granularity: '1d' }).granularity : '1d';

export const yAccessor = (datapoint: Datapoint): number => {
  if (isAggregateDatapoint(datapoint)) {
    if (datapoint.stepInterpolation !== undefined) {
      return datapoint.stepInterpolation;
    }
    if (datapoint.average !== undefined) {
      return datapoint.average;
    }
  } else {
    const dp: DoubleDatapoint | StringDatapoint = datapoint; // build fails without this for some reason... (VSCode doesnt complain though)
    if (dp.value !== undefined) {
      return Number(dp.value);
    }
  }

  // We can get here if we ask for a stepInterpolation
  // and there's no points in the range [0, t1]
  // where the domain asked for is [t0, t1]
  console.warn('No obvious y accessor for', datapoint);
  return 0;
};

export const y0Accessor = (data: Datapoint) =>
  // @ts-ignore - "min" is optional, but that's the point of this NaN check.
  isNaN(+data.min) ? yAccessor(data) : data.min;

export const y1Accessor = (data: Datapoint) =>
  // @ts-ignore - "min" is optional, but that's the point of this NaN check.
  isNaN(+data.max) ? yAccessor(data) : data.max;

const calculateGranularity = (domain: number[], pps: number) => {
  const diff = domain[1] - domain[0];
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}s`;
    }
  }
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}m`;
    }
  }
  for (let i = 1; i < 24; i += 1) {
    const points = diff / (1000 * 60 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}h`;
    }
  }
  for (let i = 1; i < 100; i += 1) {
    const points = diff / (1000 * 60 * 60 * 24 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}day`;
    }
  }
  return 'day';
};

const getTimeSeries = (id: TimeseriesId): Promise<TimeSeries> => {
  const inFlightEquest = timeseries.requests.get(id);
  if (inFlightEquest) {
    return inFlightEquest;
  }

  const cachedResponse = timeseries.results.get(id);
  if (cachedResponse) {
    return cachedResponse;
  }

  const promise = getSdk()
    .timeseries.retrieve([{ externalId: String(id) }])
    .then((resp) => {
      if (resp.length === 0) {
        throw new Error(`Could not find a timeseries with name ${id}`);
      }
      return resp[0];
    });

  timeseries.requests = timeseries.requests.set(id, promise);
  return promise.then((response) => {
    timeseries.results = timeseries.results.set(id, Promise.resolve(response));
    timeseries.requests = timeseries.requests.delete(id);
    return response;
  });
};

const getDataPoints = async ({
  id,
  step,
  start,
  end,
  limit,
  granularity,
}: {
  id: TimeseriesId;
  step?: boolean;
  start: number;
  end: number;
  limit?: number;
  granularity?: string;
}): Promise<Datapoint[]> => {
  const params: DatapointsMultiQueryBase = { start, end, limit };
  if (granularity) {
    params.granularity = granularity;
    params.aggregates = ['min', 'max', 'count'];

    if (step) {
      params.aggregates.push('stepInterpolation');
    } else {
      params.aggregates.push('average');
    }
  }

  const resp = await getSdk().datapoints.retrieve({
    items: [{ externalId: String(id) }],
    ...params,
  });

  const datapoints = resp[0].datapoints as SDKDatapoint[];
  return datapoints.map((dp) => ({ ...dp, timestamp: dp.timestamp.getTime() }));
};

export const mergeInsert = (
  base: Datapoint[],
  toInsert: Datapoint[],
  subDomain: number[],
  xAccessor: AccessorFunc = (d) => d.timestamp
) => {
  if (toInsert.length === 0) {
    return base;
  }
  // Remove the points from base within the subdomain
  const strippedBase: Datapoint[] = base.filter(
    (point) =>
      xAccessor(point) < subDomain[0] || xAccessor(point) > subDomain[1]
  );
  const finalResult = [...strippedBase, ...toInsert].sort(
    (a, b) => xAccessor(a) - xAccessor(b)
  );
  return finalResult;
};

const requestsInFlight: { [id: string]: boolean } = {};

const defaultOptions = {
  scaleYAxis: false,
};

const getYSubDomain = (ySubDomain: number[]) => {
  const diff = ySubDomain[1] - ySubDomain[0];
  if (Math.abs(diff) < 1e-3) {
    const domain = [(1 / 2) * ySubDomain[0], (3 / 2) * ySubDomain[0]];
    if (domain[1] < domain[0]) {
      return [domain[1], domain[0]];
    }
    return domain;
  }
  return [ySubDomain[0] - diff * 0.025, ySubDomain[1] + diff * 0.025];
};

export const createLoader = (opts: Options = {}) => async ({
  id,
  timeDomain,
  timeSubDomain,
  baseDomain: deprecatedBaseDomain,
  subDomain: deprecatedSubDomain,
  xDomain: deprecatedXDomain,
  xSubDomain: deprecatedXSubDomain,
  pointsPerSeries,
  oldSeries,
  reason,
}: // TODO: Pull this type definition from Griff
{
  id: TimeseriesId;
  timeDomain: number[];
  timeSubDomain: number[];
  baseDomain: number[];
  subDomain: number[];
  xDomain: number[];
  xSubDomain: number[];
  pointsPerSeries: number;
  oldSeries: any;
  reason: string;
}) => {
  const options = { ...defaultOptions, ...opts };
  const baseDomain = timeDomain || deprecatedXDomain || deprecatedBaseDomain;
  const subDomain =
    timeSubDomain || deprecatedXSubDomain || deprecatedSubDomain;
  const fetchDomain = (reason === 'MOUNTED' ? baseDomain : subDomain).map(
    Math.round
  );
  const granularity = calculateGranularity(fetchDomain, pointsPerSeries);

  if (reason === 'INTERVAL') {
    if (requestsInFlight[id]) {
      return { data: [], ...oldSeries };
    }
    requestsInFlight[id] = true;
    // Note: this pulls from the xDomain -- *not* the fetchDomain -- in
    // order to prevent the aggregate granularity from shifting while the data
    // is streaming in. If it was set to the fetchDomain, then it would change
    // constantly as the fetchDomain slides backwards.
    let startTime = baseDomain[0];
    const { xAccessor, data: oldData } = oldSeries;
    if (oldData && oldData.length > 0) {
      startTime = xAccessor(oldData[oldData.length - 1]) + 1;
    }
    const { step } = oldSeries;
    const requestPromise = getDataPoints({
      id,
      start: startTime,
      end: Date.now(),
      step,
      granularity: oldSeries.drawPoints ? '' : granularity,
    });
    const newDatapoints = await requestPromise;

    requestsInFlight[id] = false;
    if (oldData) {
      return { ...oldSeries, data: [...oldData, ...newDatapoints] };
    }
    return {
      ...oldSeries,
      data: newDatapoints,
    };
  }
  const seriesInfo = SERIES_GETTERS.get(id) || {
    firstSeries: [],
    subDomain,
    granularity,
  };
  if (fetchDomain[1] - fetchDomain[0] < 100) {
    // Zooming REALLY far in (1 ms end to end)
    return { data: [], ...oldSeries };
  }

  return getTimeSeries(id)
    .then((timeseries: TimeSeries) => {
      const { isStep: step } = timeseries;
      return (
        getDataPoints({
          id,
          granularity,
          start: fetchDomain[0],
          end: fetchDomain[1],
          limit: pointsPerSeries,
        })
          .then(async (points) => {
            const RAW_DATA_POINTS_THRESHOLD = pointsPerSeries / 2;
            const aggregatedCount = points.reduce(
              (point, c) =>
                point + (isAggregateDatapoint(c) ? c.count || 0 : 0),
              0
            );

            if (aggregatedCount < RAW_DATA_POINTS_THRESHOLD) {
              // If there are less than x points, show raw values
              const result = await getDataPoints({
                id,
                step,
                start: fetchDomain[0],
                end: fetchDomain[1],
                limit: pointsPerSeries,
              });

              let data = result;
              if (step && points.length) {
                // Use the last-known value from step-interpolation to create a fake point at the left-boundary
                if (data.length && points[0].timestamp < data[0].timestamp) {
                  data = [points[0], ...data];
                } else if (!data.length) {
                  data = [points[0]];
                }
              }
              return {
                data,
                drawPoints: true,
                step: !!step,
              };
            }
            return { data: points, drawPoints: false, step: !!step };
          })
          .then((newSeries) => {
            const { firstSeries } = seriesInfo;
            const { xAccessor } = oldSeries;
            if (reason === 'UPDATE_SUBDOMAIN') {
              SERIES_GETTERS = SERIES_GETTERS.update(id, (val) => ({
                ...val,
                subDomain,
                granularity,
              }));
              const data = mergeInsert(
                firstSeries,
                newSeries.data,
                subDomain,
                xAccessor
              );
              if (options.scaleYAxis) {
                // if multiple datapoints
                if (newSeries.data.length > 1) {
                  const newSeriesYSubDomain = newSeries.data.reduce(
                    (acc, dp) => {
                      const value = yAccessor(dp);
                      return [Math.min(acc[0], value), Math.max(acc[1], value)];
                    },
                    [Number.MAX_VALUE, Number.MIN_SAFE_INTEGER]
                  );
                  const ySubDomain = getYSubDomain(newSeriesYSubDomain);
                  // if all datapoints have the same y value
                  if (ySubDomain[0] === ySubDomain[1]) {
                    return {
                      ...newSeries,
                      data,
                      ySubDomain: [ySubDomain[0] - 0.25, ySubDomain[1] + 0.25],
                    };
                  }
                  // the datapoints have different y values
                  return {
                    ...newSeries,
                    data,
                    ySubDomain,
                  };
                  // if only one datapoint
                } else if (newSeries.data.length === 1) {
                  const datapoint = yAccessor(newSeries.data[0]);
                  return {
                    ...newSeries,
                    data,
                    ySubDomain: [datapoint - 0.25, datapoint + 0.25],
                  };
                  // if no datapoints, leave the ySubDomain the same as before
                } else {
                  return {
                    ...newSeries,
                    data,
                    ySubDomain: oldSeries.ySubDomain,
                  };
                }
              }
              return {
                ...newSeries,
                data,
              };
            }
            return newSeries;
          })
          .then((newSeries) => {
            if (reason === 'MOUNTED') {
              SERIES_GETTERS = SERIES_GETTERS.update(id, (val) => ({
                ...val,
                firstSeries: newSeries.data,
                subDomain,
                granularity,
              }));
            }
            return { ...newSeries, yAccessor };
          })
          // Do not crash the app in case of error, just return no data
          .catch(() => {
            return { data: [], step };
          })
      );
    })
    .catch(() => {
      // If the time series can't be loaded, just return no data.
      return { data: [], ...oldSeries };
    });
};

export const cogniteloader = createLoader();
