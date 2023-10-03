import { useEffect, useMemo, useState } from 'react';

import { FileInfo, AnnotationModel } from '@cognite/sdk';
import {
  Annotation,
  OCRAnnotation,
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';

import { AnnotationPopover } from '../components/AnnotationPopover';
import { styleForSelected } from '../constants';
import { defaultTranslations as FileViewerDefaultTranslations } from '../FileViewer';
import { ExtendedAnnotation } from '../types';
import { getContainerId } from '../utils/getContainerId';
import getExtendedAnnotationsFromAnnotationsApi from '../utils/getExtendedAnnotationsFromAnnotationsApi';
import { getExtendedAnnotationsFromOCRAnnotations } from '../utils/getExtendedAnnotationsFromOCRAnnotations';
import { getExtendedAnnotationsFromSVGAnnotations } from '../utils/getExtendedAnnotationsFromSVGAnnotations';

/**
 * @param file Selected file
 * @param assetAnnotationsFromAnnotations Asset annotations get by Annotation API
 * @param extractedAnnotations Annotations extracted by File (eg: SVG)
 * @param ocrSearchResultAnnotations Filtered OCR Annotations by input string
 * @param currentPage Active page number. Default is 1
 */
type UnifiedFileViewerStateProps = {
  file: FileInfo | undefined;
  annotationsFromAnnotations?: AnnotationModel[];
  extractedAnnotations?: Annotation[];
  ocrSearchResultAnnotations: OCRAnnotation[];
  currentPage?: number;
  translations: typeof FileViewerDefaultTranslations;
};

export const useUnifiedFileViewerState = ({
  file,
  annotationsFromAnnotations,
  extractedAnnotations,
  ocrSearchResultAnnotations,
  currentPage = 1,
  translations: t,
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
          targetIds: [`${focusedAnnotation.id}`],
          content: (
            <AnnotationPopover
              resourceId={focusedAnnotation.metadata.resourceId}
              label={focusedAnnotation.metadata.label}
              annotationTitle={t['Time series']}
              fallbackText={t['Asset not found']}
              noResourceLabelText={t['No resource id or name present']}
            />
          ),
          anchorTo: TooltipAnchorPosition.BOTTOM_CENTER,
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
