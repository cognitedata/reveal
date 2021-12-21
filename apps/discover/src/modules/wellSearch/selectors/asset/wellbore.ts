import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import difference from 'lodash/difference';
import flatMap from 'lodash/flatMap';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import { useDeepMemo } from 'hooks/useDeep';
import useSelector from 'hooks/useSelector';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { Wellbore } from 'modules/wellSearch/types';

import {
  useWellBoreResult,
  useWells,
  useSelectedWellIds,
  useFavoriteWellResults,
  useSelectedSecondaryWellAndWellboreIds,
  useSelectedOrHoveredWells,
} from './well';
import {
  selectedWellboresSelector,
  wellboreDataSelector,
  wellboresFetchedWellIdsSelector,
  wellboreAssetIdMapSelector,
} from './wellboreSelectors';

// This returns wellbores for the given well
export const useWellbores = (wellIds: number[]) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const { wells } = useWells();
  const dispatch = useDispatch();
  return useMemo(() => {
    const prestineWellIds = map(
      wells.filter((well) => wellIds.includes(well.id) && !well.wellbores),
      'id'
    );

    if (isLoading && !prestineWellIds.length) {
      setIsLoading(false);
    }

    if (prestineWellIds.length && isLoading) {
      return { isLoading: true, wellbores: [] };
    }

    if (prestineWellIds.length && !isLoading) {
      setIsLoading((prev) => {
        if (!prev) {
          dispatch(wellSearchActions.getWellbores(prestineWellIds));
        }
        return true;
      });
      return { isLoading: true, wellbores: [] };
    }
    const wellbores = flatMap(
      wells.filter((well) => wellIds.includes(well.id) && well.wellbores),
      'wellbores'
    ) as Wellbore[];

    return { isLoading: false, wellbores };
  }, [wellIds, wells, isLoading]);
};

// This returns selected wellbores
export const useSelectedWellbores = (filterByIds?: number[]) => {
  return useSelector((state) => selectedWellboresSelector(state, filterByIds));
};

export const useSelectedOrHoveredWellbores = (filterByIds?: number[]) => {
  const wells = useSelectedOrHoveredWells();
  return useMemo(() => {
    const wellbores = flatten(wells.map((well) => well.wellbores));
    if (filterByIds) {
      return wellbores.filter((row) => filterByIds.includes(row.id));
    }
    return wellbores;
  }, [wells, filterByIds]);
};

export const useSecondarySelectedOrHoveredWellbores = () => {
  const selectedOrHoveredWellbores = useSelectedOrHoveredWellbores();
  const { selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();
  return useMemo(
    () =>
      selectedOrHoveredWellbores.filter(
        (wellbore) => selectedSecondaryWellboreIds[wellbore.id]
      ),
    [selectedOrHoveredWellbores, selectedSecondaryWellboreIds]
  );
};

// This returns selected wellbores ids as a list
export const useSelectedWellboreIds = () => {
  const selectedWellbores = useSelectedWellbores();
  return useMemo(
    () => selectedWellbores.map((wellbore) => wellbore.id),
    [selectedWellbores]
  );
};

export const useSelectedOrHoveredWellboreIds = () => {
  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () => selectedOrHoveredWellbores.map((wellbore) => wellbore.id),
    [selectedOrHoveredWellbores]
  );
};

// This returns wellbore data
export const useWellboreData = () => {
  return useSelector(wellboreDataSelector);
};

export const useWellboreAssetIdMap = () => {
  const wellCardId = useSelector(
    (state) => state.wellSearch.wellCardSelectedWellId
  );
  const wellCardWellbores = useWellBoreResult(wellCardId);
  const favoriteHoveredIds = useSelector(
    (state) => state.wellSearch.wellFavoriteHoveredOrCheckedWells
  );
  // favorite wells
  const { data: favoriteWellData } = useFavoriteWellResults(favoriteHoveredIds);

  return useSelector((state) =>
    wellboreAssetIdMapSelector(state, wellCardWellbores, favoriteWellData)
  );
};

export const useActiveWellboresExternalIdMap = () => {
  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () =>
      selectedOrHoveredWellbores.reduce(
        (idMap, wellbore) =>
          wellbore.externalId
            ? { ...idMap, [wellbore.externalId]: wellbore.id }
            : idMap,
        {}
      ),
    [selectedOrHoveredWellbores]
  );
};

// @sdk-wells-v3
export const useActiveWellboresMatchingIdMap = () => {
  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () =>
      selectedOrHoveredWellbores.reduce((idMap, wellbore) => {
        if (wellbore.externalId) {
          return { ...idMap, [wellbore.externalId]: wellbore.id };
        }

        const sourceMap = wellbore.sources
          ?.map((source) => source.assetExternalId)
          .reduce((sourceMap, assetExternalId) => {
            return { ...sourceMap, [assetExternalId]: wellbore.matchingId };
          }, {});

        return { ...idMap, ...sourceMap };
      }, {}),
    [selectedOrHoveredWellbores]
  );
};

// @sdk-wells-v3
export const useActiveWellboresSourceExternalIdMap = () => {
  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () =>
      selectedOrHoveredWellbores.reduce((externalIdMap, wellbore) => {
        const sourceExternalIdMap = wellbore.sourceWellbores
          .map((sourceWellbore) => sourceWellbore.externalId)
          .reduce((map, sourceExternalId) => {
            return { ...map, [sourceExternalId]: wellbore.id };
          }, {});

        return { ...externalIdMap, ...sourceExternalIdMap };
      }, {}),
    [selectedOrHoveredWellbores]
  );
};

export const useWellboresFetchedWellIds = () => {
  return useSelector(wellboresFetchedWellIdsSelector);
};

export const useWellboresFetching = () => {
  const selectedWellIds = useSelectedWellIds();
  const wellboresFetchedWellIds = useWellboresFetchedWellIds();

  return useMemo(() => {
    const wellboresNotFetchedWellIds = difference(
      selectedWellIds,
      wellboresFetchedWellIds
    );
    return !isEmpty(wellboresNotFetchedWellIds);
  }, [wellboresFetchedWellIds, selectedWellIds]);
};

export const useWellboresByIdsAndWellId = (
  wellId: number,
  wellboreIds: string[]
) => {
  const wellbores: Wellbore[] = useWellBoreResult(wellId);

  return useDeepMemo(() => {
    return !isEmpty(wellboreIds)
      ? wellbores.filter((wellbore) => wellboreIds.includes(wellbore.id))
      : wellbores;
  }, [wellbores]);
};
