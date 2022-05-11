import {
  AnnotatedResourceId,
  CDFAnnotationV2,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';
import {
  AnnotationsBadgeCounts,
  CDFInheritedFields,
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

export const createVisionAnnotationStub = <T>({
  id,
  createdTime,
  lastUpdatedTime,
  status = Status.Suggested,
  resourceId,
  data,
}: {
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
  status: Status;
  resourceId: AnnotatedResourceId;
  data: T;
}): VisionAnnotation<T> => ({
  id,
  createdTime,
  lastUpdatedTime,
  status,
  ...resourceId,
  ...data,
});

export const convertToVisionAnnotations = (
  annotations: CDFAnnotationV2<VisionAnnotationDataType>[]
): VisionAnnotation<VisionAnnotationDataType>[] =>
  annotations.map((annotation) => {
    const cdfInheritedFields: CDFInheritedFields = {
      id: annotation.id,
      createdTime: annotation.createdTime,
      lastUpdatedTime: annotation.lastUpdatedTime,
      status: annotation.status,
      annotatedResourceId: annotation.annotatedResourceId,
    };
    return { ...cdfInheritedFields, ...annotation.data };
  });

export const getAnnotationLabelOrText = (
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string =>
  (annotation as ImageClassification).label ||
  (annotation as ImageObjectDetectionBoundingBox).label ||
  (annotation as ImageObjectDetectionPolygon).label ||
  (annotation as ImageKeypointCollection).label ||
  (annotation as ImageExtractedText).extractedText ||
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
          return acc.concat(annotation);
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
