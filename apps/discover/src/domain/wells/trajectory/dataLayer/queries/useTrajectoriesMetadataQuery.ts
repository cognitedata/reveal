import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';

import { getTrajectories } from '../../service/network/getTrajectories';

export const useTrajectoriesMetadataQuery = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const trajectoriesMetadata = useQuery(
    [WELL_QUERY_KEY.TRAJECTORIES_LIST, wellboreIds],
    async () => {
      return getTrajectories(wellboreIds);
    }
  );

  return trajectoriesMetadata;
};
