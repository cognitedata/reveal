import { useMemo } from 'react';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { useFlag } from '@cognite/react-feature-flags';

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
  const { isEnabled: isCanvasEnabled } = useFlag('UFV_CANVAS', {
    forceRerender: true,
    fallback: false,
  });

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
    isCanvasEnabled,
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
