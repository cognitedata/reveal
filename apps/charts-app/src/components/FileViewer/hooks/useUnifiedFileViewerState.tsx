import { CogniteAnnotation } from '@cognite/annotations';
import {
  Annotation,
  OCRAnnotation,
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';
import { useEffect, useMemo, useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { AnnotationPopover } from '../components/AnnotationPopover';
import { styleForSelected } from '../constants';
import { AnnotationModel } from '../sdk/sdkTypes';
import { ExtendedAnnotation } from '../types';
import { getExtendedAnnotationsFromSVGAnnotations } from '../utils/getExtendedAnnotationsFromSVGAnnotations';
import getExtendedAnnotationsFromAnnotationsApi from '../utils/getExtendedAnnotationsFromAnnotationsApi';
import { getExtendedAnnotationsFromCogniteAnnotation } from '../utils/getExtendedAnnotationsFromCogniteAnnotation';
import { getExtendedAnnotationsFromOCRAnnotations } from '../utils/getExtendedAnnotationsFromOCRAnnotations';
import { getContainerId } from '../utils/getContainerId';

/**
 * @param file Selected file
 * @param assetAnnotationsFromEvents Asset annotations get by Events API
 * @param assetAnnotationsFromAnnotations Asset annotations get by Annotation API
 * @param extractedAnnotations Annotations extracted by File (eg: SVG)
 * @param ocrSearchResultAnnotations Filtered OCR Annotations by input string
 * @param currentPage Active page number. Default is 1
 */
type UnifiedFileViewerStateProps = {
  file: FileInfo | undefined;
  annotationsFromEvents?: CogniteAnnotation[];
  annotationsFromAnnotations?: AnnotationModel[];
  extractedAnnotations?: Annotation[];
  ocrSearchResultAnnotations: OCRAnnotation[];
  currentPage?: number;
};

export const useUnifiedFileViewerState = ({
  file,
  annotationsFromEvents,
  annotationsFromAnnotations,
  extractedAnnotations,
  ocrSearchResultAnnotations,
  currentPage = 1,
}: UnifiedFileViewerStateProps): {
  annotations: Annotation[];
  popovers: TooltipConfig[] | undefined;
  onStageClick: () => void;
} => {
  const { id: fileId } = file || {};
  const [clickedId, setClickedId] = useState<string | undefined>(undefined);
  const [annotations, setAnnotations] = useState<ExtendedAnnotation[]>([]);

  useEffect(() => {
    if (fileId) {
      setAnnotations(
        [
          ...getExtendedAnnotationsFromCogniteAnnotation(
            annotationsFromEvents,
            getContainerId(fileId)
          ),
          ...getExtendedAnnotationsFromAnnotationsApi(
            annotationsFromAnnotations || [],
            getContainerId(fileId)
          ),
          ...getExtendedAnnotationsFromSVGAnnotations(
            extractedAnnotations || [],
            getContainerId(fileId)
          ),
          ...getExtendedAnnotationsFromOCRAnnotations(
            ocrSearchResultAnnotations,
            getContainerId(fileId)
          ),
        ]
          .filter((annotation) =>
            annotation.metadata?.page
              ? // search results annotations don't have metadata or a page number
                annotation.metadata?.page === currentPage
              : true
          )
          .map((extendedAnnotation) => ({
            ...extendedAnnotation,
            onClick: (e: any, annotation: Annotation) => {
              e.cancelBubble = true;
              setClickedId(annotation.id);
            },
            style:
              `${extendedAnnotation.id}` === clickedId
                ? styleForSelected
                : extendedAnnotation.style,
          }))
      );
    }
  }, [
    fileId,
    annotationsFromEvents,
    annotationsFromAnnotations,
    extractedAnnotations,
    ocrSearchResultAnnotations,
    clickedId,
    currentPage,
  ]);

  // reset clicked ID when switching files or switching page
  useEffect(() => {
    setClickedId(undefined);
  }, [fileId, currentPage]);

  const popovers = useMemo<TooltipConfig[] | undefined>(() => {
    if (!clickedId) {
      return undefined;
    }

    const focusedAnnotation = annotations.find(
      (annotation) => annotation.id === clickedId
    );

    if (focusedAnnotation) {
      return [
        {
          targetId: `${focusedAnnotation.id}`,
          content: (
            <AnnotationPopover
              resourceId={focusedAnnotation.metadata.resourceId}
              label={focusedAnnotation.metadata.label}
            />
          ),
          anchorTo: TooltipAnchorPosition.BOTTOM,
        },
      ];
    }

    return undefined;
  }, [clickedId]);

  const onStageClick = () => {
    setClickedId(undefined);
  };

  return { annotations, popovers, onStageClick };
};
