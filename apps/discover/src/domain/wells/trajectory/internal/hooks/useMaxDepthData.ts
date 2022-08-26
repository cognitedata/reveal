import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import head from 'lodash/head';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { useTrajectoriesQuery } from '../queries/useTrajectoriesQuery';
import { sortTrajectoriesByMaxMeasuredDepth } from '../transformers/sortTrajectoriesByMaxMeasuredDepth';
import { MaxDepthData } from '../types';

export const useMaxDepthData = ({ wellboreIds }: AllCursorsProps) => {
  const { data, isLoading } = useTrajectoriesQuery({ wellboreIds });
  const { data: depthUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    if (!data || isLoading) {
      return {
        data: EMPTY_ARRAY as MaxDepthData[],
        isLoading,
      };
    }

    const groupedData = groupByWellbore(data);

    const maxDepthData: MaxDepthData[] = Object.keys(groupedData).map(
      (wellboreMatchingId) => {
        const trajectory = head(
          sortTrajectoriesByMaxMeasuredDepth(groupedData[wellboreMatchingId])
        );

        return {
          wellboreMatchingId,
          maxMeasuredDepth: trajectory?.maxMeasuredDepth || 0,
          maxTrueVerticalDepth: trajectory?.maxTrueVerticalDepth || 0,
          depthUnit,
        };
      }
    );

    return {
      data: maxDepthData,
      isLoading,
    };
  }, [data, isLoading]);
};
