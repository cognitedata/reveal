import React, { useMemo } from 'react';

import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import pickBy from 'lodash/pickBy';

import { ProjectConfigGeneral } from '@cognite/discover-api-types';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import useSelector from 'hooks/useSelector';
import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { WELLBORE_COLORS } from 'modules/wellInspect/constants';
import {
  ASSETS_GROUPED_PROPERTY,
  WELL_FIELDS_WITH_PRODUCTION_DATA,
} from 'modules/wellSearch/constants';
import {
  wellBoreUseQuery,
  wellUseQuery,
} from 'modules/wellSearch/hooks/useQueryWellCard';
import { useWellsByIdForFavoritesQuery } from 'modules/wellSearch/hooks/useWellsFavoritesQuery';
import {
  InspectWellboreContext,
  Well,
  Wellbore,
  WellId,
} from 'modules/wellSearch/types';
import { ExternalLinksConfig } from 'tenants/types';

export const useWells = () => {
  return useSelector((state) => state.wellSearch);
};

export const useWellIds = () => {
  return useSelector((state) => state.wellSearch.wells.map((well) => well.id));
};

export const useWellResult = (id?: number) => {
  const { data } = wellUseQuery();
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
  const { data } = wellUseQuery();
  if (!id) return null;
  if (data && data[id]) return data[id];

  return null;
};

export const useWellBoreResult = (wellId?: number) => {
  const idList = wellId ? [wellId] : [];
  const { data } = wellBoreUseQuery(idList);
  if (!wellId) return [];
  if (data && data[wellId]) return data[wellId];
  return [];
};

// This returns grouped wells by externalId
export const useGroupedWells = () => {
  return useSelector((state) => {
    return useMemo(
      () => groupBy(state.wellSearch.wells, ASSETS_GROUPED_PROPERTY),
      [state.wellSearch.wells]
    );
  });
};

// This returns selected wells and wellbores
export const useSelectedWells = () => {
  return useSelector((state) => {
    return useMemo(() => {
      const wells = state.wellSearch.wells
        .filter((well) => state.wellSearch.selectedWellIds[well.id])
        .map((well) => {
          const wellbores = well.wellbores
            ? well.wellbores.filter(
                (wellbore) => state.wellSearch.selectedWellboreIds[wellbore.id]
              )
            : [];
          return { ...well, ...{ wellbores } };
        });
      return wells;
    }, [state.wellSearch.selectedWellboreIds, state.wellSearch.wells]);
  });
};

// @sdk-wells-v3
export const useSelectedWellIds = () => {
  const { data: enableWellSDKV3 } = useProjectConfigByKey<
    ProjectConfigGeneral['enableWellSDKV3']
  >('general.enableWellSDKV3');

  return useSelector((state) => {
    const { selectedWellIds } = state.wellSearch;

    return useMemo(() => {
      const selectedIds = Object.keys(pickBy(selectedWellIds));

      return enableWellSDKV3
        ? (selectedIds as unknown as number[])
        : selectedIds.map(Number);
    }, [selectedWellIds]);
  });
};

// This returns indeterminate wells (Wells that some wellbores are selected but not all)
export const useIndeterminateWells = () => {
  return useSelector((state) => {
    return useMemo(() => {
      return state.wellSearch.wells.reduce((prev, cur) => {
        if (!cur.wellbores) {
          return prev;
        }
        const selectedWellboresCount = cur.wellbores.filter(
          (wellbore) => state.wellSearch.selectedWellboreIds[wellbore.id]
        ).length;
        if (
          selectedWellboresCount > 0 &&
          selectedWellboresCount !== cur.wellbores.length
        ) {
          return { ...prev, [cur.id]: true };
        }
        return prev;
      }, {});
    }, [state.wellSearch.selectedWellboreIds, state.wellSearch.wells]);
  });
};

// This returns external links based on the selected wells
export const useExternalLinkFromSelectedWells = (): string[] => {
  const selectedWells = useSelectedWells();
  const { data: tenantConfigExternalLinks } =
    useTenantConfigByKey<ExternalLinksConfig>('externalLinks');

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
  return useSelector((state) => {
    const wellCardId = state.wellSearch.wellCardSelectedWellId;
    const well = useWellResult(wellCardId);
    const wellbores = useWellBoreResult(wellCardId);

    // favorite wells
    const favoriteHoveredIds =
      state.wellSearch.wellFavoriteHoveredOrCheckedWells;
    const { data: favoriteWellData } =
      useFavoriteWellResults(favoriteHoveredIds);

    const wells = useMemo(() => {
      const inspectContext = state.wellSearch.inspectWellboreContext;
      if (inspectContext === InspectWellboreContext.WELL_CARD_WELLBORES) {
        if (well) {
          // if only wellbore is selected, then show filter others
          const resultedWellbores = wellbores.filter(
            (wellbore) =>
              state.wellSearch.wellCardSelectedWellBoreId[wellbore.id]
          );
          return [{ ...well, ...{ wellbores: resultedWellbores } }];
        }
        return [];
      }

      if (inspectContext === InspectWellboreContext.FAVORITE_HOVERED_WELL) {
        if (!favoriteWellData?.length) return [];

        const firstWell = head(favoriteWellData);
        if (firstWell)
          return [
            { ...firstWell, ...{ wellbores: firstWell.wellbores || [] } },
          ];

        return [];
      }

      if (inspectContext === InspectWellboreContext.FAVORITE_CHECKED_WELLS) {
        if (!favoriteWellData?.length) return [];

        return favoriteWellData.map((well) => {
          return { ...well, ...{ wellbores: well.wellbores || [] } };
        });
      }

      return state.wellSearch.wells
        .filter((well) =>
          inspectContext === InspectWellboreContext.CHECKED_WELLBORES
            ? state.wellSearch.selectedWellIds[well.id]
            : state.wellSearch.hoveredWellId === well.id
        )
        .map((well) => {
          const wellbores = well.wellbores
            ? well.wellbores.filter((wellbore) => {
                return inspectContext ===
                  InspectWellboreContext.CHECKED_WELLBORES
                  ? state.wellSearch.selectedWellboreIds[wellbore.id]
                  : state.wellSearch.hoveredWellboreIds[wellbore.id];
              })
            : [];
          return { ...well, ...{ wellbores } };
        });
    }, [
      state.wellSearch.inspectWellboreContext,
      state.wellSearch.selectedWellIds,
      state.wellSearch.wells,
      state.wellSearch.hoveredWellId,
      state.wellSearch.hoveredWellboreIds,
      state.wellSearch.wellFavoriteHoveredOrCheckedWells,
      state.wellSearch.selectedWellboreIds,
    ]);

    return useMemo(() => {
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
    }, wells);
  });
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
    [wells, selectedSecondaryWellIds, selectedSecondaryWellboreIds]
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
  return useSelector((state) => {
    return useMemo(() => {
      const { selectedSecondaryWellIds, selectedSecondaryWellboreIds } =
        state.wellSearch;
      return { selectedSecondaryWellIds, selectedSecondaryWellboreIds };
    }, [
      state.wellSearch.selectedSecondaryWellIds,
      state.wellSearch.selectedSecondaryWellboreIds,
    ]);
  });
};
