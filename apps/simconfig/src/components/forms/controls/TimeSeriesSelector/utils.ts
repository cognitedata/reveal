import { sub } from 'date-fns';

import type { OptionType } from '@cognite/cogs.js';
import type { CogniteClient, TimeseriesFilter } from '@cognite/sdk';

import type { TimeseriesOption } from './types';

export async function getTimeseriesOptionByExternalId(
  client: CogniteClient,
  externalId: string
): Promise<OptionType<string> | undefined> {
  try {
    const [timeseries] = await client.timeseries.retrieve([{ externalId }]);
    return {
      value: timeseries.externalId,
      label: timeseries.name ?? externalId,
    };
  } finally {
    // CDF returned no valid results
  }
}

export async function timeseriesSearch({
  query,
  client,
  itemLimit = 30,
  filter = { isString: false },
  window = 1440,
  endOffset = 0,
  datapointLimit = 25,
}: {
  query: string;
  client: CogniteClient;
  itemLimit?: number;
  filter?: TimeseriesFilter;
  window?: number;
  endOffset?: number;
  datapointLimit?: number;
}): Promise<TimeseriesOption[]> {
  if (!query) {
    return [];
  }

  const timeseriesList = await client.timeseries.search({
    search: {
      query,
    },
    filter,
    limit: itemLimit,
  });

  if (!timeseriesList.length) {
    return [];
  }

  const externalIds = timeseriesList.map(({ externalId }) => ({
    externalId: externalId ?? '',
  }));

  const datapointList = (
    await client.datapoints.retrieve({
      aggregates: ['min', 'max', 'average'],
      start: window
        ? sub(new Date(), { minutes: window + endOffset }).getTime()
        : undefined,
      end: sub(new Date(), { minutes: endOffset }),
      granularity: window ? `${Math.floor(window / datapointLimit)}m` : '1d',
      limit: datapointLimit,
      items: externalIds,
    })
  ).map(({ datapoints, externalId, unit }) => ({
    datapoints,
    unit,
    externalId,
  }));

  return timeseriesList.map((timeseries) => ({
    label: timeseries.name ?? '',
    value: timeseries.externalId ?? '',
    data: {
      timeseries,
      ...datapointList.find(
        (datapoint) => datapoint.externalId === timeseries.externalId
      ),
    },
  }));
}
