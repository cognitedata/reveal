import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { VisionAnnotationV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

export const groupAnnotationsByFile = (
  annotations:
    | VisionAnnotationV1[]
    | VisionAnnotation<VisionAnnotationDataType>[]
): Map<
  number,
  (VisionAnnotationV1 | VisionAnnotation<VisionAnnotationDataType>)[]
> => {
  const fileAnnotationMap = new Map<
    number,
    (VisionAnnotationV1 | VisionAnnotation<VisionAnnotationDataType>)[]
  >();

  // eslint-disable-next-line no-restricted-syntax
  for (const annotation of annotations) {
    const fileId = annotation.annotatedResourceId;
    if (fileAnnotationMap.has(fileId)) {
      if (
        !fileAnnotationMap
          .get(fileId)
          ?.map((ann) => ann.id)
          .includes(annotation.id)
      ) {
        fileAnnotationMap.get(fileId)?.push(annotation);
      }
    } else {
      fileAnnotationMap.set(fileId, [annotation]);
    }
  }
  return fileAnnotationMap;
};
