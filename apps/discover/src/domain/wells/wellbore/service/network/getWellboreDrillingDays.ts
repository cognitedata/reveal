import keyBy from 'lodash/keyBy';

import { DrillingDays, WellboreInternal } from '../../internal/types';
import { calculateDrillingDays } from '../../internal/utils/calculateDrillingDays';

import { getWellboresByWellIds } from './getWellboresByWellId';

type WellboreType = Pick<
  WellboreInternal,
  'matchingId' | 'parentWellboreMatchingId' | 'totalDrillingDays'
>;

export const getWellboreDrillingDays = async <T extends WellboreType>(
  wellbores: T[]
): Promise<DrillingDays[]> => {
  const keyedWellbores = keyBy(wellbores, 'matchingId');

  const wellboreIdsToFetch = wellbores.reduce(
    (ids, { parentWellboreMatchingId }) => {
      if (parentWellboreMatchingId) {
        if (!keyedWellbores[parentWellboreMatchingId]) {
          return [...ids, parentWellboreMatchingId];
        }
        return ids;
      }
      return ids;
    },
    [] as string[]
  );

  const extraWellbores = await getWellboresByWellIds(wellboreIdsToFetch);

  const keyedWellboresAll = {
    ...keyedWellbores,
    ...keyBy(extraWellbores, 'matchingId'),
  };

  return wellbores.reduce((result, wellbore) => {
    const { parentWellboreMatchingId } = wellbore;

    const drillingDays = calculateDrillingDays(
      wellbore,
      parentWellboreMatchingId
        ? keyedWellboresAll[parentWellboreMatchingId]
        : undefined
    );

    if (!drillingDays) {
      return result;
    }

    return [...result, drillingDays];
  }, [] as DrillingDays[]);
};
