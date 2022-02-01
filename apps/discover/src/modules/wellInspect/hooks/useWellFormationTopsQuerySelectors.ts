import flatten from 'lodash/flatten';

import { useDeepMemo } from 'hooks/useDeep';
import { Sequence, SequenceData, WellboreId } from 'modules/wellSearch/types';

import { useWellFormationTopsQuery } from './useWellFormationTopsQuery';

export const useWellFormationTops = (wellboreIds: WellboreId[] = []) => {
  const { data } = useWellFormationTopsQuery(wellboreIds);
  return useDeepMemo(() => data || {}, [data]);
};

export const useWellFormationTopsWellboreIdMap = (
  wellboreIds?: WellboreId[]
): Record<Sequence['wellboreId'], SequenceData> => {
  const { data, isLoading } = useWellFormationTopsQuery(wellboreIds);

  return useDeepMemo(() => {
    if (!data) {
      return {};
    }

    return flatten(Object.values(data)).reduce(
      (sequenceIdMap, sequenceData) => ({
        ...sequenceIdMap,
        [sequenceData.sequence.wellboreId]: sequenceData,
      }),
      {} as Record<Sequence['id'], SequenceData>
    );
  }, [wellboreIds, data, isLoading]);
};
