import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors/handleServiceError';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_WELL_TOPS } from '../../constants';
import { getWellTops } from '../../service/network/getWellTops';
import { normalizeWellTops } from '../transformers/normalizeWellTops';
import { WellTopsInternal } from '../types';

export const useWellTopsQuery = () => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  return useArrayCache<WellTopsInternal>({
    key: [...WELL_QUERY_KEY.WELL_TOPS],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getWellTops({ wellboreIds, options })
        .then((welltops) => {
          return normalizeWellTops(welltops, userPreferredUnit);
        })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_WELL_TOPS)
        ),
  });
};
