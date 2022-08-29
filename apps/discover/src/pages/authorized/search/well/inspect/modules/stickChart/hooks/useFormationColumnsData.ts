import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';
import { useWellTopsQuery } from 'domain/wells/wellTops/internal/queries/useWellTopsQuery';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { WellTopSurfaceView } from '../types';
import { adaptWellTopSurfacesToView } from '../utils/adaptWellTopSurfacesToView';

import { useMaxDepths } from './useMaxDepths';

export const useFormationColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useWellTopsQuery({ wellboreIds });
  const { data: maxDepths } = useMaxDepths();

  return useDeepMemo(() => {
    if (!data || isEmpty(maxDepths)) {
      return {
        data: EMPTY_OBJECT as Record<string, WellTopSurfaceView[]>,
        isLoading,
      };
    }

    const wellTopSurfaces = data.flatMap(
      ({ wellboreMatchingId, measuredDepthUnit, tops }) => {
        return adaptWellTopSurfacesToView(
          wellboreMatchingId,
          measuredDepthUnit,
          tops,
          maxDepths[wellboreMatchingId]
        );
      }
    );

    return {
      data: groupByWellbore(wellTopSurfaces),
      isLoading: false,
    };
  }, [data, isLoading, maxDepths]);
};
