import { useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';
import {
  filterNonOverlappingBoundingBoxes,
  isSimilarBoundingBox,
} from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useAnnotations } from '@data-exploration-lib/domain-layer';

import { isNotUndefined } from '../../../utils';

import getExtendedAnnotationsFromAnnotationsApi from './Annotations/getExtendedAnnotationsFromAnnotationsApi';
import {
  getExtendedAnnotationPage,
  isRejectedAnnotation,
} from './migration/utils';
import { getContainerId, getStyledAnnotationFromAnnotation } from './utils';

// The maximum difference the corresponding sides of two bounding boxes may
// have. If all differences are below this value, for all sides of the bounding
// box, the two bounding boxes are considered to be similar.
const MAX_BOUNDING_BOX_DIFFERENCE = 0.1;

type useUnifiedFileViewerAnnotationsProps = {
  fileId: number;
  page: number;
  selectedAnnotations: ExtendedAnnotation[];
  pendingAnnotations: ExtendedAnnotation[];
  hoverId: string | undefined;
  onMouseOver?: (annotation: ExtendedAnnotation) => void;
  onMouseOut?: (annotation: ExtendedAnnotation) => void;
  onClick?: (annotation: ExtendedAnnotation) => void;
};
export const useUnifiedFileViewerAnnotations = ({
  fileId,
  page,
  selectedAnnotations,
  pendingAnnotations,
  hoverId,
  onClick,
  onMouseOver,
  onMouseOut,
}: useUnifiedFileViewerAnnotationsProps): ExtendedAnnotation[] => {
  const annotationsApiAnnotations = useAnnotations(fileId).data;
  return useMemo(
    () =>
      [
        ...getExtendedAnnotationsFromAnnotationsApi(
          annotationsApiAnnotations,
          getContainerId(fileId)
        ),
        ...filterNonOverlappingBoundingBoxes(
          pendingAnnotations,
          isSimilarBoundingBox(MAX_BOUNDING_BOX_DIFFERENCE)
        ),
      ]
        .filter((annotation) => !isRejectedAnnotation(annotation))
        .filter((annotation) => {
          if (page === 1) {
            return (
              getExtendedAnnotationPage(annotation) === 1 ||
              getExtendedAnnotationPage(annotation) === undefined
            );
          }

          return getExtendedAnnotationPage(annotation) === page;
        })
        .filter(isNotUndefined)
        .map((annotation) => {
          const isSelected = selectedAnnotations.some(
            ({ id }) => id === annotation.id
          );
          const isPending = pendingAnnotations.some(
            ({ id }) => id === annotation.id
          );

          // TODO: Validate that this is working correctly
          const isOnHover = hoverId === String(annotation.id);

          return getStyledAnnotationFromAnnotation(
            annotation,
            isSelected,
            isPending,
            isOnHover
          );
        })
        .map(
          (annotation) =>
            ({
              ...annotation,
              onClick: (e: any, annotation: ExtendedAnnotation) => {
                e.cancelBubble = true;
                if (onClick) {
                  onClick(annotation);
                }
              },
              onMouseOver: (e: any, annotation: ExtendedAnnotation) => {
                e.cancelBubble = true;
                if (onMouseOver) {
                  onMouseOver(annotation);
                }
              },
              onMouseOut: (e: any, annotation: ExtendedAnnotation) => {
                e.cancelBubble = true;
                if (onMouseOut) {
                  onMouseOut(annotation);
                }
              },
            } as ExtendedAnnotation)
        ),
    [
      onClick,
      onMouseOver,
      onMouseOut,
      selectedAnnotations,
      fileId,
      hoverId,
      pendingAnnotations,
      annotationsApiAnnotations,
      page,
    ]
  );
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
        : sdk.files.getDownloadUrls([{ id: fileId }]).then((r) => r[0]),
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
