import { AllCursorsProps } from 'domain/wells/types';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { useNdsEventsQuery } from '../queries/useNdsEventsQuery';
import { useNdsTvdDataQuery } from '../queries/useNdsTvdDataQuery';
import { mergeNdsTvdData } from '../transformers/mergeNdsTvdData';

export const useNdsWithTvdData = ({ wellboreIds }: AllCursorsProps) => {
  const { data: ndsData, isLoading: isNdsLoading } = useNdsEventsQuery({
    wellboreIds,
  });

  const { data: tvdData, isLoading: isTvdLoading } = useNdsTvdDataQuery(
    ndsData || []
  );

  const ndsWithTvdData = useDeepMemo(() => {
    if (!ndsData || isEmpty(ndsData) || !tvdData || isTvdLoading) {
      return EMPTY_ARRAY;
    }

    if (isEmpty(tvdData)) {
      return ndsData;
    }

    return ndsData.map((nds) => {
      const { wellboreMatchingId } = nds;
      const trueVerticalDepths = tvdData[wellboreMatchingId];

      if (!trueVerticalDepths) {
        return nds;
      }

      return mergeNdsTvdData(nds, trueVerticalDepths);
    });
  }, [ndsData, tvdData]);

  return {
    data: ndsWithTvdData,
    isLoading: isNdsLoading || isTvdLoading,
  };
};
