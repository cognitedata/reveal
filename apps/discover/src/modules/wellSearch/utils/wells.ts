import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import keyBy from 'lodash/keyBy';

import { Well as SDKWell } from '@cognite/sdk-wells-v2';

import { TableResults } from 'components/tablev3';

import { Well, Wellbore, WellId, WellMap } from '../types';
import { normalizeCoords } from '../utils';

export const normalizeWell = (well: SDKWell): Well => {
  return {
    ...well,
    ...(well.wellhead
      ? normalizeCoords(well.wellhead.x, well.wellhead.y, well.wellhead.crs)
      : {}),
    name: well.externalId
      ? `${well.description || well.name} (${well.externalId})`
      : well.name,
    /**
     * @sdk-wells-v3
     * If using the Wells SDK V3, set the wellbores included in the wells list response data.
     * Otherwise set to `undefined` since `_wellbores` is not included in the well data object.
     */
    wellbores: get(well, '_wellbores'),
  };
};

export const normalizeWells = (wells: SDKWell[]) => {
  return wells.map(normalizeWell);
};

export const getFilteredWellbores = (
  wellbores: Wellbore[] | undefined,
  wellboreId: string | undefined
): Wellbore[] => {
  return (
    wellbores?.filter((wellbore) => isEqual(wellbore.id, wellboreId)) || []
  );
};

export const getIndeterminateWells = (
  wells: Well[],
  selectedWellboreIds: TableResults
) => {
  return wells.reduce<TableResults>((intermediateWells, well) => {
    if (!well.wellbores) return intermediateWells;

    const selectedWellboresCount = well.wellbores.filter(
      (wellbore) => selectedWellboreIds[wellbore.id]
    ).length;
    if (
      selectedWellboresCount > 0 &&
      selectedWellboresCount !== well.wellbores.length
    ) {
      return { ...intermediateWells, [well.id]: true };
    }
    return intermediateWells;
  }, {});
};

export const getWellsOfWellIds = (wells: Well[], wellIds: WellId[]): Well[] => {
  const wellsById = keyBy<WellMap>(wells, 'id');

  return wellIds.reduce<Well[]>((wells, wellId) => {
    const well = wellsById[wellId];
    if (isUndefined(well)) return wells;
    return [...wells, well];
  }, []);
};
