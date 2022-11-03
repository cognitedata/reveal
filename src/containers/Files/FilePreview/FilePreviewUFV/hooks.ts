import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';
import {
  Annotation,
  AnnotationType,
  getAnnotationsFromLegacyCogniteAnnotations,
} from '@cognite/unified-file-viewer';
import { LegacyCogniteAnnotation } from '@cognite/unified-file-viewer/dist/core/utils/api';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { CommonLegacyCogniteAnnotation } from './types';
import { getContainerId, getStyledAnnotationFromAnnotation } from './utils';

const applyHoverStylesToAnnotation = (
  annotation: Annotation,
  hoverId: string | undefined
): Annotation => {
  if (annotation.type !== AnnotationType.RECTANGLE) {
    return annotation;
  }

  const isOnHover = hoverId == annotation.id;
  return {
    ...annotation,
    style: {
      ...annotation.style,
      fill: isOnHover
        ? `${annotation.style?.stroke}22`
        : `${annotation.style?.fill || 'transparent'}`,
    },
  };
};

type useUnifiedFileViewerAnnotationsProps = {
  fileId: number;
  annotations: CommonLegacyCogniteAnnotation[];
  selectedAnnotations: CommonLegacyCogniteAnnotation[];
  pendingAnnotations: CommonLegacyCogniteAnnotation[];
  hoverId: string | undefined;
  onMouseOver?: (annotation: Annotation) => void;
  onMouseOut?: (annotation: Annotation) => void;
  onClick?: (annotation: Annotation) => void;
};
export const useUnifiedFileViewerAnnotations = ({
  fileId,
  annotations,
  selectedAnnotations,
  pendingAnnotations,
  hoverId,
  onClick,
  onMouseOver,
  onMouseOut,
}: useUnifiedFileViewerAnnotationsProps): Annotation[] => {
  const ufvAnnotationsWithEvents = useMemo(
    () =>
      annotations
        .map(annotation => {
          const [ufvAnnotation] = getAnnotationsFromLegacyCogniteAnnotations(
            [annotation as LegacyCogniteAnnotation],
            getContainerId(fileId)
          );

          const isSelected = selectedAnnotations.some(
            ({ id }) => id === annotation.id
          );
          const isPending = pendingAnnotations.some(
            ({ id }) => id == annotation.id
          );

          return getStyledAnnotationFromAnnotation(
            ufvAnnotation,
            isSelected,
            isPending,
            annotation
          );
        })
        .map(annotation => applyHoverStylesToAnnotation(annotation, hoverId))
        .map(ufvAnnotation => ({
          ...ufvAnnotation,
          onClick: (e: any, annotation: Annotation) => {
            e.cancelBubble = true;
            if (onClick) {
              onClick(annotation);
            }
          },
          onMouseOver: (e: any, annotation: Annotation) => {
            e.cancelBubble = true;
            if (onMouseOver) {
              onMouseOver(annotation);
            }
          },
          onMouseOut: (e: any, annotation: Annotation) => {
            e.cancelBubble = true;
            if (onMouseOut) {
              onMouseOut(annotation);
            }
          },
        })),
    [
      onClick,
      onMouseOver,
      onMouseOut,
      annotations,
      selectedAnnotations,
      fileId,
      hoverId,
      pendingAnnotations,
    ]
  );
  return ufvAnnotationsWithEvents;
};

export const useFileDownloadUrl = (fileId: number | undefined): string => {
  const sdk = useSDK();

  const { data } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', fileId],
    () =>
      fileId === undefined
        ? undefined
        : sdk.files.getDownloadUrls([{ id: fileId }]).then(r => r[0]),
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  return data?.downloadUrl || '';
};
