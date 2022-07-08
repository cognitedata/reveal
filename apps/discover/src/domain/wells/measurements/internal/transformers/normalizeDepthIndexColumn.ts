import { toDistance } from 'utils/units/toDistance';

import { DepthIndexColumn } from '@cognite/sdk-wells';

import { DepthIndexColumnInternal } from '../types';

export const normalizeDepthIndexColumn = (
  rawDepthIndexColumn: DepthIndexColumn
): DepthIndexColumnInternal => {
  const { columnExternalId, unit, type } = rawDepthIndexColumn;

  return {
    externalId: columnExternalId,
    unit: toDistance(unit.unit),
    type,
  };
};
