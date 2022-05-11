import { normalize } from 'dataLayers/wells/wells/adapters/normalize';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import set from 'lodash/set';
import { getWellsByMatchingIds } from 'services/wellSearch/sdk/getWellsByMatchingIds';
import { FetchOptions } from 'utils/fetchAllCursors';

import { getAllWellItemsByFilter } from 'modules/wellSearch/sdk';
import { CommonWellFilter, Well, WellId } from 'modules/wellSearch/types';

import { getGroupedWellboresByWellIds } from './wellbore';

export function getAllByFilters(
  wellFilter: CommonWellFilter,
  options?: FetchOptions
) {
  return getAllWellItemsByFilter(wellFilter, options);
}

export function getWellsByWellIdsv3(wellIds: WellId[]) {
  return getWellsByMatchingIds(wellIds).then((wells) => wells.map(normalize));
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
