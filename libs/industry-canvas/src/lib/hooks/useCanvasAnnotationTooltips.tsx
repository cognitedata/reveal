import {
  AnnotationType,
  TooltipAnchorPosition,
} from '@cognite/unified-file-viewer';
import { useMemo } from 'react';
import {
  ShapeAnnotationTooltip,
  ShapeAnnotationTooltipProps,
} from '../components/ShapeAnnotationTooltip';
import { CanvasAnnotation } from '../types';

export type UseCanvasAnnotationTooltipsParams = {
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
} & ShapeAnnotationTooltipProps;

const useCanvasAnnotationTooltips = ({
  selectedCanvasAnnotation,
  ...shapeAnnotationTooltipProps
}: UseCanvasAnnotationTooltipsParams) => {
  return useMemo(() => {
    if (selectedCanvasAnnotation === undefined) {
      return [];
    }

    if (
      selectedCanvasAnnotation.type === AnnotationType.ELLIPSE ||
      selectedCanvasAnnotation.type === AnnotationType.RECTANGLE
    ) {
      return [
        {
          targetId: String(selectedCanvasAnnotation.id),
          content: <ShapeAnnotationTooltip {...shapeAnnotationTooltipProps} />,
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
          shouldPositionStrictly: true,
        },
      ];
    }

    throw new Error(
      `Unsupported annotation type: ${selectedCanvasAnnotation.type}`
    );
  }, [selectedCanvasAnnotation, shapeAnnotationTooltipProps]);
};

export default useCanvasAnnotationTooltips;
