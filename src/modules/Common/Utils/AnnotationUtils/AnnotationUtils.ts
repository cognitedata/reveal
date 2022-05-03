import {
  AnnotatedResourceId,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';

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

export const getAnnotationLabelText = (
  annotation: VisionAnnotation<VisionAnnotationDataType>
): string =>
  (annotation as ImageClassification).label ||
  (annotation as ImageObjectDetectionBoundingBox).label ||
  (annotation as ImageObjectDetectionPolygon).label ||
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
    if (filter.annotationText) {
      filteredAnnotations = filteredAnnotations.filter(
        (annotation) =>
          getAnnotationLabelText(annotation) === filter.annotationText
      );
    }
  }
  return filteredAnnotations;
};
