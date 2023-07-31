import { useMaxDepthData } from 'domain/wells/trajectory/internal/hooks/useMaxDepthData';
import { MaxDepthData } from 'domain/wells/trajectory/internal/types';
import { getDefaultMaxDepthData } from 'domain/wells/trajectory/internal/utils/getDefaultMaxDepthData';
import { useWellboresByWellIds } from 'domain/wells/wellbore/internal/hooks/useWellboresByWellIds';
import { getWellMatchingIds } from 'domain/wells/wellbore/internal/selectors/getWellMatchingIds';
import { groupByWellMatchingId } from 'domain/wells/wellbore/internal/transformers/groupByWellMatchingId';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import maxBy from 'lodash/maxBy';

import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

type WellboreType = Pick<WellboreInternal, 'matchingId' | 'wellMatchingId'>;

export const useMaxDepthDataUnified = <T extends WellboreType>({
  wellbores,
  depthMeasurementType,
}: {
  wellbores: T[];
  depthMeasurementType: DepthMeasurementUnit;
}) => {
  const { data: depthUnit } = useUserPreferencesMeasurement();

  const wellMatchingIds = useDeepMemo(() => {
    return getWellMatchingIds(wellbores);
  }, [wellbores]);

  const { data: fetchedWellbores, isLoading: isWellboresLoading } =
    useWellboresByWellIds(wellMatchingIds);

  const wellboreIds = useMemo(() => {
    if (isWellboresLoading) {
      return EMPTY_ARRAY;
    }
    return fetchedWellbores.map(({ matchingId }) => matchingId);
  }, [fetchedWellbores]);

  const { data, isLoading } = useMaxDepthData({ wellboreIds });

  const groupedMaxDepths = useDeepMemo(() => {
    if (isEmpty(data) || isLoading) {
      return EMPTY_OBJECT as Record<string, MaxDepthData[]>;
    }

    const keyedData = keyByWellbore(data);
    const groupedWellbores = groupByWellMatchingId(fetchedWellbores);

    return wellbores.reduce((result, { matchingId, wellMatchingId }) => {
      const wellboresOfWell = groupedWellbores[wellMatchingId] || EMPTY_ARRAY;
      const maxDepths = wellboresOfWell.map(({ matchingId: wellboreId }) => {
        return (
          keyedData[wellboreId] || getDefaultMaxDepthData(wellboreId, depthUnit)
        );
      });

      return {
        ...result,
        [matchingId]: maxDepths,
      };
    }, {} as Record<string, MaxDepthData[]>);
  }, [data, fetchedWellbores, depthUnit]);

  const processedData: MaxDepthData[] = useMemo(() => {
    const accessor: keyof MaxDepthData =
      depthMeasurementType === DepthMeasurementUnit.MD
        ? 'maxMeasuredDepth'
        : 'maxTrueVerticalDepth';

    return Object.entries(groupedMaxDepths).map(
      ([wellboreMatchingId, maxDepths]) => {
        return {
          ...(maxBy(maxDepths, accessor) ||
            getDefaultMaxDepthData(wellboreMatchingId, depthUnit)),
          wellboreMatchingId,
        };
      }
    );
  }, [groupedMaxDepths, depthMeasurementType]);

  return {
    data: processedData,
    isLoading: isLoading || isWellboresLoading,
  };
};
