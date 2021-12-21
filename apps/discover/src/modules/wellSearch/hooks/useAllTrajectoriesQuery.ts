import { Trajectory } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { fetchAllTrajectories } from '../service/sequence/trajectoryFetchAll';
import { groupByWellbore } from '../utils/groupByWellbore';

import { AllCursorsProps } from './useAllNdsCursorsQuery';

export const useAllTrajectoriesQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<Trajectory>({
    key: WELL_QUERY_KEY.TRAJECTORIES_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      fetchAllTrajectories({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
