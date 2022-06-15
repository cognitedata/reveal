import isEmpty from 'lodash-es/isEmpty';
import isFinite from 'lodash-es/isFinite';
import {
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';
import {
  AnnotationsBadgeCounts,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import {
  isImageAssetLinkData,
  isImageExtractedTextData,
  isImageObjectDetectionBoundingBoxData,
  isImageObjectDetectionPolygonData,
  isImageKeypointCollectionData,
} from 'src/modules/Common/types/typeGuards';
import { AnnotationIdsByStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

export const getAnnotationLabelOrText = (
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string =>
  (annotation as ImageClassification).label ||
  (annotation as ImageObjectDetection).label ||
  (annotation as ImageKeypointCollection).label ||
  (annotation as ImageExtractedText).text ||
  (annotation as ImageAssetLink).text;

export const filterAnnotations = ({
  annotations,
  filter,
}: {
  annotations: VisionAnnotation<VisionAnnotationDataType>[];
  filter?: AnnotationFilterType;
}): VisionAnnotation<VisionAnnotationDataType>[] => {
  let filteredAnnotations = annotations;
  if (filter) {
    if (filter.annotationState) {
      filteredAnnotations = filteredAnnotations.filter(
        (item) => item.status === filter.annotationState
      );
    }
    if (filter.annotationLabelOrText) {
      filteredAnnotations = filteredAnnotations.filter(
        (annotation) =>
          getAnnotationLabelOrText(annotation) === filter.annotationLabelOrText
      );
    }
  }
  return filteredAnnotations;
};

export const filterAnnotationIdsByAnnotationStatus = (
  annotations: VisionAnnotation<VisionAnnotationDataType>[]
): AnnotationIdsByStatus => {
  const rejectedAnnotationIds: number[] = [];
  const acceptedAnnotationIds: number[] = [];
  const unhandledAnnotationIds: number[] = [];
  annotations.forEach((annotation) => {
    const annotationId = annotation.id;
    if (annotation.status === Status.Approved)
      acceptedAnnotationIds.push(annotationId);
    else if (annotation.status === Status.Rejected)
      rejectedAnnotationIds.push(annotationId);
    else unhandledAnnotationIds.push(annotationId);
  });
  return {
    rejectedAnnotationIds,
    acceptedAnnotationIds,
    unhandledAnnotationIds,
  };
};

export const filterAnnotationIdsByConfidence = (
  annotations: VisionAnnotation<VisionAnnotationDataType>[],
  rejectedThreshold: number,
  acceptedThreshold: number
): AnnotationIdsByStatus => {
  const rejectedAnnotationIds: number[] = [];
  const acceptedAnnotationIds: number[] = [];
  const unhandledAnnotationIds: number[] = [];
  annotations.forEach((annotation) => {
    const annotationId = annotation.id;
    const { confidence } = annotation;
    if (confidence !== undefined && isFinite(confidence)) {
      if (confidence > acceptedThreshold)
        acceptedAnnotationIds.push(annotationId);
      else if (confidence < rejectedThreshold)
        rejectedAnnotationIds.push(annotationId);
      else unhandledAnnotationIds.push(annotationId);
    } else {
      // Fallback to filter by status if there's no confidence value.
      // This is the case for manually labelled annotations.
      const filteredByStatus = filterAnnotationIdsByAnnotationStatus([
        annotation,
      ]);
      acceptedAnnotationIds.push(...filteredByStatus.acceptedAnnotationIds);
      rejectedAnnotationIds.push(...filteredByStatus.rejectedAnnotationIds);
      unhandledAnnotationIds.push(...filteredByStatus.unhandledAnnotationIds);
    }
  });
  return {
    rejectedAnnotationIds,
    acceptedAnnotationIds,
    unhandledAnnotationIds,
  };
};

const getAnnotationCountsPerInstanceLabel = (
  annotations: VisionAnnotation<
    | ImageObjectDetectionBoundingBox
    | ImageObjectDetectionPolygon
    | ImageKeypointCollection
  >[]
) => {
  const counts: { [text: string]: number } = {};

  annotations.forEach((item) => {
    counts[item.label] = 1 + (counts[item.label] || 0);
  });

  return counts;
};

export const getAnnotationsBadgeCounts = (
  annotations: VisionAnnotation<VisionAnnotationDataType>[]
): AnnotationsBadgeCounts => {
  const annotationsBadgeProps: AnnotationsBadgeCounts = {
    objects: 0,
    assets: 0,
    text: 0,
    gdpr: 0,
    mostFrequentObject: undefined,
  };

  if (annotations) {
    annotationsBadgeProps.text = annotations.filter((annotation) =>
      isImageExtractedTextData(annotation)
    ).length;
    annotationsBadgeProps.assets = annotations.filter((annotation) =>
      isImageAssetLinkData(annotation)
    ).length;
    annotationsBadgeProps.gdpr = annotations.filter(
      (annotation) =>
        (isImageObjectDetectionBoundingBoxData(annotation) ||
          isImageObjectDetectionPolygonData(annotation) ||
          isImageKeypointCollectionData(annotation)) &&
        annotation.label === 'person'
    ).length;

    const objects = annotations.reduce(
      (
        acc: VisionAnnotation<
          | ImageObjectDetectionBoundingBox
          | ImageObjectDetectionPolygon
          | ImageKeypointCollection
        >[],
        annotation
      ) => {
        if (
          (isImageObjectDetectionBoundingBoxData(annotation) ||
            isImageObjectDetectionPolygonData(annotation) ||
            isImageKeypointCollectionData(annotation)) &&
          annotation.label !== 'person'
        ) {
          return acc.concat(
            annotation as VisionAnnotation<
              | ImageObjectDetectionBoundingBox
              | ImageObjectDetectionPolygon
              | ImageKeypointCollection
            >
          );
        }
        return acc;
      },
      []
    );
    annotationsBadgeProps.objects = objects.length;

    const counts = getAnnotationCountsPerInstanceLabel(objects);
    annotationsBadgeProps.mostFrequentObject = Object.entries(counts).length
      ? Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))
      : undefined;
  }

  return annotationsBadgeProps;
};

export const generateKeypointId = (
  parentAnnotationId: string | number,
  keypointLabel: string
): string => {
  if (isEmpty(parentAnnotationId.toString()) || isEmpty(keypointLabel)) {
    throw Error(
      'Cannot generate keypointId. Parent annotation id or keypoint label not provided'
    );
  }
  return `${parentAnnotationId}-${keypointLabel}`;
};

export const createUniqueNumericId = (): number => {
  return Date.now();
};
