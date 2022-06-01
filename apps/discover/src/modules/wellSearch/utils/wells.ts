import { Well } from 'domain/wells/well/internal/types';

import isUndefined from 'lodash/isUndefined';
import keyBy from 'lodash/keyBy';

import { TableResults } from 'components/Tablev3';

import { WellId, WellMap } from '../types';

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
