import flatten from 'lodash/flatten';
import get from 'lodash/get';
import head from 'lodash/head';
import isEqual from 'lodash/isEqual';
import { createSelector } from 'reselect';

import { StoreState } from 'core/types';
import {
  InspectWellboreContext,
  WellboreAssetIdMap,
  Well,
  Wellbore,
} from 'modules/wellSearch/types';
import { getFilteredWellbores } from 'modules/wellSearch/utils/wells';

export const selectedWellboresSelector = createSelector(
  (state: StoreState) => state.wellSearch.wells,
  (state) => state.wellSearch.selectedWellIds,
  (state) => state.wellSearch.selectedWellboreIds,
  (state: StoreState, filterByIds: number[] | undefined) => filterByIds,
  (wells, selectedWellIds, selectedWellboreIds, filterByIds) => {
    const wellbores = flatten(
      wells
        .filter((well) => selectedWellIds[well.id])
        .map((well) =>
          well.wellbores
            ? well.wellbores.filter(
                (wellbore) => selectedWellboreIds[wellbore.id]
              )
            : []
        )
    );
    if (filterByIds) {
      return wellbores.filter((row) => filterByIds.includes(row.id));
    }
    return wellbores;
  }
);

export const wellboreDataSelector = createSelector(
  (state: StoreState) => state.wellSearch.wellboreData,
  (wellboreData) => wellboreData
);

export const wellboresFetchedWellIdsSelector = createSelector(
  (state: StoreState) => state.wellSearch.wellboresFetchedWellIds,
  (wellboresFetchedWellIds) => wellboresFetchedWellIds
);

export const wellboreAssetIdMapSelector = createSelector(
  (state: StoreState) => state.wellSearch.wells,
  (state: StoreState) => state.wellSearch.inspectWellboreContext,
  (state: StoreState) => state.wellSearch.hoveredWellboreIds,
  (
    state: StoreState,
    wellCardWellbores: Wellbore[],
    favoriteWellData: Well[]
  ) => ({ wellCardWellbores, favoriteWellData }),
  (
    wells,
    inspectContext,
    hoveredWellboreIds,
    { wellCardWellbores, favoriteWellData }
  ) => {
    if (InspectWellboreContext.WELL_CARD_WELLBORES === inspectContext) {
      return wellCardWellbores.reduce((idMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sourceWellbores[0].id',
          wellbore.id
        );
        return {
          ...idMap,
          [wellbore.id]: wellboreAssetId,
        };
      }, {} as WellboreAssetIdMap);
    }
    if (inspectContext === InspectWellboreContext.FAVORITE_HOVERED_WELL) {
      const firstWell = head(favoriteWellData);

      const resultedWellbores = firstWell?.wellbores || [];
      return resultedWellbores.reduce((idMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sourceWellbores[0].id',
          wellbore.id
        );
        return {
          ...idMap,
          [wellbore.id]: wellboreAssetId,
        };
      }, {} as WellboreAssetIdMap);
    }

    if (
      isEqual(inspectContext, InspectWellboreContext.FAVORITE_HOVERED_WELLBORE)
    ) {
      const firstWell = head(favoriteWellData);

      if (!firstWell) return [];
      const resultedWellbores = getFilteredWellbores(
        firstWell.wellbores,
        head(Object.keys(hoveredWellboreIds))
      );

      return resultedWellbores.reduce((idMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sourceWellbores[0].id',
          wellbore.id
        );
        return {
          ...idMap,
          [wellbore.id]: wellboreAssetId,
        };
      }, {} as WellboreAssetIdMap);
    }

    if (inspectContext === InspectWellboreContext.FAVORITE_CHECKED_WELLS) {
      const resultedWellbores = flatten(
        favoriteWellData?.map((well) => (well.wellbores ? well.wellbores : []))
      );
      return resultedWellbores.reduce((idMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sourceWellbores[0].id',
          wellbore.id
        );
        return {
          ...idMap,
          [wellbore.id]: wellboreAssetId,
        };
      }, {} as WellboreAssetIdMap);
    }

    return flatten(
      wells.map((well) => (well.wellbores ? well.wellbores : []))
    ).reduce((idMap, wellbore) => {
      const wellboreAssetId = get(
        wellbore,
        'sourceWellbores[0].id',
        wellbore.id
      );
      return {
        ...idMap,
        [wellbore.id]: wellboreAssetId,
      };
    }, {} as WellboreAssetIdMap);
  }
);
