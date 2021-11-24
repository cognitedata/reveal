import { CogniteClient, CogniteExternalId, SequenceFilter } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  MISC_UNITS,
  UNIT_TYPE,
} from 'components/forms/ConfigurationForm/constants';
import moment from 'moment';
import { formatBcValue } from 'utils/numberUtils';
import sidecar from 'utils/sidecar';

type SequenceFilteredClient = {
  client: CogniteClient;
  createdTime: number;
  modelName?: string;
  projectName?: string | undefined;
} & SequenceFilter;

interface Sensor {
  externalId: CogniteExternalId;
  sensorName: string;
}

const DISPLAY_UNIT_MAP = Object.values(UNIT_TYPE)
  .concat(MISC_UNITS)
  .reduce((units, unitTypeUnits) => ({ ...units, ...unitTypeUnits }), {});

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

const getBoundaryConditionSequenceExternalId = async (
  client: CogniteClient,
  filter: SequenceFilter['filter']
) => {
  try {
    const {
      items: [{ externalId }],
    } = await client.sequences.list({
      filter,
    });
    if (!externalId) {
      throw new Error('External ID not found');
    }
    return externalId;
  } catch (e) {
    throw new Error(`Error while reading boundary condition sequence: ${e}`);
  }
};

export const fetchBoundaryConditions = createAsyncThunk(
  'boundaryCondition/fetchBoundaryConditions',
  async ({ client, filter, createdTime }: SequenceFilteredClient) => {
    const externalId = await getBoundaryConditionSequenceExternalId(
      client,
      filter
    );

    const timeSeriesExternalIds = (
      await client.sequences.retrieveRows({
        externalId,
      })
    ).items.map(([, timeSeriesExternalId]) => {
      if (timeSeriesExternalId === null) {
        throw new Error('No sequence row data');
      }
      return {
        externalId: timeSeriesExternalId.toString(),
      };
    });

    const sensors: Sensor[] = (
      await client.timeseries.retrieve(timeSeriesExternalIds)
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
        items: timeSeriesExternalIds,
        start: createdTime,
        end: createdTime && createdTime + 1,
        ignoreUnknownIds: true,
      })
    ).map(({ externalId, unit, datapoints }) => {
      if (!externalId) {
        throw new Error('No Datapoint information');
      }

      const getBoundaryConditionValue = () => {
        if (
          !('value' in datapoints[0] && typeof datapoints[0].value === 'number')
        ) {
          return {
            rawValue: undefined,
            value: undefined,
          };
        }
        return {
          rawValue: datapoints[0].value,
          value: formatBcValue(datapoints[0].value),
        };
      };

      const displayUnit = (unit && DISPLAY_UNIT_MAP[unit]) ?? unit ?? '';

      return {
        unit,
        displayUnit,
        ...getBoundaryConditionValue(),
        label: getSensorName(externalId, sensors),
      };
    });
  }
);

export const fetchBoundaryConditionChartsLink = createAsyncThunk(
  'boundaryCondition/fetchBoundaryConditionChartsLink',
  async ({
    client,
    filter,
    projectName,
    modelName,
    createdTime,
  }: SequenceFilteredClient) => {
    if (!projectName) {
      throw new Error('Project name not set');
    }

    const externalId = await getBoundaryConditionSequenceExternalId(
      client,
      filter
    );

    const endTime = moment(createdTime).add(1, 'days').valueOf();
    const startTime = moment(createdTime).subtract(1, 'days').valueOf();

    const timeSeriesExternalIds = (
      await client.sequences.retrieveRows({
        externalId,
      })
    ).items
      .map(([, timeSeriesExternalId]) => {
        if (timeSeriesExternalId === null) {
          throw new Error('No sequence row data');
        }
        return timeSeriesExternalId.toString();
      })
      .join(',');

    const chartsUrl = new URL(
      `https://charts.${sidecar.cdfCluster}.cogniteapp.com/${projectName}`
    );
    const { searchParams } = chartsUrl;
    searchParams.set('timeserieExternalIds', timeSeriesExternalIds);
    searchParams.set('startTime', startTime.toString());
    searchParams.set('endTime', endTime.toString());
    searchParams.set('chartName', `${modelName} Boundary Conditions`);
    searchParams.sort();

    return chartsUrl.toString();
  }
);
