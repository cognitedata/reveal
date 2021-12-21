import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import { createSelector } from 'reselect';

import { StoreState } from 'core/types';
import { ASSETS_GROUPED_PROPERTY } from 'modules/wellSearch/constants';
import {
  InspectWellboreContext,
  Well,
  Wellbore,
} from 'modules/wellSearch/types';
import { getFilteredWellbores } from 'modules/wellSearch/utils/wells';

export const groupedWellsSelector = createSelector(
  (state: StoreState) => state.wellSearch.wells,
  (wells) => groupBy(wells, ASSETS_GROUPED_PROPERTY)
);

export const selectedWellsSelector = createSelector(
  (state: StoreState) => state.wellSearch.wells,
  (state) => state.wellSearch.selectedWellIds,
  (state) => state.wellSearch.selectedWellboreIds,
  (wells, selectedWellIds, selectedWellboreIds) => {
    return wells
      .filter((well) => selectedWellIds[well.id])
      .map((well) => {
        const wellbores = well.wellbores
          ? well.wellbores.filter(
              (wellbore) => selectedWellboreIds[wellbore.id]
            )
          : [];
        return { ...well, ...{ wellbores } };
      });
  }
);

export const selectedWellIdsSelector = createSelector(
  (state: StoreState) => state.wellSearch.selectedWellIds,
  (_state: StoreState, enabledWellSDKV3: boolean) => enabledWellSDKV3,
  (selectedWellIds, enabledWellSDKV3) => {
    const selectedIds = Object.keys(pickBy(selectedWellIds));
    return enabledWellSDKV3
      ? (selectedIds as unknown as number[])
      : selectedIds.map(Number);
  }
);

// This returns indeterminate wells (Wells that some wellbores are selected but not all)
export const intermediateWellsSelector = createSelector(
  (state: StoreState) => state.wellSearch.wells,
  (state) => state.wellSearch.selectedWellboreIds,
  (wells, selectedWellboreIds) => {
    return wells.reduce((prev, cur) => {
      if (!cur.wellbores) {
        return prev;
      }
      const selectedWellboresCount = cur.wellbores.filter(
        (wellbore) => selectedWellboreIds[wellbore.id]
      ).length;
      if (
        selectedWellboresCount > 0 &&
        selectedWellboresCount !== cur.wellbores.length
      ) {
        return { ...prev, [cur.id]: true };
      }
      return prev;
    }, {});
  }
);

export const selectedOrHoveredWellsSelector = createSelector(
  (state: StoreState['wellSearch']) => state.inspectWellboreContext,
  (state) => state.selectedWellIds,
  (state) => state.wells,
  (state) => state.hoveredWellId,
  (state) => state.hoveredWellboreIds,
  (state) => state.wellFavoriteHoveredOrCheckedWells,
  (state) => state.wellCardSelectedWellBoreId,
  (state) => state.selectedWellboreIds,
  (
    state: StoreState['wellSearch'],
    well: Well | null,
    wellbores: Wellbore[],
    favoriteWellData: Well[]
  ) => ({
    well,
    wellbores,
    favoriteWellData,
  }),
  (
    inspectContext,
    selectedWellIds,
    wells,
    hoveredWellId,
    hoveredWellboreIds,
    wellFavoriteHoveredOrCheckedWells,
    wellCardSelectedWellBoreId,
    selectedWellboreIds,
    { well, wellbores, favoriteWellData }
  ) => {
    if (inspectContext === InspectWellboreContext.WELL_CARD_WELLBORES) {
      if (well) {
        // if only wellbore is selected, then show filter others
        const resultedWellbores = wellbores.filter(
          (wellbore) => wellCardSelectedWellBoreId[wellbore.id]
        );
        return [{ ...well, ...{ wellbores: resultedWellbores } }];
      }
      return [];
    }

    if (inspectContext === InspectWellboreContext.FAVORITE_HOVERED_WELL) {
      if (!favoriteWellData?.length) return [];

      const firstWell = head(favoriteWellData);
      if (firstWell)
        return [{ ...firstWell, ...{ wellbores: firstWell.wellbores || [] } }];

      return [];
    }

    /*
    This method is used to get a well with a wellbore which hovered on favorite wellbore table
    (View button in seperate wellbore row)
    */

    if (
      isEqual(inspectContext, InspectWellboreContext.FAVORITE_HOVERED_WELLBORE)
    ) {
      if (isEmpty(favoriteWellData)) return [];
      /*
      Parsing only one wellId as favoriteHoveredIds when getting favoriteWellData for this function.
      So the result canbe contained only one well or non.
      So need to get the head of that array if it is not empty.
      */
      const firstWell = head(favoriteWellData);
      if (firstWell) {
        /*
        HoveredWellboreIds also contains only one wellbore id.
        Then need to get the wellbore that equals with the head of HoveredWellboreIds
        */
        const resultedWellbores = getFilteredWellbores(
          firstWell.wellbores,
          head(Object.keys(hoveredWellboreIds))
        );

        return [{ ...firstWell, ...{ wellbores: resultedWellbores || [] } }];
      }
      return [];
    }
    if (inspectContext === InspectWellboreContext.FAVORITE_CHECKED_WELLS) {
      if (!favoriteWellData?.length) return [];

      return favoriteWellData.map((favoriteWell) => {
        return {
          ...favoriteWell,
          ...{ wellbores: favoriteWell.wellbores || [] },
        };
      });
    }

    return wells
      .filter((well) =>
        inspectContext === InspectWellboreContext.CHECKED_WELLBORES
          ? selectedWellIds[well.id]
          : hoveredWellId === well.id
      )
      .map((well) => {
        const wellbores = well.wellbores
          ? well.wellbores.filter((wellbore) => {
              return inspectContext === InspectWellboreContext.CHECKED_WELLBORES
                ? selectedWellboreIds[wellbore.id]
                : hoveredWellboreIds[wellbore.id];
            })
          : [];
        return { ...well, ...{ wellbores } };
      });
  }
);

export const selectedSecondaryWellAndWellboreIdsSelector = createSelector(
  (state: StoreState) => state.wellSearch.selectedSecondaryWellIds,
  (state: StoreState) => state.wellSearch.selectedSecondaryWellboreIds,
  (selectedSecondaryWellIds, selectedSecondaryWellboreIds) => ({
    selectedSecondaryWellIds,
    selectedSecondaryWellboreIds,
  })
);
