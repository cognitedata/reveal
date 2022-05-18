import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import keyBy from 'lodash/keyBy';
import { normalizeCoords } from 'services/wellSearch/utils/normalizeCoords';

import { TableResults } from 'components/Tablev3';

import { Well, Wellbore, WellId, WellMap } from '../types';

export const normalizeWell = (well: Well): Well => {
  return {
    ...well,
    ...(well.wellhead
      ? normalizeCoords(well.wellhead.x, well.wellhead.y, well.wellhead.crs)
      : {}),
    name: well.externalId
      ? `${well.description || well.name} (${well.externalId})`
      : well.name,
    wellbores: well.wellbores?.map((wellbore) =>
      normalizeWellbore(wellbore, well)
    ),
  };
};

// This should be moved to data layer (under wellbore)
export const normalizeWellbore = (wellbore: Wellbore, well: Well): Wellbore => {
  return {
    ...wellbore,
    name: wellbore.name || wellbore.description || '',
    wellName: well.name || well.description || '',
    wellId: well.id,
  };
};

export const normalizeWells = (wells: Well[]) => {
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
