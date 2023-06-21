import {
  CDFAnnotationType,
  CDFAnnotationTypeEnum,
  Status,
} from '@vision/api/annotation/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '@vision/modules/Common/types';

import { AnnotationModel } from '@cognite/sdk';

export const convertCDFAnnotationToVisionAnnotations = (
  annotations: AnnotationModel[]
): VisionAnnotation<VisionAnnotationDataType>[] =>
  annotations.reduce<VisionAnnotation<VisionAnnotationDataType>[]>(
    (ann, nextAnnotation) => {
      const status = nextAnnotation.status as Status;
      const annotationType =
        nextAnnotation.annotationType as CDFAnnotationType<VisionAnnotationDataType>;

      // if CDF annotation has valid status and annotation type
      if (
        status &&
        annotationType &&
        Object.values(CDFAnnotationTypeEnum).includes(annotationType)
      ) {
        const nextVisionAnnotation: VisionAnnotation<VisionAnnotationDataType> =
          {
            id: nextAnnotation.id,
            createdTime: nextAnnotation.createdTime.getTime(),
            lastUpdatedTime: nextAnnotation.lastUpdatedTime.getTime(),
            status,
            annotatedResourceId: nextAnnotation.annotatedResourceId!, // annotatedResourceId will be mandatory in api soon
            annotationType,
            ...(nextAnnotation.data as VisionAnnotationDataType),
          };
        return [...ann, nextVisionAnnotation];
      }

      return ann;
    },
    []
  );
