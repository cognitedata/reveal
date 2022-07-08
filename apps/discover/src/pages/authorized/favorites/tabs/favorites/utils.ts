import { WellInternal } from 'domain/wells/well/internal/types';

import isEmpty from 'lodash/isEmpty';

import { FavoriteContentWells } from 'modules/favorite/types';

export const filterWellboresFromWellsData = (
  wells: WellInternal[],
  favoriteWellsWithWellboreIds: FavoriteContentWells
) => {
  return wells.map((well) => ({
    ...well,
    wellbores: well?.wellbores?.filter((wellbore) =>
      isEmpty(favoriteWellsWithWellboreIds[well.id])
        ? true
        : favoriteWellsWithWellboreIds[well.id].includes(wellbore.id)
    ),
  }));
};

export const setSelectedWellboreIdsToWell = (
  currentSelection: FavoriteContentWells,
  wellId: string,
  wellboreId: string
) => {
  const selectedWellboreIds = currentSelection[wellId] || [];
  const isSelected = selectedWellboreIds.includes(wellboreId);

  return {
    ...currentSelection,
    [wellId]: isSelected
      ? selectedWellboreIds.filter((wbId) => wbId !== wellboreId)
      : [...selectedWellboreIds, wellboreId],
  };
};

export const getSelectedWellIds = (
  wells: WellInternal[],
  currentSelection: FavoriteContentWells
) => {
  const wellIds = Object.keys(currentSelection);

  return wellIds.reduce((previousValue, currentValue) => {
    const well = wells.find((w) => w.id === currentValue);
    if (well) {
      return {
        ...previousValue,
        [currentValue]: well?.wellbores?.some((wellbore) =>
          currentSelection[currentValue]?.includes(wellbore.id)
        ),
      };
    }

    return previousValue;
  }, {});
};

export const getIndeterminateWellIds = (
  wells: WellInternal[],
  currentSelection: FavoriteContentWells
) => {
  const wellIds = Object.keys(currentSelection);

  return wellIds.reduce((previousValue, currentValue) => {
    const well = wells.find((w) => w.id === currentValue);
    if (well) {
      return {
        ...previousValue,
        [currentValue]:
          well?.wellbores?.some((wellbore) =>
            currentSelection[currentValue]?.includes(wellbore.id)
          ) &&
          !well?.wellbores?.every((wellbore) =>
            currentSelection[currentValue]?.includes(wellbore.id)
          ),
      };
    }

    return previousValue;
  }, {});
};

export const getUpdatedWellsAndWellboresAfterRemove = (
  wells: WellInternal[],
  favoriteWells: FavoriteContentWells,
  selectedWellsAndWellboreIds: FavoriteContentWells
) => {
  return wells.reduce((previousValue, currentValue) => {
    if (isEmpty(selectedWellsAndWellboreIds[currentValue.id])) {
      return {
        ...previousValue,
        [currentValue.id]: favoriteWells[currentValue.id],
      };
    }

    const wellboreIdsForUpdate = (
      currentValue?.wellbores?.flatMap((wellbore) => wellbore.id) || []
    ).filter(
      (wellboreId) =>
        !selectedWellsAndWellboreIds[currentValue.id]?.includes(wellboreId)
    );

    if (!isEmpty(wellboreIdsForUpdate)) {
      return { ...previousValue, [currentValue.id]: wellboreIdsForUpdate };
    }

    return previousValue;
  }, {} as FavoriteContentWells);
};
