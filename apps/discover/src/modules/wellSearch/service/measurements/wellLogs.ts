import {
  fetchAllCursors,
  fetchAllCursorsItem,
  FetchOptions,
} from 'utils/fetchAllCursors';

import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import { WellboreId } from 'modules/wellSearch/types';

const SEQUENCES_PER_PAGE = 100;
const SEQUENCE_ROWS_PER_PAGE = 100;

export const fetchAllSequences = async ({
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
      filter: { wellboreIds: Array.from(wellboreIds).map(toIdentifier) },
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
          limit: SEQUENCE_ROWS_PER_PAGE,
        },
        concatAccessor: 'rows',
      });
    })
  );
};
