import { Geometry } from '@turf/helpers';
import get from 'lodash/get';

import { WellFilter } from '@cognite/sdk-wells-v2';

import { getWellById, getWellItemssByFilter } from 'modules/wellSearch/sdk';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

export interface SpatialSearchItemResponse {
  assetIds: number[];
  name: string;
  attributes: {
    head: Geometry;
  };
}

export function getByFilters(wellFilter: WellFilter) {
  return getWellItemssByFilter(wellFilter).then((response) =>
    normalizeWells(get(response, 'items', []))
  );
}

export function getWellByWellId(wellId: number) {
  return getWellById(wellId);
}

export function getWellByWellIds(wellIds: number[]) {
  return Promise.all(wellIds.map((wellId) => getWellByWellId(wellId))).then(
    normalizeWells
  );
}
