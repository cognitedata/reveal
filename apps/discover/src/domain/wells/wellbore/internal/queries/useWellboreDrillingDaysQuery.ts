import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useDeepMemo } from 'hooks/useDeep';

import { getWellboreDrillingDays } from '../../service/network/getWellboreDrillingDays';
import { ERROR_LOADING_WELLBORES_BY_ID } from '../constants';
import { groupByWellbore } from '../transformers/groupByWellbore';
import { DrillingDays, WellboreInternal } from '../types';

type WellboreType = Pick<
  WellboreInternal,
  'matchingId' | 'parentWellboreMatchingId' | 'totalDrillingDays'
>;

export const useWellboreDrillingDaysQuery = <T extends WellboreType>(
  wellbores: T[]
) => {
  const wellboreIds = useDeepMemo(() => {
    return wellbores.map(({ matchingId }) => matchingId);
  }, [wellbores]);

  return useArrayCache<DrillingDays>({
    key: WELL_QUERY_KEY.DRILLING_DAYS,
    items: new Set(wellboreIds),
    fetchAction: () =>
      getWellboreDrillingDays(wellbores)
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_WELLBORES_BY_ID)
        ),
  });
};
