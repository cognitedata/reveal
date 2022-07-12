import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { LegacyVisionAnnotation } from 'src/api/annotation/legacyTypes';

export const groupAnnotationsByFile = (
  annotations:
    | LegacyVisionAnnotation[]
    | VisionAnnotation<VisionAnnotationDataType>[]
): Map<
  number,
  (LegacyVisionAnnotation | VisionAnnotation<VisionAnnotationDataType>)[]
> => {
  const fileAnnotationMap = new Map<
    number,
    (LegacyVisionAnnotation | VisionAnnotation<VisionAnnotationDataType>)[]
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
