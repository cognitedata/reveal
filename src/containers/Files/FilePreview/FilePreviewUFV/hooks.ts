import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';
import {
  Annotation,
  AnnotationType,
  getAnnotationsFromLegacyCogniteAnnotations,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';
import { LegacyCogniteAnnotation } from '@cognite/unified-file-viewer/dist/core/utils/api';
import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { CommonLegacyCogniteAnnotation } from './types';
import { getContainerId, getStyledAnnotationFromAnnotation } from './utils';
import { Colors } from '@cognite/cogs.js';

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
  const unhandledAnnotations = useMemo(() => {
    return annotations.filter(annotation => annotation.status === 'unhandled');
  }, [annotations]);
  const ufvAnnotationsWithEvents = useMemo(
    () =>
      annotations
        .map(annotation => {
          const [ufvAnnotation] = getAnnotationsFromLegacyCogniteAnnotations(
            [annotation as LegacyCogniteAnnotation],
            getContainerId(fileId)
          );

          if (ufvAnnotation === undefined) {
            return undefined;
          }

          const isSelected = selectedAnnotations.some(
            ({ id }) => id === annotation.id
          );
          const isPending = pendingAnnotations.some(
            ({ id }) => id === annotation.id
          );

          const isOnHover = hoverId === String(annotation.id);

          return getStyledAnnotationFromAnnotation(
            ufvAnnotation,
            isSelected,
            isPending,
            isOnHover,
            annotation
          );
        })
        .filter((item): item is Annotation => Boolean(item))
        .map(
          ufvAnnotation =>
            ({
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
            } as RectangleAnnotation)
        ),
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

  const ufvAnnotationsWithSuggestedStyles = ufvAnnotationsWithEvents.flatMap(
    ufvAnnotation => {
      const isSuggested = unhandledAnnotations.some(
        ({ id }) => String(id) === ufvAnnotation.id
      );
      if (isSuggested) {
        return addSuggestedStyleAnnotations(ufvAnnotation, fileId);
      }
      return ufvAnnotation;
    }
  );
  return ufvAnnotationsWithSuggestedStyles;
};

const URL_EXPIRATION_TIME_MS = 28 * 1000;

export const useFileDownloadUrl = (fileId: number | undefined): string => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  const queryKey = [...baseCacheKey('files'), 'downloadLink', fileId];

  const { data } = useQuery(
    queryKey,
    () =>
      fileId === undefined
        ? undefined
        : sdk.files.getDownloadUrls([{ id: fileId }]).then(r => r[0]),
    // The retrieved URL becomes invalid after 30 seconds
    {
      onSuccess: () => {
        setTimeout(() => {
          queryClient.removeQueries(queryKey);
        }, URL_EXPIRATION_TIME_MS);
      },
    }
  );

  return data?.downloadUrl || '';
};

const addSuggestedStyleAnnotations = (
  annotation: RectangleAnnotation,
  fileId: number
): Annotation[] => {
  return [
    annotation,
    {
      containerId: annotation.containerId || getContainerId(fileId),
      id: `${annotation.id}-suggested`,
      radius: 0.01,
      style: {
        fill: Colors['decorative--red--400'],
        stroke: Colors['decorative--grayscale--100'],
        strokeWidth: 3,
      },
      type: AnnotationType.ELLIPSE,
      x: annotation.x + annotation.width,
      y: annotation.y,
    },
  ];
};
