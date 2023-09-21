import { useMemo } from 'react';

import { useFlag } from '@cognite/react-feature-flags';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import useFileLinkTooltips from './useFileLinkTooltips';
import useHoverTooltips from './useHoverTooltips';
import useOverlappingAnnotationsTooltips from './useOverlappingAnnotationsTooltips';

const useTooltips = ({
  isTooltipsEnabled,
  fileId,
  annotations,
  hoverId,
  selectedAnnotations,
  selectAnnotation,
}: {
  isTooltipsEnabled: boolean;
  fileId: number;
  annotations: ExtendedAnnotation[];
  hoverId: string | undefined;
  selectedAnnotations: ExtendedAnnotation[];
  selectAnnotation: (annotation: ExtendedAnnotation) => void;
}) => {
  const { isEnabled: isIndustryCanvasEnabled } = useFlag(
    'UFV_INDUSTRY_CANVAS',
    {
      forceRerender: true,
      fallback: false,
    }
  );

  const hoverTooltips = useHoverTooltips(
    isTooltipsEnabled,
    annotations,
    hoverId
  );

  const overlappingAnnotationsTooltips = useOverlappingAnnotationsTooltips(
    isTooltipsEnabled,
    annotations,
    selectedAnnotations,
    selectAnnotation
  );

  const fileLinkTooltips = useFileLinkTooltips(
    isIndustryCanvasEnabled,
    fileId,
    annotations,
    selectedAnnotations
  );

  return useMemo(() => {
    return [
      ...hoverTooltips,
      ...overlappingAnnotationsTooltips,
      ...fileLinkTooltips,
    ];
  }, [hoverTooltips, overlappingAnnotationsTooltips, fileLinkTooltips]);
};

export default useTooltips;
