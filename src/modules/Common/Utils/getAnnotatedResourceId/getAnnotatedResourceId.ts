/* eslint-disable no-nested-ternary */
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/Annotation';

export const getAnnotatedResourceId = ({
  annotation,
}: {
  annotation: VisionAnnotation<VisionAnnotationDataType>;
}): number | undefined =>
  'annotatedResourceId' in annotation
    ? annotation.annotatedResourceId
    : 'annotatedResourceExternalId' in annotation
    ? +annotation.annotatedResourceExternalId
    : undefined;
