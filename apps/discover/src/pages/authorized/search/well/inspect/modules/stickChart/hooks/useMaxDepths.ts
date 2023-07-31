import { useMaxDepthData } from 'domain/wells/trajectory/internal/hooks/useMaxDepthData';
import { useMaxDepthDataUnified } from 'domain/wells/trajectory/internal/hooks/useMaxDepthDataUnified';
import { useWellInspectWellbores } from 'domain/wells/well/internal/hooks/useWellInspectWellbores';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { DepthMeasurementUnit } from 'constants/units';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMaxDepths = ({
  isUnifiedScale,
  depthMeasurementType,
}: {
  isUnifiedScale: boolean;
  depthMeasurementType: DepthMeasurementUnit;
}) => {
  const wellbores = useWellInspectWellbores();
  const wellboreIds = useWellInspectWellboreIds();

  const { data: maxDepthsUnified, isLoading: isMaxDepthsUnifiedLoading } =
    useMaxDepthDataUnified({ wellbores, depthMeasurementType });

  const { data: maxDepths, isLoading: isMaxDepthsLoading } = useMaxDepthData({
    wellboreIds,
  });

  if (isUnifiedScale) {
    return {
      data: keyByWellbore(maxDepthsUnified),
      isLoading: isMaxDepthsUnifiedLoading,
    };
  }

  return {
    data: keyByWellbore(maxDepths),
    isLoading: isMaxDepthsLoading,
  };
};
