import { getAllTrajectories } from 'domain/wells/trajectory/service/network/getAllTrajectories';

import { Trajectory } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { AllCursorsProps } from 'modules/wellSearch/hooks/useAllNdsCursorsQuery';
import { groupByWellbore } from 'modules/wellSearch/utils/groupByWellbore';

export const useAllTrajectoriesQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<Trajectory>({
    key: WELL_QUERY_KEY.TRAJECTORIES_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      getAllTrajectories({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
