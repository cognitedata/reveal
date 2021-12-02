import { useMutation, useQuery, useQueryClient } from 'react-query';

import { Dictionary } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import isArray from 'lodash/isArray';

import { useWellbores, useWells } from 'modules/wellSearch/selectors';
import {
  getWellboresByWellIds,
  getWellByWellId,
} from 'modules/wellSearch/service';
import { Wellbore, WellBoreListMap, WellMap } from 'modules/wellSearch/types';
import { normalizeWell } from 'modules/wellSearch/utils/wells';

export const WELL_CARD_KEY = 'wellCardKey';
export const WELLBORE_CARD_KEY = 'welloreCardKey';

export const wellBoreUseQuery = (wellIds: number[]) => {
  const { wellbores } = useWellbores(wellIds);

  return useQuery<WellBoreListMap>([WELLBORE_CARD_KEY], () => {
    const wellBoreList: WellBoreListMap = {};

    wellIds.forEach((wellId) => {
      wellBoreList[wellId] = wellbores.filter(
        (wellbore) => wellbore.wellId === wellId
      );
    });

    return wellBoreList;
  });
};

export const wellUseQuery = () => {
  const { wells } = useWells();

  return useQuery<WellMap>([WELL_CARD_KEY], () => {
    const wellList: WellMap = {};

    wells.forEach((well) => {
      wellList[well.id] = well;
    });

    return wellList;
  });
};

export const useMutateWellPatch = () => {
  const queryClient = useQueryClient();
  const { data } = wellUseQuery();

  return useMutation(getWellByWellId, {
    onSuccess: (result) => {
      if (result) {
        const resultedWell = isArray(result) ? result[0] : result;

        queryClient.setQueryData(WELL_CARD_KEY, {
          ...data,
          ...{ [resultedWell.id]: normalizeWell(resultedWell) },
        });
      }
    },
  });
};

export const useMutateWellBorePatch = (wellIds: number[]) => {
  const queryClient = useQueryClient();
  const { data } = wellBoreUseQuery(wellIds);

  return useMutation(
    async () => {
      const wellbores = await getWellboresByWellIds(wellIds);
      const groupedWellbores = wellIds.reduce(
        (prev, current) => (prev[current] ? prev : { ...prev, [current]: [] }),
        groupBy(wellbores, 'wellId')
      );

      return Promise.resolve<Dictionary<Wellbore[]>>(groupedWellbores);
    },
    {
      onSuccess: (result) => {
        if (result) {
          queryClient.setQueryData(WELLBORE_CARD_KEY, {
            ...data,
            ...result,
          });
        }
      },
    }
  );
};
