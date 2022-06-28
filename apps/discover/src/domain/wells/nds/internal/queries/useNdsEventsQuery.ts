import { normalizeNds } from 'domain/wells/nds/internal/transformers/normalizeNds';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_NDS_EVENTS_ERROR } from '../../service/constants';
import { getNdsEvents } from '../../service/network/getNdsEvents';

export const useNdsEventsQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<NdsInternal>({
    key: [...WELL_QUERY_KEY.NDS_EVENTS_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getNdsEvents({ wellboreIds, options })
        .then((nds) =>
          nds.map((rawNds) => normalizeNds(rawNds, userPreferredUnit))
        )
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_NDS_EVENTS_ERROR)
        ),
  });
};
