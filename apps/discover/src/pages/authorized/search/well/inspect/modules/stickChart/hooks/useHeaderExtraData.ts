import { useWellboreRigNamesMap } from 'domain/wells/rigOperations/internal/hooks/useWellboreRigNamesMap';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { HeaderExtraData } from '../types';

export const useHeaderExtraData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data: rigNamesData } = useWellboreRigNamesMap({
    wellboreIds,
  });

  return useDeepMemo(() => {
    return wellboreIds.reduce((headerExtraData, wellboreMatchingId) => {
      return {
        ...headerExtraData,
        [wellboreMatchingId]: {
          rigNames: rigNamesData[wellboreMatchingId],
        },
      };
    }, {} as Record<string, HeaderExtraData>);
  }, [wellboreIds, rigNamesData]);
};
