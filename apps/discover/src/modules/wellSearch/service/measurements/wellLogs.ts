import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import flatten from 'lodash/flatten';
import {
  fetchAllCursors,
  fetchAllCursorsItem,
  FetchOptions,
} from 'utils/fetchAllCursors';

import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { WellboreId } from 'modules/wellSearch/types';

import { WELL_LOGS_MEASUREMENT_TYPES } from './constants';

const SEQUENCES_PER_PAGE = 1000;
const SEQUENCE_ROWS_PER_PAGE = 10000;

const MEASUREMENT_TYPES_FILTER = flatten(
  Object.values(WELL_LOGS_MEASUREMENT_TYPES)
);

export const fetchAllWellLogs = async ({
  wellboreIds,
  options,
}: {
  wellboreIds: Set<WellboreId>;
  options?: FetchOptions;
}) => {
  return fetchAllCursors<DepthMeasurement>({
    signal: options?.signal,
    action: getWellSDKClient().measurements.list,
    actionProps: {
      filter: {
        wellboreIds: Array.from(wellboreIds).map(toIdentifier),
        measurementTypes: MEASUREMENT_TYPES_FILTER,
      },
      limit: SEQUENCES_PER_PAGE,
    },
  });
};

export const fetchAllWellLogsRowData = async ({
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
