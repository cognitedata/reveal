import get from 'lodash/get';

import { WellFilter } from '@cognite/sdk-wells';

import { getWellSDKClient } from 'modules/wellSearch/sdk';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

export interface SpatialSearchItemResponse {
  assetIds: number[];
  name: string;
  attributes: {
    head: string;
  };
}

export function getByFilters(wellFilter: WellFilter) {
  return getWellSDKClient()
    .wells.filter(wellFilter)
    .then((response) => normalizeWells(get(response, 'items', [])));
}

export function getWellByWellId(wellId: number) {
  return getWellSDKClient().wells.getById(wellId);
}

export function getWellByWellIds(wellIds: number[]) {
  return Promise.all(wellIds.map((wellId) => getWellByWellId(wellId))).then(
    normalizeWells
  );
}
