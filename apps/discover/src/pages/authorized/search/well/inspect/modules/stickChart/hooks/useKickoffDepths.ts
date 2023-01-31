import { useWellInspectWellbores } from 'domain/wells/well/internal/hooks/useWellInspectWellbores';
import { useWellboresKickoffDepthsQuery } from 'domain/wells/wellbore/internal/queries/useWellboresKickoffDepthsQuery';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';
import { KickoffDepth } from 'domain/wells/wellbore/internal/types';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

export const useKickoffDepths = () => {
  const wellbores = useWellInspectWellbores();

  const { data, isLoading } = useWellboresKickoffDepthsQuery(wellbores);

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, KickoffDepth>,
        isLoading,
      };
    }

    return {
      data: keyByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
