import { CogniteClient, CogniteExternalId, SequenceFilter } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

type SequenceFilteredClient = {
  client: CogniteClient;
  createdTime: number;
} & SequenceFilter;

interface Sensor {
  externalId: CogniteExternalId;
  sensorName: string;
}

const getSensorName = (
  externalId: CogniteExternalId,
  sensorsArray: Sensor[]
) => {
  const matchedSensor = sensorsArray.find(
    (sensor) => sensor.externalId === externalId
  );
  if (!matchedSensor) {
    throw new Error('No sensor matching external id of datapoint');
  }
  return matchedSensor.sensorName;
};

export const fetchBoundaryConditions = createAsyncThunk(
  'boundaryCondition/fetchBoundaryConditions',
  async ({ client, filter, createdTime }: SequenceFilteredClient) => {
    const { items } = await client.sequences.list({
      filter,
    });

    const itemId = items ? items[0]?.externalId : undefined;

    if (!itemId) {
      throw new Error('No item id found');
    }

    const timeSeriesIds = (
      await client.sequences.retrieveRows({
        externalId: itemId,
      })
    ).items.map(([, externalId]) => {
      if (externalId === null) {
        throw new Error('No sequence row data');
      }
      return {
        externalId: externalId.toString(),
      };
    });

    const sensors: Sensor[] = (
      await client.timeseries.retrieve(timeSeriesIds)
    ).map(({ metadata, externalId }) => {
      if (metadata === undefined || externalId === undefined) {
        throw new Error('No timeseries data');
      }
      return {
        externalId,
        sensorName: metadata.variableName,
      };
    });

    return (
      await client.datapoints.retrieve({
        items: timeSeriesIds,
        start: createdTime,
        end: createdTime && createdTime + 1,
        ignoreUnknownIds: true,
      })
    ).map(({ externalId, unit, datapoints }) => {
      if (!externalId || !unit) {
        throw new Error('No Datapoint information');
      }
      return {
        unit,
        value: 'value' in datapoints[0] ? datapoints[0].value : 'N/A',
        label: getSensorName(externalId, sensors),
      };
    });
  }
);
