import { groupBySequence } from 'domain/wells/wellbore/internal/transformers/groupBySequence';

import { TrajectoryDataRequest } from '@cognite/sdk-wells';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getTrajectoriesData } from '../../service/network/getTrajectoriesData';
import { normalizeTrajectoryData } from '../transformers/normalizeTrajectoryData';
import { TrajectoryDataInternal } from '../types';

export const useTrajectoriesDataQuery = ({
  sequenceExternalIds,
}: {
  sequenceExternalIds: TrajectoryDataRequest['sequenceExternalId'][];
}) => {
  const { data: unit } = useUserPreferencesMeasurement();

  return useArrayCache<TrajectoryDataInternal>({
    key: [...WELL_QUERY_KEY.TRAJECTORIES_DATA_CACHE, unit],
    items: new Set(sequenceExternalIds),
    fetchAction: (sequenceExternalIds) =>
      getTrajectoriesData({ sequenceExternalIds, unit })
        .then((trajectoriesData) =>
          trajectoriesData.map((trajectory) =>
            normalizeTrajectoryData(trajectory, unit)
          )
        )
        .then(groupBySequence),
  });
};
