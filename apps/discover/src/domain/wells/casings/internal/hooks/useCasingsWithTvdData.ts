import { AllCursorsProps } from 'domain/wells/types';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { useCasingSchematicsQuery } from '../queries/useCasingSchematicsQuery';
import { useCasingsTvdDataQuery } from '../queries/useCasingsTvdDataQuery';
import { mergeCasingsTvdData } from '../transformers/mergeCasingsTvdData';

export const useCasingsWithTvdData = ({ wellboreIds }: AllCursorsProps) => {
  const { data: casingsData, isLoading: isCasingsLoading } =
    useCasingSchematicsQuery({
      wellboreIds,
    });

  const { data: tvdData, isLoading: isTvdLoading } = useCasingsTvdDataQuery(
    casingsData || []
  );

  const casingsWithTvdData = useDeepMemo(() => {
    if (!casingsData || isEmpty(casingsData) || !tvdData || isTvdLoading) {
      return EMPTY_ARRAY;
    }

    if (isEmpty(tvdData)) {
      return casingsData;
    }

    return casingsData.map((casingSchematic) => {
      const { wellboreMatchingId } = casingSchematic;
      const trueVerticalDepths = tvdData[wellboreMatchingId];

      if (!trueVerticalDepths) {
        return casingSchematic;
      }

      return mergeCasingsTvdData(casingSchematic, trueVerticalDepths);
    });
  }, [casingsData, tvdData]);

  return {
    data: casingsWithTvdData,
    isLoading: isCasingsLoading || isTvdLoading,
  };
};
