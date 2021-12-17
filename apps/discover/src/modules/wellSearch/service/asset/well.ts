import get from 'lodash/get';

import {
  getAllWellItemsByFilter,
  getWellById,
  getWellItemsByFilter,
} from 'modules/wellSearch/sdk';
import { CommonWellFilter } from 'modules/wellSearch/types';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

export function getByFilters(wellFilter: CommonWellFilter) {
  return getWellItemsByFilter(wellFilter).then((response) =>
    normalizeWells(get(response, 'items', []))
  );
}

export function getAllByFilters(wellFilter: CommonWellFilter) {
  return getAllWellItemsByFilter(wellFilter);
}

export function getWellByWellId(wellId: number) {
  return getWellById(wellId);
}

export function getWellByWellIds(wellIds: number[]) {
  return Promise.all(wellIds.map((wellId) => getWellByWellId(wellId))).then(
    normalizeWells
  );
}
