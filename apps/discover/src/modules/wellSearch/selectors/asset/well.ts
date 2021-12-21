/*
 * https://react-redux.js.org/api/hooks#using-memoizing-selectors : As per this doc
 * using reselect selector & useSelect in combination for memoizing results
 * */

import React, { useMemo } from 'react';

import flatten from 'lodash/flatten';

import { useDeepMemo } from 'hooks/useDeep';
import { useExternalLinksConfig } from 'hooks/useExternalLinksConfig';
import useSelector from 'hooks/useSelector';
import { WELLBORE_COLORS } from 'modules/wellInspect/constants';
import { WELL_FIELDS_WITH_PRODUCTION_DATA } from 'modules/wellSearch/constants';
import {
  useWellboreQuery,
  useWellQuery,
} from 'modules/wellSearch/hooks/useQueryWellCard';
import { useWellsByIdForFavoritesQuery } from 'modules/wellSearch/hooks/useWellsFavoritesQuery';
import { Well, Wellbore, WellId } from 'modules/wellSearch/types';

import { useEnabledWellSdkV3 } from '../../hooks/useEnabledWellSdkV3';

import {
  groupedWellsSelector,
  selectedWellsSelector,
  selectedWellIdsSelector,
  intermediateWellsSelector,
  selectedOrHoveredWellsSelector,
  selectedSecondaryWellAndWellboreIdsSelector,
} from './wellSelectors';

export const useWells = () => {
  return useSelector((state) => state.wellSearch);
};

export const useWellIds = () => {
  return useSelector((state) => state.wellSearch.wells.map((well) => well.id));
};

export const useWellResult = (id?: number) => {
  const { data } = useWellQuery();
  if (!id) return null;
  if (data && data[id]) return data[id];

  return null;
};

export const useFavoriteWellResults = (ids?: WellId[]) => {
  const { data, isIdle, isLoading } = useWellsByIdForFavoritesQuery();

  return useMemo(() => {
    if (!ids || !ids.length) return { data: [], isIdle, isLoading };
    const resultData = ids.reduce((acc: Well[], id) => {
      if (data && data[id]) {
        return [...acc, data[id]];
      }
      return acc;
    }, []);

    return { data: resultData, isIdle, isLoading };
  }, [data, isIdle, isLoading, ids]);
};

export const useFavoriteWellResult = (id?: number) => {
  const { data } = useWellQuery();
  if (!id) return null;
  if (data && data[id]) return data[id];

  return null;
};

export const useWellBoreResult = (wellId?: number): Wellbore[] => {
  const idList = wellId ? [wellId] : [];
  const { data } = useWellboreQuery(idList);
  if (!wellId) return [];
  if (data && data[wellId]) return data[wellId];
  return [];
};

// This returns grouped wells by externalId
export const useGroupedWells = () => {
  return useSelector(groupedWellsSelector);
};

// This returns selected wells and wellbores
export const useSelectedWells = () => {
  return useSelector(selectedWellsSelector);
};

// @sdk-wells-v3
export const useSelectedWellIds = () => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();
  return useSelector((state) =>
    selectedWellIdsSelector(state, enabledWellSDKV3)
  );
};

export const useIndeterminateWells = () => {
  return useSelector(intermediateWellsSelector);
};

// This returns external links based on the selected wells
export const useExternalLinkFromSelectedWells = (): string[] => {
  const selectedWells = useSelectedWells();
  const tenantConfigExternalLinks = useExternalLinksConfig();

  return React.useMemo(() => {
    const externalLinks: string[] = [];

    if (tenantConfigExternalLinks) {
      selectedWells.forEach((well) => {
        if (
          well.name === '34/7-G-4' &&
          tenantConfigExternalLinks.hasWellProductionData
        ) {
          externalLinks.push(tenantConfigExternalLinks.hasWellProductionData());
        }

        /**
         * NOTE: the field prop is not in the type but is delivered by backend.
         * I didn't know which type to change at this point and this solution is
         * temporarily so I ts-ignored it - Samir
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { field } = well;
        if (
          field &&
          WELL_FIELDS_WITH_PRODUCTION_DATA.includes(field) &&
          tenantConfigExternalLinks.hasProductionData
        ) {
          externalLinks.push(
            tenantConfigExternalLinks.hasProductionData(field)
          );
        }
      });
    }

    // filter out duplicates
    return Array.from(new Set(externalLinks)) || [];
  }, [selectedWells, tenantConfigExternalLinks]);
};

export const useSelectedOrHoveredWells = () => {
  const wellCardId = useSelector(
    (state) => state.wellSearch.wellCardSelectedWellId
  );
  const favoriteHoveredIds = useSelector(
    (state) => state.wellSearch.wellFavoriteHoveredOrCheckedWells
  );
  const well = useWellResult(wellCardId);
  const wellbores = useWellBoreResult(wellCardId);
  const { data: favoriteWellData } = useFavoriteWellResults(favoriteHoveredIds);
  const wells = useSelector((state) =>
    selectedOrHoveredWellsSelector(
      state.wellSearch,
      well,
      wellbores,
      favoriteWellData
    )
  );

  return useDeepMemo(() => {
    let wellboreIndex = -1;
    const colors = [
      ...WELLBORE_COLORS,
      ...WELLBORE_COLORS.map((color) => `${color}_`),
    ];
    return wells.map((well) => ({
      ...well,
      wellbores: well.wellbores.map((wellbore) => {
        wellboreIndex += 1;
        const colorIndex = wellboreIndex % colors.length;
        return {
          ...wellbore,
          metadata: {
            ...wellbore.metadata,
            color: colors[colorIndex],
          },
        } as Wellbore;
      }),
    }));
  }, [wells]);
};

export const useSecondarySelectedOrHoveredWells = () => {
  const wells = useSelectedOrHoveredWells();
  const { selectedSecondaryWellIds, selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();
  return useMemo(
    () =>
      wells
        .filter((well) => selectedSecondaryWellIds[well.id])
        .map((well) => ({
          ...well,
          wellbores: (well.wellbores || []).filter(
            (wellbore) => selectedSecondaryWellboreIds[wellbore.id]
          ),
        })),
    [
      JSON.stringify(wells),
      JSON.stringify(selectedSecondaryWellIds),
      JSON.stringify(selectedSecondaryWellboreIds),
    ]
  );
};

export const useSecondarySelectedWellsAndWellboresCount = () => {
  const { selectedSecondaryWellIds, selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();
  return useMemo(
    () => ({
      secondaryWells: Object.entries(selectedSecondaryWellIds).filter(
        ([, isSelected]) => isSelected
      ).length,
      secondaryWellbores: Object.entries(selectedSecondaryWellboreIds).filter(
        ([, isSelected]) => isSelected
      ).length,
    }),
    [selectedSecondaryWellIds, selectedSecondaryWellboreIds]
  );
};

export const useActiveWellsWellboresIds = () => {
  const wells = useSelectedOrHoveredWells();
  return useMemo(
    () => ({
      wellIds: wells.map((well) => well.id),
      wellboreIds: flatten(wells.map((well) => well.wellbores)).map(
        (wellbore) => wellbore.id
      ),
    }),
    [wells]
  );
};

export const useActiveWellsWellboresCount = () => {
  const { wellIds, wellboreIds } = useActiveWellsWellboresIds();
  return useMemo(
    () => ({
      wells: wellIds.length,
      wellbores: wellboreIds.length,
    }),
    [wellIds, wellboreIds]
  );
};

export const useSelectedSecondaryWellAndWellboreIds = () => {
  return useSelector(selectedSecondaryWellAndWellboreIdsSelector);
};
