import { keyByMatchingId } from 'domain/wells/utils/keyByMatchingId';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY } from 'constants/empty';

import { getWellMatchingIds } from '../selectors/getWellMatchingIds';
import { groupByWellMatchingId } from '../transformers/groupByWellMatchingId';
import { DrillingDays, WellboreInternal } from '../types';
import { calculateCumulativeTotalDrillingDays } from '../utils/calculateCumulativeTotalDrillingDays';
import { calculateWellboreDrillingDays } from '../utils/calculateWellboreDrillingDays';

import { useWellboresByWellIds } from './useWellboresByWellIds';

type WellboreType = Pick<
  WellboreInternal,
  | 'matchingId'
  | 'wellMatchingId'
  | 'parentWellboreMatchingId'
  | 'totalDrillingDays'
>;

export const useDrillingDays = <T extends WellboreType>(wellbores: T[]) => {
  const wellMatchingIds = getWellMatchingIds(wellbores);

  const { data: fetchedWellbores, isLoading } =
    useWellboresByWellIds(wellMatchingIds);

  const drillingData = useMemo(() => {
    if (isEmpty(fetchedWellbores)) {
      return EMPTY_ARRAY as DrillingDays[];
    }

    const keyedWellbores = keyByMatchingId(fetchedWellbores);
    const groupedWellbores = groupByWellMatchingId(fetchedWellbores);

    return wellbores.map(
      ({
        matchingId,
        wellMatchingId,
        parentWellboreMatchingId,
        totalDrillingDays,
      }) => {
        const parentWellbore = parentWellboreMatchingId
          ? keyedWellbores[parentWellboreMatchingId]
          : undefined;

        return {
          wellboreMatchingId: matchingId,
          wellbore: calculateWellboreDrillingDays(
            totalDrillingDays,
            parentWellbore?.totalDrillingDays
          ),
          total: totalDrillingDays,
          cumulativeTotal: calculateCumulativeTotalDrillingDays(
            groupedWellbores[wellMatchingId]
          ),
        };
      }
    );
  }, [fetchedWellbores]);

  return {
    data: drillingData,
    isLoading,
  };
};
