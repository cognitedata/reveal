import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { DepthMeasurement } from '@cognite/sdk-wells';

import { GetDepthMeasurementsProps } from '../types';

export const getDepthMeasurements = async ({
  wellboreIds,
  measurementTypes,
  options,
}: GetDepthMeasurementsProps) => {
  return fetchAllCursors<DepthMeasurement>({
    signal: options?.signal,
    action: getWellSDKClient().measurements.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
        measurementTypes,
      },
      limit: WDL_PAGINATION_LIMITS.LIST,
    },
  });
};
