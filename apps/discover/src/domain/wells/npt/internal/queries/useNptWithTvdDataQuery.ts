import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import compact from 'lodash/compact';
import map from 'lodash/map';
import { colorize } from 'utils/colorize';
import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_NPT_EVENTS_ERROR } from '../../service/constants';
import { getNptWithTvd } from '../../service/network/getNptWithTvd';
import { PREDEFINED_NPT_COLORS } from '../constants';
import { normalizeNptWithTvd } from '../transformers/normalizeNptWithTvd';
import { NptInternalWithTvd } from '../types';

export const useNptWithTvdDataQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<NptInternalWithTvd>({
    key: [...WELL_QUERY_KEY.NPT_EVENTS_WITH_TVD_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getNptWithTvd({ wellboreIds, options })
        .then((nptResponse) => {
          const nptCodes = compact(map(nptResponse, 'nptCode'));
          const nptCodeColorMap = colorize(nptCodes, PREDEFINED_NPT_COLORS);

          return nptResponse.map((npt) =>
            normalizeNptWithTvd(npt, userPreferredUnit, nptCodeColorMap)
          );
        })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_NPT_EVENTS_ERROR)
        ),
  });
};
