import { CogniteAnnotation } from '@cognite/annotations';
import {
  Annotation,
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';
import { useEffect, useMemo, useState } from 'react';
import { Popover } from '../components/Popover';
import { getAnnotationsFromCogniteAnnotation } from '../utils/getAnnotationsFromCogniteAnnotation';

export const useAnnotations = ({
  assetAnnotations,
  currentPage = 1,
}: {
  assetAnnotations: CogniteAnnotation[] | undefined;
  currentPage?: number;
}) => {
  const [clickedId, setClickedId] = useState<string | undefined>(undefined);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    const filteredAnnotations = assetAnnotations?.filter(
      (annotation) => annotation.page === currentPage
    );

    setAnnotations(
      getAnnotationsFromCogniteAnnotation(filteredAnnotations, clickedId).map(
        (assetAnnotation) => ({
          ...assetAnnotation,
          onClick: (e: any, annotation: Annotation) => {
            e.cancelBubble = true;
            setClickedId(annotation.id);
          },
        })
      )
    );
  }, [assetAnnotations, clickedId, currentPage]);

  const focusedAnnotationIndex = annotations.findIndex(
    (annotation) => annotation.id === clickedId
  );

  const popovers: TooltipConfig[] | undefined = useMemo(() => {
    const focusedAnnotation = annotations[focusedAnnotationIndex];
    if (focusedAnnotation === undefined) {
      return undefined;
    }

    const tooltipAnchors = [
      TooltipAnchorPosition.TOP,
      TooltipAnchorPosition.RIGHT,
      TooltipAnchorPosition.BOTTOM,
      TooltipAnchorPosition.LEFT,
    ];

    const anchorTo =
      tooltipAnchors[focusedAnnotationIndex % tooltipAnchors.length];

    return [
      {
        targetId: focusedAnnotation?.id,
        content: assetAnnotations ? (
          <Popover annotation={assetAnnotations[focusedAnnotationIndex]} />
        ) : (
          <>No Asset Annotations!</>
        ),
        anchorTo,
      },
    ];
  }, [focusedAnnotationIndex, annotations, assetAnnotations]);

  return { annotations, popovers, setClickedId };
};
