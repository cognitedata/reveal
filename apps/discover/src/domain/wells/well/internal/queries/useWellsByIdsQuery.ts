import { groupByMatchingId } from 'domain/wells/utils/groupByMatchingId';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getWellsByIds } from '../../service/network/getWellsById';
import { ERROR_LOADING_WELLS_BY_ID_ERROR } from '../constants';
import { normalizeWell } from '../transformers/normalizeWell';
import { WellInternal } from '../types';

export const useWellsByIdsQuery = (wellIds: string[]) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<WellInternal>({
    key: WELL_QUERY_KEY.WELLS_BY_IDS,
    items: new Set(wellIds),
    fetchAction: (wellIds) => {
      return getWellsByIds(Array.from(wellIds))
        .then((wells) =>
          wells.map((rawWell) => normalizeWell(rawWell, userPreferredUnit))
        )
        .then(groupByMatchingId)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_WELLS_BY_ID_ERROR)
        );
    },
  });
};
