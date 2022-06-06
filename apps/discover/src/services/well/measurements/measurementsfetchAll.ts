import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { WdlMeasurementType } from 'modules/wellSearch/types';

type ActionProps = Record<string, unknown>;

const SEQUENCES_PER_PAGE = 100;
const ROW_DATA_PER_PAGE = 10000;

export const fetchAllDepthMeasurements = async ({
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

export const fetchAllDepthMeasurementData = async ({
  sequenceExternalId,
  options,
}: {
  sequenceExternalId: string;
  options?: FetchOptions;
}) => {
  return fetchAllCursorsDepthMeasurementData({
    signal: options?.signal,
    action: getWellSDKClient().measurements.listData,
    actionProps: {
      sequenceExternalId,
      limit: ROW_DATA_PER_PAGE,
    },
  });
};

/**
 * This is due to the response of depth measurement data is unconventional hence generic fetchAllCursors
 * function cannot be used.
 */
export const fetchAllCursorsDepthMeasurementData = async ({
  action,
  actionProps,
  firstActionProps,
  signal,
}: {
  action: (props: ActionProps) => Promise<DepthMeasurementData>;
  actionProps: ActionProps;
  firstActionProps?: ActionProps;
  signal?: AbortSignal;
}) => {
  const depthMeasurementData = await action({
    ...actionProps,
    ...firstActionProps,
  });
  let { rows, nextCursor } = depthMeasurementData;
  const { id, source, depthColumn, depthUnit, columns } = depthMeasurementData;
  let shouldCancel = false;

  const markCancel = () => {
    shouldCancel = true;
  };

  signal?.addEventListener('abort', markCancel);

  while (nextCursor) {
    // this eslint rule is made because generally we should do things in parrallel
    // but this is a good exception case
    // as these are sequential cursors, so they are ok to block
    // eslint-disable-next-line no-await-in-loop
    const response = await action({
      ...actionProps,
      cursor: nextCursor,
    });
    nextCursor = response.nextCursor;
    rows = [...rows, ...response.rows];

    if (shouldCancel) {
      nextCursor = '';
      shouldCancel = false;
      signal?.removeEventListener('abort', markCancel);
    }
  }

  return {
    id,
    source,
    depthColumn,
    depthUnit,
    columns,
    rows,
  };
};
