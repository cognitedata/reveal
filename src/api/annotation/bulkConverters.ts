import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { convertCDFAnnotationV1ToVisionAnnotation } from './converters';
import { CDFAnnotationV1 } from './types';

export const convertCDFAnnotationV1ToVisionAnnotations = (
  annotations: CDFAnnotationV1[]
): VisionAnnotation<VisionAnnotationDataType>[] =>
  annotations.reduce(
    (acc: VisionAnnotation<VisionAnnotationDataType>[], item) => {
      const convertedAnnotation =
        convertCDFAnnotationV1ToVisionAnnotation(item);
      if (convertedAnnotation) {
        return acc.concat(convertedAnnotation);
      }
      return acc;
    },
    []
  );
