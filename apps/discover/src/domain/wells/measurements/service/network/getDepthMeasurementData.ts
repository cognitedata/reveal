import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursorsItem } from 'utils/fetchAllCursors';

import { DepthMeasurementData } from '@cognite/sdk-wells';

import { GetDepthMeasurementDataProps } from '../types';

export const getDepthMeasurementData = async ({
  sequenceExternalId,
  measurementTypes,
  unit,
  options,
}: GetDepthMeasurementDataProps) => {
  return fetchAllCursorsItem<DepthMeasurementData>({
    signal: options?.signal,
    action: getWellSDKClient().measurements.listData,
    actionProps: {
      sequenceExternalId,
      measurementTypes,
      depthUnit: unit && { unit },
      limit: WDL_PAGINATION_LIMITS.LIST_DATA,
    },
    concatAccessor: 'rows',
  });
};
