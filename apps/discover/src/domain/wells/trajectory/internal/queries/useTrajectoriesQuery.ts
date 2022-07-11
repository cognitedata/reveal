import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getTrajectories } from '../../service/network/getTrajectories';
import { normalizeTrajectory } from '../transformers/normalizeTrajectory';
import { TrajectoryInternal } from '../types';

export const useTrajectoriesQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<TrajectoryInternal>({
    key: [...WELL_QUERY_KEY.TRAJECTORIES_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getTrajectories({ wellboreIds, options })
        .then((trajectories) =>
          trajectories.map((rawTrajectory) =>
            normalizeTrajectory(rawTrajectory, userPreferredUnit)
          )
        )
        .then(groupByWellbore),
  });
};
