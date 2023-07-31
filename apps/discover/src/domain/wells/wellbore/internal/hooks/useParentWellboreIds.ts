import { keyByMatchingId } from 'domain/wells/utils/keyByMatchingId';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/empty';

import { getWellMatchingIds } from '../selectors/getWellMatchingIds';
import { WellboreInternal } from '../types';

import { useWellboresByWellIds } from './useWellboresByWellIds';

type WellboreType = Pick<
  WellboreInternal,
  'matchingId' | 'wellMatchingId' | 'parentWellboreMatchingId'
>;

export const useParentWellboreIds = <T extends WellboreType>(
  wellbores: T[]
) => {
  const wellMatchingIds = getWellMatchingIds(wellbores);

  const { data: fetchedWellbores, isLoading } =
    useWellboresByWellIds(wellMatchingIds);

  const parentWellboreIds = useMemo(() => {
    if (isEmpty(fetchedWellbores)) {
      return EMPTY_OBJECT as Record<string, string[]>;
    }

    const keyedWellbores = keyByMatchingId(fetchedWellbores);

    const getParentWellboreIds = (matchingId: string): string[] => {
      const wellbore = keyedWellbores[matchingId];
      const parentId = wellbore?.parentWellboreMatchingId;

      if (!parentId) {
        return EMPTY_ARRAY;
      }

      return [parentId, ...getParentWellboreIds(parentId)];
    };

    return wellbores.reduce((result, { matchingId }) => {
      return {
        ...result,
        [matchingId]: getParentWellboreIds(matchingId),
      };
    }, {} as Record<string, string[]>);
  }, [fetchedWellbores]);

  return {
    data: parentWellboreIds,
    isLoading,
  };
};
