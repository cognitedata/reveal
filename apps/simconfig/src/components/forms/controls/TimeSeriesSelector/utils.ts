import type { CogniteClient, DoubleDatapoint } from '@cognite/sdk';

export async function getTimeSeriesOptionByExternalId(
  client: CogniteClient,
  externalId: string
) {
  const result = await client.timeseries.retrieve([{ externalId }]);
  const timeSeries = result[0];

  return {
    value: timeSeries.externalId,
    label: timeSeries.name ?? externalId,
  };
}

export async function searchForTimeSeriesOptions(
  searchTerm: string,
  client?: CogniteClient,
  itemLimit = 10
) {
  if (!client) {
    return [];
  }
  const items = await client.timeseries.search({
    search: {
      query: searchTerm,
    },
    limit: itemLimit,
  });

  if (!items.length) {
    return [];
  }
  const datapointFilter = items.map(({ externalId }) => ({
    externalId: externalId ?? '',
    before: new Date(),
  }));

  // TODO(SIM-318) datapoint is sent as part of the option data for implementation in v2
  const dataPoints = await client.datapoints.retrieveLatest(datapointFilter);

  const mappedDatapoints = dataPoints.map(
    ({ datapoints, externalId, unit }) => ({
      datapoint: (datapoints as DoubleDatapoint[])[0],
      unit,
      externalId,
    })
  );

  return items.map((item) => ({
    label: item.name ?? '',
    value: item.externalId ?? '',
    data: {
      ...item,
      ...mappedDatapoints.find((data) => data.externalId === item.externalId),
    },
  }));
}
