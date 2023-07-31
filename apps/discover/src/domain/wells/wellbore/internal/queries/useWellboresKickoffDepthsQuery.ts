import compact from 'lodash/compact';
import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getWellboresKickoffTVD } from '../../service/network/getWellboresKickoffTVD';
import { ERROR_LOADING_WELLBORE_KICKOFF_TVD } from '../constants';
import { groupByWellbore } from '../transformers/groupByWellbore';
import { normalizeKickoffDepth } from '../transformers/normalizeKickoffDepth';
import { KickoffDepth, WellboreInternal } from '../types';

type WellboreType = Pick<
  WellboreInternal,
  'matchingId' | 'sources' | 'kickoffMeasuredDepth'
>;

export const useWellboresKickoffDepthsQuery = <T extends WellboreType>(
  wellbores: T[]
) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const wellboreIds = useDeepMemo(() => {
    return wellbores.map(({ matchingId }) => matchingId);
  }, [wellbores]);

  return useArrayCache<KickoffDepth>({
    key: [...WELL_QUERY_KEY.KICKOFF_DEPTHS, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: () =>
      getWellboresKickoffTVD(wellbores)
        .then((trueVerticalDepths) =>
          compact(
            trueVerticalDepths.map((tvd) =>
              normalizeKickoffDepth(tvd, userPreferredUnit)
            )
          )
        )
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_WELLBORE_KICKOFF_TVD)
        ),
  });
};
