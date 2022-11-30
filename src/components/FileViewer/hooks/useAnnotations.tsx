import { CogniteAnnotation } from '@cognite/annotations';
import {
  Annotation,
  RectangleAnnotation,
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';
import { useEffect, useMemo, useState } from 'react';
import { AnnotationPopover } from '../components/AnnotationPopover';
import { styleForSelected } from '../constants';
import { getAnnotationsFromCogniteAnnotation } from '../utils/getAnnotationsFromCogniteAnnotation';

const getPopovers = ({
  annotationId,
  assetId,
  assetName,
  anchorTo,
}: {
  annotationId: number | string;
  assetId?: number;
  assetName?: string;
  anchorTo: TooltipAnchorPosition;
}) => [
  {
    targetId: `${annotationId}`,
    content: <AnnotationPopover resourceId={assetId} label={assetName} />,
    anchorTo,
  },
];

/**
 * @param assetAnnotations Asset annotations get by annotation API
 * @param extractedAnnotations Annotations extracted by File (eg: SVG)
 */
export const useAnnotations = ({
  assetAnnotations,
  extractedAnnotations,
  currentPage = 1,
}: {
  assetAnnotations: CogniteAnnotation[] | undefined;
  extractedAnnotations: Annotation[];
  currentPage?: number;
}) => {
  const [clickedId, setClickedId] = useState<string | undefined>(undefined);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    const filteredAnnotations = assetAnnotations?.filter(
      (annotation) => annotation.page === currentPage
    );

    const convertedAnnotations =
      getAnnotationsFromCogniteAnnotation(filteredAnnotations);

    setAnnotations(
      [...convertedAnnotations, ...extractedAnnotations].map(
        (uFVAnnotation) =>
          ({
            ...uFVAnnotation,
            onClick: (e: any, annotation: Annotation) => {
              e.cancelBubble = true;
              setClickedId(annotation.id);
            },
            style:
              `${uFVAnnotation.id}` === clickedId
                ? styleForSelected
                : uFVAnnotation.style,
          } as RectangleAnnotation)
      )
    );
  }, [assetAnnotations, extractedAnnotations, clickedId, currentPage]);

  const focusedAnnotationIndex = annotations.findIndex(
    (annotation) => annotation.id === clickedId
  );

  const popovers: TooltipConfig[] | undefined = useMemo(() => {
    const tooltipAnchors = [
      TooltipAnchorPosition.TOP,
      TooltipAnchorPosition.RIGHT,
      TooltipAnchorPosition.BOTTOM,
      TooltipAnchorPosition.LEFT,
    ];
    const anchorTo =
      tooltipAnchors[focusedAnnotationIndex % tooltipAnchors.length];

    if (!clickedId) {
      return undefined;
    }

    const focusedAssetAnnotation = assetAnnotations?.find(
      (annotation) => annotation.id === Number(clickedId)
    );

    // Asset annotation has focused
    if (focusedAssetAnnotation) {
      const selectedAssetId =
        focusedAssetAnnotation?.resourceType === 'asset' &&
        focusedAssetAnnotation.resourceId;

      if (selectedAssetId) {
        return getPopovers({
          annotationId: focusedAssetAnnotation.id,
          assetId: selectedAssetId,
          anchorTo,
        });
      }
    }

    const focusedExtractedSvgAnnotation = extractedAnnotations.find(
      (annotation) => annotation.id === clickedId
    );

    // Extracted Svg annotation has focused
    if (focusedExtractedSvgAnnotation) {
      // for SVGs asset name is the annotation id
      return getPopovers({
        annotationId: focusedExtractedSvgAnnotation.id,
        assetName: focusedExtractedSvgAnnotation.id,
        anchorTo,
      });
    }
    return undefined;
  }, [focusedAnnotationIndex, assetAnnotations, extractedAnnotations]);

  return { annotations, popovers, setClickedId };
};
