import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import { AnnotationHoverPreview } from './AnnotationHoverPreview';

const useHoverTooltips = (
  isTooltipsEnabled: boolean,
  annotations: ExtendedAnnotation[],
  hoverId: string | undefined
) => {
  return useMemo(() => {
    if (!isTooltipsEnabled) {
      return [];
    }

    const hoveredAnnotation = annotations.find(
      ({ id: annotationId }) => String(annotationId) === hoverId
    );

    if (!hoveredAnnotation) {
      return [];
    }

    return [
      {
        targetId: String(hoveredAnnotation?.id),
        content: <AnnotationHoverPreview annotation={hoveredAnnotation} />,
        anchorTo: TooltipAnchorPosition.BOTTOM_CENTER,
      },
    ];
  }, [isTooltipsEnabled, hoverId, annotations]);
};

export default useHoverTooltips;
