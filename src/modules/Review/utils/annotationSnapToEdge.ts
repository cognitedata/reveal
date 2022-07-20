import { BoundingBox } from 'src/api/annotation/types';
import {
  UnsavedVisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { isImageObjectDetectionBoundingBoxData } from 'src/modules/Common/types/typeGuards';

export const annotationSnapToEdge = (
  annotation: Omit<
    UnsavedVisionAnnotation<VisionAnnotationDataType>,
    'annotatedResourceId'
  >
) => {
  const { data } = annotation;
  if (isImageObjectDetectionBoundingBoxData(data)) {
    const { boundingBox } = data;
    const keys = Object.keys(boundingBox) as Array<keyof BoundingBox>;
    keys.forEach((key) => {
      if (boundingBox[key] < 0) {
        boundingBox[key] = 0;
      }
      if (boundingBox[key] > 1) {
        boundingBox[key] = 1;
      }
    });
    return { ...annotation, data: { ...data, boundingBox } };
  }
  return annotation;
};
