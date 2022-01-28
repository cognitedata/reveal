import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import set from 'lodash/set';
import { FetchOptions } from 'utils/fetchAllCursors';

import {
  getAllWellItemsByFilter,
  getWellById,
  getWellItemsByFilter,
} from 'modules/wellSearch/sdk';
import { mapV3ToV2Well } from 'modules/wellSearch/sdk/utils';
import { getWellsByMatchingIds } from 'modules/wellSearch/sdk/v3';
import { CommonWellFilter, Well, WellId } from 'modules/wellSearch/types';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

import { getGroupedWellboresByWellIds } from './wellbore';

export function getByFilters(wellFilter: CommonWellFilter) {
  return getWellItemsByFilter(wellFilter).then((response) =>
    normalizeWells(get(response, 'items', []))
  );
}

export function getAllByFilters(
  wellFilter: CommonWellFilter,
  options?: FetchOptions
) {
  return getAllWellItemsByFilter(wellFilter, options);
}

export function getWellsByWellIds(wellIds: WellId[]) {
  return Promise.all(wellIds.map(getWellById)).then(normalizeWells);
}

export function getWellsByWellIdsv3(wellIds: WellId[]) {
  return getWellsByMatchingIds(wellIds).then((wells) =>
    normalizeWells(wells.map(mapV3ToV2Well))
  );
}

export async function getWellsWithWellbores(wells: Well[]) {
  const wellIds = map(wells, 'id');
  const wellsDictionary = keyBy(wells, 'id');
  const groupedWellbores = await getGroupedWellboresByWellIds(wellIds);

  Object.keys(wellsDictionary).forEach((wellId) => {
    set(wellsDictionary, wellId, {
      ...get(wellsDictionary, wellId),
      wellbores: get(groupedWellbores, wellId, []),
    });
  });

  return Object.values(wellsDictionary);
}
