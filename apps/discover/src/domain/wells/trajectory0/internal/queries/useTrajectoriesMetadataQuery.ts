import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';

import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { WellboreId } from 'modules/wellSearch/types';

import { getTrajectories } from '../../service/network/getTrajectories';

export const useTrajectoriesMetadataQuery = (wellboreIds?: WellboreId[]) => {
  const selectedWellboreIds = useWellInspectSelectedWellboreIds();

  const trajectoriesMetadata = useQuery(
    [WELL_QUERY_KEY.TRAJECTORIES_LIST, wellboreIds || selectedWellboreIds],
    async () => {
      return getTrajectories(wellboreIds || selectedWellboreIds);
    }
  );

  return trajectoriesMetadata;
};
