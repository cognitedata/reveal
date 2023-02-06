import { useWellsByIdsQuery } from 'domain/wells/well/internal/queries/useWellsByIdsQuery';

import { useMemo } from 'react';

import { EMPTY_ARRAY } from 'constants/empty';

export const useWellboresByWellIds = (wellMatchingIds: string[]) => {
  const { data, isLoading } = useWellsByIdsQuery(wellMatchingIds);

  const wellbores = useMemo(() => {
    return data?.flatMap(({ wellbores }) => wellbores) || EMPTY_ARRAY;
  }, [data]);

  return {
    data: wellbores,
    isLoading,
  };
};
