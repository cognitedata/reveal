import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors/handleServiceError';

import { NptAggregateEnum } from '@cognite/sdk-wells';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { ERROR_LOADING_NPT_AGGREGATES_ERROR } from '../../service/constants';
import { getNptAggregates } from '../../service/network/getNptAggregates';
import { normalizeNptAggregates } from '../transformers/normalizeNptAggregates';
import { NptAggregateRowInternal } from '../types';

export const useNptAggregatesByCodeQuery = ({
  wellboreIds,
}: AllCursorsProps) => {
  return useArrayCache<NptAggregateRowInternal>({
    key: WELL_QUERY_KEY.NPT_AGGREGATES_BY_CODE,
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds) =>
      getNptAggregates({ wellboreIds, groupBy: [NptAggregateEnum.Code] })
        .then(normalizeNptAggregates)
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_NPT_AGGREGATES_ERROR)
        ),
  });
};
