import { normalizeNds } from 'domain/wells/dataLayer/nds/adapters/normalizeNds';
import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';
import { groupByWellbore } from 'domain/wells/dataLayer/wellbore/adapters/groupByWellbore';
import { AllCursorsProps } from 'domain/wells/types';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_NDS_EVENTS_ERROR } from '../constants';
import { getAllNdsEvents } from '../network/getAllNdsEvents';

export const useNdsEventsQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<NdsDataLayer>({
    key: [...WELL_QUERY_KEY.NDS_EVENTS_CACHE, userPreferredUnit],
    items: wellboreIds,
    fetchAction: (wellboreIds, options) =>
      getAllNdsEvents({ wellboreIds, options })
        .then((nds) =>
          nds.map((rawNds) => normalizeNds(rawNds, userPreferredUnit))
        )
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_NDS_EVENTS_ERROR)
        ),
  });
};
