import { useMaxDepthData } from 'domain/wells/trajectory/internal/hooks/useMaxDepthData';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMaxDepths = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useMaxDepthData({ wellboreIds });

  return useDeepMemo(() => {
    return {
      data: keyByWellbore(data),
      isLoading,
    };
  }, [data, isLoading]);
};
