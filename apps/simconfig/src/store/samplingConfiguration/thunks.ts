import { CogniteClient } from '@cognite/sdk';
import moment from 'moment';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { EventSerializable } from 'store/event/types';
import { CalculationConfig } from 'components/forms/ConfigurationForm/types';
import sidecar from 'utils/sidecar';
import {
  generateOutputTimeSeriesExternalId,
  generateInputTimeSeriesExternalId,
} from 'utils/externalIdGenerators';

type Sampling = {
  client: CogniteClient;
  simCalcId: string;
};

type ChartIO = {
  currentEvent: EventSerializable;
  calculationConfig: CalculationConfig;
  projectName?: string | undefined;
};

const generateChartLink = (
  timeSeriesExternalIds: string,
  chartName: string,
  projectName: string | undefined,
  calcTime: number | undefined
) => {
  if (!calcTime || !projectName) {
    return undefined;
  }

  const endTime = moment(calcTime).add(1, 'hours').valueOf();
  const startTime = moment(calcTime).subtract(1, 'hours').valueOf();

  const chartsUrl = new URL(
    `https://charts.${sidecar.cdfCluster}.cogniteapp.com/${projectName}`
  );
  const { searchParams } = chartsUrl;
  searchParams.set('timeserieExternalIds', timeSeriesExternalIds);
  searchParams.set('chartName', chartName);
  searchParams.set('startTime', startTime.toString());
  searchParams.set('endTime', endTime.toString());
  searchParams.sort();

  return chartsUrl.toString();
};

export const fetchChartsInputLink = createAsyncThunk(
  'samplingConfiguration/fetchChartsInputLink',
  ({ currentEvent, calculationConfig, projectName }: ChartIO) => {
    if (
      !currentEvent ||
      !calculationConfig ||
      !currentEvent.metadata?.calcTime
    ) {
      return undefined;
    }

    const { simulator, calculationType, modelName, inputTimeSeries } =
      calculationConfig;

    const inputTimeSeriesExternalId = inputTimeSeries.map((timeSerie) =>
      generateInputTimeSeriesExternalId({
        simulator,
        timeSeriesType: timeSerie.type,
        calculationType,
        modelName,
      })
    );

    const chartLinkInputs = inputTimeSeriesExternalId.join(',');
    const calcTime = Number(currentEvent.metadata.calcTime);

    return generateChartLink(
      chartLinkInputs,
      `${modelName} Input TimeSeries`,
      projectName,
      calcTime
    );
  }
);

export const fetchChartsOutputLink = createAsyncThunk(
  'samplingConfiguration/fetchChartsOutputLink',
  ({ currentEvent, calculationConfig, projectName }: ChartIO) => {
    if (
      !currentEvent ||
      !calculationConfig ||
      !currentEvent.metadata?.calcTime
    ) {
      return undefined;
    }

    const { simulator, calculationType, modelName, outputTimeSeries } =
      calculationConfig;

    const outputTimeSeriesExternalId = outputTimeSeries.map((timeSerie) =>
      generateOutputTimeSeriesExternalId({
        simulator,
        timeSeriesType: timeSerie.type,
        calculationType,
        modelName,
      })
    );

    const calcTime = Number(currentEvent.metadata.calcTime);

    const chartLinkOutputs = outputTimeSeriesExternalId.join(',');
    return generateChartLink(
      chartLinkOutputs,
      `${modelName} Output TimeSeries`,
      projectName,
      calcTime
    );
  }
);

export const fetchSamplingConfiguration = createAsyncThunk(
  'samplingConfiguration/fetchSamplingConfiguration',
  async ({ client, simCalcId }: Sampling) => {
    const { items } = await client.sequences.list({
      filter: {
        metadata: {
          dataType: 'Sampling Configuration',
          simCalcId,
        },
      },
    });

    const samplingConfiguration = items.find(
      (sq) => sq.metadata?.simCalcId === simCalcId
    );

    const response = await client.sequences.retrieveRows({
      externalId: samplingConfiguration?.externalId || '',
    });

    return response.items.map(
      ([
        samplingStart,
        samplingEnd,
        ssdExternalId,
        logicalCheckExternalId,
        validationStart,
        validationEnd,
      ]) => ({
        samplingStart: Number(samplingStart),
        samplingEnd: Number(samplingEnd),
        ssdExternalId: String(ssdExternalId),
        logicalCheckExternalId: String(logicalCheckExternalId),
        validationStart: Number(validationStart),
        validationEnd: Number(validationEnd),
      })
    )[0];
  }
);
