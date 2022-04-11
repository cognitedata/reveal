import groupBy from 'lodash/groupBy';
import noop from 'lodash/noop';
import set from 'lodash/set';
import {
  getDepthMeasurements,
  getDepthMeasurementData,
} from 'services/well/measurements/service';

import { ProjectConfigWells } from '@cognite/discover-api-types';

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

  // console.log('wellboreMatchingIds: ', wellboreMatchingIds);

  const depthMeasurementPromises = getDepthMeasurements(wellboreMatchingIds, [
    WdlMeasurementType.GEOMECHANNICS,
    WdlMeasurementType.PRESSURE,
    WdlMeasurementType.FIT,
    WdlMeasurementType.LOT,
  ]);

  const depthMeasurements = await depthMeasurementPromises;

  // console.log('depthmeasurements: ', depthMeasurements);

  const results = ([] as Measurement[]).concat(...depthMeasurements);

  /**
   * Fetch row data for previously fetched sequences
   */
  const promiseMeasurements: Promise<Measurement>[] = [];
  results.forEach((measurement) => {
    promiseMeasurements.push(
      getDepthMeasurementData(measurement.source.sequenceExternalId)
        .then((depthMeasurementData) => {
          // console.log('response: ', depthMeasurementData);
          return {
            ...measurement,
            data: depthMeasurementData,
          };
        })
        .catch((error) => {
          // console.log('error: ', error);
          const errorString = error.message as string;
          return {
            ...measurement,
            errors: [
              {
                value: `Error fetching row data of '${measurement.source.sequenceExternalId}': ${errorString}`,
              },
            ],
          };
        })
    );
  });

  const measurements = await Promise.all(promiseMeasurements);

  // console.log('measurements: ', measurements);

  const groupedData = groupBy(measurements, 'wellboreMatchingId');
  wellboreMatchingIds.forEach((wellboreId) => {
    if (!groupedData[wellboreId]) {
      set(groupedData, wellboreId, []);
    }
  });

  stopNetworkTimer({
    noOfWellbores: wellboreMatchingIds.length,
  });

  // console.log('grouped: ', groupedData);

  return groupedData;
};
