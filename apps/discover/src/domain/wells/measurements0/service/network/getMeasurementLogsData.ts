import { WELL_LOGS_MEASUREMENT_TYPES } from 'domain/wells/measurements/internal/constants';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import flatten from 'lodash/flatten';
import { fetchAllCursorsItem, FetchOptions } from 'utils/fetchAllCursors';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

export const SEQUENCES_PER_PAGE = 1000;
const SEQUENCE_ROWS_PER_PAGE = 10000;

export const MEASUREMENT_TYPES_FILTER = flatten(
  Object.values(WELL_LOGS_MEASUREMENT_TYPES)
);

export const getMeasurementLogsData = async ({
  sequenceExternalIds,
  options,
}: {
  sequenceExternalIds: Set<string>;
  options?: FetchOptions;
}) => {
  return Promise.all(
    Array.from(sequenceExternalIds).map((sequenceExternalId) => {
      return fetchAllCursorsItem<DepthMeasurementData>({
        signal: options?.signal,
        action: getWellSDKClient().measurements.listData,
        actionProps: {
          sequenceExternalId,
          measurementTypes: MEASUREMENT_TYPES_FILTER,
          limit: SEQUENCE_ROWS_PER_PAGE,
        },
        concatAccessor: 'rows',
      });
    })
  );
};
