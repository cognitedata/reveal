import React, { useContext, useEffect, useState } from 'react';
import { Button, Overline } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { DatapointAggregates, Datapoints } from '@cognite/sdk';
import {
  CreatedAndUpdatedTime,
  FileInfo,
} from 'components/forms/ModelForm/types';
import { BcContainer, BcLabel } from 'components/tables/ModelTable/elements';

import { SequenceDataType } from './constants';
import { BodyWithSpacing, TitleWithSpacing } from './elements';

interface Props {
  onClosePanel: () => void;
  data: (FileInfo & CreatedAndUpdatedTime) | undefined;
}

interface SensorNamePair {
  externalId: string;
  sensorName: string;
}

interface DisplayValue {
  value: string | number;
  label: string;
  unit: string;
}

export const BoundaryConditionContent: React.FC<Props> = ({
  data,
  onClosePanel,
}) => {
  const cdfClient = useContext(CdfClientContext);
  const [displayValues, setDisplayValues] = useState<DisplayValue[]>([]);

  const getDataPointValue = (datapoint: Datapoints | DatapointAggregates) => {
    if ('value' in datapoint.datapoints[0]) {
      return datapoint.datapoints[0].value;
    }
    return 'N/A';
  };
  const getSensorName = (
    externalId: string,
    sensorsArray: SensorNamePair[]
  ) => {
    const matchedSensor = sensorsArray.find(
      (sensor) => sensor.externalId === externalId
    );
    if (!matchedSensor) {
      throw new Error('No sensor matching external id of datapoint');
    }
    return matchedSensor.sensorName;
  };

  const fetchBoundaryConditions = async () => {
    if (!data) {
      return;
    }
    const { items } = await cdfClient.sequences.list({
      filter: {
        metadata: {
          dataType: SequenceDataType.BCTimeSeriesMap,
          modelName: data.name,
        },
      },
    });

    if (!items || !items[0] || !items[0].externalId) {
      return;
    }
    const sequenceRows = await cdfClient.sequences.retrieveRows({
      externalId: items[0].externalId,
    });

    const timeSeriesIds = sequenceRows.items.map((row) => {
      if (row[1] === null) {
        throw new Error('No sequence row data');
      }
      return {
        externalId: row[1].toString(),
      };
    });

    const timeSeriesFull = await cdfClient.timeseries.retrieve(timeSeriesIds);

    const sensors: SensorNamePair[] = timeSeriesFull.map((timeseries) => {
      if (
        timeseries.metadata === undefined ||
        timeseries.externalId === undefined
      ) {
        throw new Error('No timeseries data');
      }
      return {
        sensorName: timeseries.metadata.variableName,
        externalId: timeseries.externalId,
      };
    });
    const dataPoints = await cdfClient.datapoints.retrieve({
      items: timeSeriesIds,
      start: data.createdTime.getTime(),
      end: data.createdTime.getTime() + 1,
      ignoreUnknownIds: true,
    });

    const displayValues: DisplayValue[] = dataPoints.map((datapoint) => {
      if (!datapoint.externalId || !datapoint.unit) {
        throw new Error('No Datapoint information');
      }
      return {
        value: getDataPointValue(datapoint),
        label: getSensorName(datapoint.externalId, sensors),
        unit: datapoint.unit,
      };
    });

    setDisplayValues(displayValues);
  };

  useEffect(() => {
    fetchBoundaryConditions();
  }, [data]);

  return (
    <BcContainer>
      <Button icon="Close" type="ghost" onClick={onClosePanel} />
      <TitleWithSpacing level={2}>{data?.name}</TitleWithSpacing>

      <BodyWithSpacing>
        <BcLabel>Version:</BcLabel>
        {data?.metadata.version}
      </BodyWithSpacing>
      <BodyWithSpacing>
        <BcLabel>Description:</BcLabel>
        {data?.metadata.description}
      </BodyWithSpacing>
      <BodyWithSpacing>
        <BcLabel>User:</BcLabel>
      </BodyWithSpacing>
      <Overline>BOUNDARY CONDITIONS</Overline>
      <BodyWithSpacing level={3}>
        {displayValues.map((bc) => (
          <div key={bc.label}>
            <BcLabel>{bc.label}:</BcLabel>
            {bc.value} {bc.unit}
          </div>
        ))}
      </BodyWithSpacing>
    </BcContainer>
  );
};
