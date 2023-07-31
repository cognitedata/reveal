import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { getRigOperationsByWellbores } from '../../service/network/getRigOperationsByWellbores';
import { ERROR_LOADING_RIG_OPERATIONS_ERROR } from '../constants';
import { RigOperationInternal } from '../types';

export const useRigOperationsQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<RigOperationInternal>({
    key: WELL_QUERY_KEY.RIG_OPERATIONS,
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getRigOperationsByWellbores({ wellboreIds, options })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_RIG_OPERATIONS_ERROR)
        ),
  });
};
