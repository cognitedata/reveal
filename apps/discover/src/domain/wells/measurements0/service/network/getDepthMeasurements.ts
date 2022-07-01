import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { DepthMeasurement } from '@cognite/sdk-wells-v3';

import { WdlMeasurementType } from 'modules/wellSearch/types';

const SEQUENCES_PER_PAGE = 100;

export const getDepthMeasurements = async ({
  wellboreMatchingIds,
  measurementTypes,
  options,
}: {
  wellboreMatchingIds: string[];
  measurementTypes: WdlMeasurementType[];
  options?: FetchOptions;
}) => {
  return fetchAllCursors<DepthMeasurement>({
    signal: options?.signal,
    action: getWellSDKClient().measurements.list,
    actionProps: {
      filter: {
        measurementTypes,
        wellboreIds: Array.from(wellboreMatchingIds).map(
          toIdentifierWithMatchingId
        ),
      },
      limit: SEQUENCES_PER_PAGE,
    },
  });
};
