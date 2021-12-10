import { useMutation, useQuery, useQueryClient } from 'react-query';

import keyBy from 'lodash/keyBy';

import { WELL_QUERY_KEY } from 'constants/react-query';
import {
  getGroupedWellboresByWellIds,
  getWellByWellIds,
} from 'modules/wellSearch/service';
import {
  DictionaryType,
  Well,
  Wellbore,
  WellMap,
} from 'modules/wellSearch/types';

import { useWells } from '../selectors';

interface FavoriteMutateModel {
  updatingWellIds: number[];
  successCallback?: (wellbores: DictionaryType<Wellbore[]>) => void;
}

export const useWellsByIdForFavoritesQuery = () => {
  const { wells } = useWells();

  return useQuery<WellMap>(WELL_QUERY_KEY.BY_ID, () => {
    return keyBy<WellMap>(wells, (well) => well.id);
  });
};

export const useMutateFavoriteWellUpdate = () => {
  const queryClient = useQueryClient();
  const { data } = useWellsByIdForFavoritesQuery();

  return useMutation(getWellByWellIds, {
    onSuccess: (result) => {
      if (!result.length) {
        queryClient.invalidateQueries(WELL_QUERY_KEY.BY_ID);
        return;
      }
      const resultObject = result.reduce((acc: WellMap, item: Well) => {
        // eslint-disable-next-line no-param-reassign
        acc[item.id] = item;
        return acc;
      }, {});

      queryClient.setQueryData(WELL_QUERY_KEY.BY_ID, {
        ...data,
        ...resultObject,
      });
    },
  });
};

export const useMutateFavoriteWellPatchWellbores = () => {
  const queryClient = useQueryClient();
  const { data } = useWellsByIdForFavoritesQuery();

  return useMutation(
    async (favoriteMutateModel: FavoriteMutateModel) => {
      const { updatingWellIds, successCallback } = favoriteMutateModel;
      const wellbores = await getGroupedWellboresByWellIds(updatingWellIds);
      return Promise.resolve({ wellbores, updatingWellIds, successCallback });
    },
    {
      onSuccess: (response) => {
        const { updatingWellIds, wellbores, successCallback } = response;

        const updatedObject: WellMap = {};

        updatingWellIds.forEach((wellId) => {
          if (
            wellbores[wellId] &&
            wellbores[wellId]?.length &&
            data &&
            data[wellId]
          ) {
            updatedObject[wellId] = data[wellId];
            updatedObject[wellId].wellbores = wellbores[wellId];
          }
        });

        queryClient.setQueriesData(WELL_QUERY_KEY.BY_ID, {
          ...data,
          ...updatedObject,
        });
        if (successCallback) successCallback(wellbores);
      },
    }
  );
};
