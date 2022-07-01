import {
  MEASUREMENT_TYPES_FILTER,
  SEQUENCES_PER_PAGE,
} from 'domain/wells/measurements0/service/network/getMeasurementLogsData';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { DepthMeasurement } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { WellboreId } from 'modules/wellSearch/types';

export const getMeasurementLogs = async ({
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
