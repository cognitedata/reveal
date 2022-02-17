import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import noop from 'lodash/noop';
import set from 'lodash/set';

import { ProjectConfigWells } from '@cognite/discover-api-types';
import { DepthMeasurementItems, DepthMeasurement } from '@cognite/sdk-wells-v3';

import { MetricLogger } from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import { MeasurementV3, WdlMeasurementType } from 'modules/wellSearch/types';

const CHUNK_LIMIT = 100;

// refactor to use generic log fetcher.
export const getMeasurementsByWellboreIds = async (
  wellboreMatchingIds: string[],
  config?: ProjectConfigWells,
  metricLogger: MetricLogger = [noop, noop]
) => {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;

  if (!config?.measurements || !config?.measurements?.enabled) return {};

  startNetworkTimer();

  const idChunkList = chunk(wellboreMatchingIds, CHUNK_LIMIT);

  /**
   * Fetch sequences for geomechanics, ppfg, lot and fit measurement types
   */
  const depthMeasurementPromises: Promise<DepthMeasurement[]>[] = [];
  idChunkList.forEach((idChunk) => {
    depthMeasurementPromises.push(
      getWellSDKClient()
        .measurements.list({
          filter: {
            measurementTypes: [
              WdlMeasurementType.GEOMECHANNICS,
              WdlMeasurementType.PRESSURE,
              WdlMeasurementType.FIT,
              WdlMeasurementType.LOT,
            ],
            wellboreIds: idChunk.map(toIdentifier),
          },
          limit: CHUNK_LIMIT,
        })
        .then(
          (depthMeasurementItem: DepthMeasurementItems) =>
            depthMeasurementItem.items
        )
    );
  });

  const promiseSettledResults = await Promise.allSettled(
    depthMeasurementPromises
  );

  /**
   * Ignore the failed results and move on with fullfilled ones
   */
  const depthMeasurements = promiseSettledResults
    .filter((promiseResult) => promiseResult.status === 'fulfilled')
    .map((result) => <PromiseFulfilledResult<DepthMeasurement[]>>result)
    .map((result) => result.value);

  const results = ([] as MeasurementV3[]).concat(...depthMeasurements);

  /**
   * Fetch row data for previously fetched sequences
   */
  const rowsPromises: Promise<void>[] = [];
  results.forEach((measurement) => {
    rowsPromises.push(
      getWellSDKClient()
        .measurements.listData({
          sequenceExternalId: measurement.source.sequenceExternalId,
        })
        .then((response) => {
          // eslint-disable-next-line no-param-reassign
          measurement.data = response;
        })
    );
  });

  await Promise.allSettled(rowsPromises);

  // console.log(results);

  const groupedData = groupBy(results, 'wellboreMatchingId');
  wellboreMatchingIds.forEach((wellboreId) => {
    if (!groupedData[wellboreId]) {
      set(groupedData, wellboreId, []);
    }
  });

  // console.log(groupedData);

  stopNetworkTimer({
    noOfWellbores: wellboreMatchingIds.length,
  });

  return groupedData;
};
