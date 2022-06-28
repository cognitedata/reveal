import { AllCursorsProps } from 'domain/wells/types';

import { useMemo } from 'react';

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

  const ndsWithTvdData = useMemo(() => {
    if (!ndsData) {
      return [];
    }

    return ndsData.map((nds) => {
      const { wellboreMatchingId } = nds;
      return mergeNdsTvdData(nds, tvdData[wellboreMatchingId]);
    });
  }, [ndsData, tvdData]);

  return {
    data: ndsWithTvdData,
    isLoading: isNdsLoading || isTvdLoading,
  };
};
