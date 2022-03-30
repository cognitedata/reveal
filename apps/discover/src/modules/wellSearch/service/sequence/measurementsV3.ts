import groupBy from 'lodash/groupBy';
import noop from 'lodash/noop';
import set from 'lodash/set';
import {
  getDepthMeasurements,
  getDepthMeasurementData,
} from 'services/well/measurements/service';

import { ProjectConfigWells } from '@cognite/discover-api-types';
import { reportException } from '@cognite/react-errors';

import { MetricLogger } from 'hooks/useTimeLog';
import {
  MeasurementV3 as Measurement,
  WdlMeasurementType,
} from 'modules/wellSearch/types';

// refactor to use generic log fetcher.
export const getMeasurementsByWellboreIds = async (
  wellboreMatchingIds: string[],
  config?: ProjectConfigWells,
  metricLogger: MetricLogger = [noop, noop]
) => {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;

  if (!config?.measurements || !config?.measurements?.enabled) return {};

  startNetworkTimer();

  const depthMeasurementPromises = getDepthMeasurements(wellboreMatchingIds, [
    WdlMeasurementType.GEOMECHANNICS,
    WdlMeasurementType.PRESSURE,
    WdlMeasurementType.FIT,
    WdlMeasurementType.LOT,
  ]);

  const depthMeasurements = await depthMeasurementPromises;

  const results = ([] as Measurement[]).concat(...depthMeasurements);

  /**
   * Fetch row data for previously fetched sequences
   */
  const promiseMeasurements: Promise<Measurement>[] = [];
  results.forEach((measurement) => {
    promiseMeasurements.push(
      getDepthMeasurementData(measurement.source.sequenceExternalId).then(
        (depthMeasurementData) => {
          return {
            ...measurement,
            data: depthMeasurementData,
          };
        }
      )
    );
  });

  const promiseMeasurementSettledResults = await Promise.allSettled(
    promiseMeasurements
  );

  const measurements = promiseMeasurementSettledResults
    .map((promiseResult) => {
      if (promiseResult.status === 'rejected') {
        reportException(promiseResult.reason);
        console.error(
          'Error fetching sequence row data: ',
          promiseResult.reason
        );
      }
      return promiseResult;
    })
    .filter((promiseResult) => promiseResult.status === 'fulfilled')
    .map((result) => <PromiseFulfilledResult<Measurement>>result)
    .map((result) => result.value);

  const groupedData = groupBy(measurements, 'wellboreMatchingId');
  wellboreMatchingIds.forEach((wellboreId) => {
    if (!groupedData[wellboreId]) {
      set(groupedData, wellboreId, []);
    }
  });

  stopNetworkTimer({
    noOfWellbores: wellboreMatchingIds.length,
  });

  return groupedData;
};
