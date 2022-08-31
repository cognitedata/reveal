import { AllCursorsProps } from 'domain/wells/types';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { useNptEventsQuery } from '../queries/useNptEventsQuery';
import { useNptTvdDataQuery } from '../queries/useNptTvdDataQuery';
import { mergeNptTvdData } from '../transformers/mergeNptTvdData';

export const useNptWithTvdData = ({ wellboreIds }: AllCursorsProps) => {
  const { data: nptData, isLoading: isNptLoading } = useNptEventsQuery({
    wellboreIds,
  });

  const { data: tvdData, isLoading: isTvdLoading } = useNptTvdDataQuery(
    nptData || []
  );

  const nptWithTvdData = useDeepMemo(() => {
    if (!nptData || isEmpty(nptData) || !tvdData || isTvdLoading) {
      return EMPTY_ARRAY;
    }

    if (isEmpty(tvdData)) {
      return nptData;
    }

    return nptData.map((npt) => {
      const { wellboreMatchingId } = npt;
      const trueVerticalDepths = tvdData[wellboreMatchingId];

      if (!trueVerticalDepths) {
        return npt;
      }

      return mergeNptTvdData(npt, trueVerticalDepths);
    });
  }, [nptData, tvdData, isTvdLoading]);

  return {
    data: nptWithTvdData,
    isLoading: isNptLoading || isTvdLoading,
  };
};
