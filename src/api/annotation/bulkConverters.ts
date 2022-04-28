import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { convertCDFAnnotationV1ToVisionAnnotation } from './converters';
import { CDFAnnotationV1 } from './types';

export const convertCDFAnnotationV1ToVisionAnnotations = (
  annotations: CDFAnnotationV1[]
): VisionAnnotation<VisionAnnotationDataType>[] =>
  annotations
    .map((annotation) => convertCDFAnnotationV1ToVisionAnnotation(annotation))
    .filter((annotation) => {
      return annotation != null;
    }) as VisionAnnotation<VisionAnnotationDataType>[];
