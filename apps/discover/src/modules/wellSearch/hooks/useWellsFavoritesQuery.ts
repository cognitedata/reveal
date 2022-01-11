import { useQuery, UseQueryResult } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { Well, WellId } from 'modules/wellSearch/types';

import { useWellsByIds } from './useWellsCacheQuerySelectors';

export const useFavoriteWellResultQuery = (
  wellIds: WellId[]
): UseQueryResult<Well[]> => {
  const wells = useWellsByIds(wellIds);
  return useQuery<Well[]>([WELL_QUERY_KEY.FAVORITE, wellIds], () => wells);
};
