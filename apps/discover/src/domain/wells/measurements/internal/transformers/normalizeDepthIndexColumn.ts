import { Distance } from 'convert-units';

import { DepthIndexColumn } from '@cognite/sdk-wells';

import { DepthIndexColumnInternal } from '../types';

export const normalizeDepthIndexColumn = (
  rawDepthIndexColumn: DepthIndexColumn,
  depthUnit: Distance
): DepthIndexColumnInternal => {
  const { columnExternalId, type } = rawDepthIndexColumn;

  return {
    externalId: columnExternalId,
    /**
     * DepthIndexColumn['depthColumn'] is an ingested value.
     * Hence, DepthIndexColumn['depthColumn']['unit'] is not guaranteed to be correct.
     * So, we need to put the correct depth unit here.
     */
    unit: depthUnit,
    type,
  };
};
