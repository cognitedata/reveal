import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_NPT_EVENTS_ERROR } from '../../service/constants';
import { getNptEvents } from '../../service/network/getNptEvents';
import { normalizeAllNpt } from '../transformers/normalizeAllNpt';
import { NptInternal } from '../types';

export const useNptEventsQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<NptInternal>({
    key: [...WELL_QUERY_KEY.NPT_EVENTS_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getNptEvents({ wellboreIds, options })
        .then((npt) => {
          return normalizeAllNpt(npt, userPreferredUnit);
        })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_NPT_EVENTS_ERROR)
        ),
  });
};
