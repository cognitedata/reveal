import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import compact from 'lodash/compact';
import map from 'lodash/map';
import { colorize } from 'utils/colorize';
import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_NDS_EVENTS_ERROR } from '../../service/constants';
import { getNdsWithTvd } from '../../service/network/getNdsWithTvd';
import { normalizeNdsWithTvd } from '../transformers/normalizeNdsWithTvd';
import { NdsInternalWithTvd } from '../types';

export const useNdsWithTvdDataQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<NdsInternalWithTvd>({
    key: [...WELL_QUERY_KEY.NDS_EVENTS_WITH_TVD_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getNdsWithTvd({ wellboreIds, options })
        .then((ndsResponse) => {
          const ndsCodes = compact(map(ndsResponse, 'riskType'));
          const ndsCodeColorMap = colorize(ndsCodes);

          return ndsResponse.map((nds) =>
            normalizeNdsWithTvd(nds, userPreferredUnit, ndsCodeColorMap)
          );
        })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_NDS_EVENTS_ERROR)
        ),
  });
};
