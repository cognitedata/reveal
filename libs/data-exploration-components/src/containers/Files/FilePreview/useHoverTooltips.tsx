import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { AnnotationHoverPreview } from './AnnotationHoverPreview';

import { useMemo } from 'react';

const useHoverTooltips = (
  isTooltipsEnabled: boolean,
  annotations: ExtendedAnnotation[],
  hoverId: string | undefined
) => {
  return useMemo(() => {
    if (!isTooltipsEnabled) {
      return [];
    }

    const focusedAnnotation = annotations.find(
      ({ id: annotationId }) => String(annotationId) === hoverId
    );

    if (!focusedAnnotation) {
      return [];
    }

    return [
      {
        targetId: String(focusedAnnotation?.id),
        content: <AnnotationHoverPreview annotation={focusedAnnotation} />,
        anchorTo: TooltipAnchorPosition.BOTTOM_CENTER,
      },
    ];
  }, [isTooltipsEnabled, hoverId, annotations]);
};

export default useHoverTooltips;
