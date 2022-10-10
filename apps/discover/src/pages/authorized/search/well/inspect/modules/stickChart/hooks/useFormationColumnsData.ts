import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';
import { useWellTopsQuery } from 'domain/wells/wellTops/internal/queries/useWellTopsQuery';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { WellTopSurfaceView } from '../types';
import { adaptWellTopSurfacesToView } from '../utils/adaptWellTopSurfacesToView';

export const useFormationColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useWellTopsQuery({ wellboreIds });

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
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
          tops
        );
      }
    );

    return {
      data: groupByWellbore(wellTopSurfaces),
      isLoading: false,
    };
  }, [data, isLoading]);
};
