import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { FetchOptions } from 'utils/fetchAllCursors';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

type ActionProps = Record<string, unknown>;

const ROW_DATA_PER_PAGE = 10000;

export const getDepthMeasurementData = async ({
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
const fetchAllCursorsDepthMeasurementData = async ({
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
