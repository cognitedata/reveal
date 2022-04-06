import { CDFAnnotationV1, LinkedAnnotation } from 'src/api/annotation/types';

/* type guards are functions that can differentiate annotations using their exclusive features
useful for selecting a correct validator or for narrowing typescript types */

// CDFAnnotationV1 type guards

export const isAssetLinkedAnnotation = (ann: CDFAnnotationV1): boolean => {
  return !!(ann as LinkedAnnotation).linkedResourceType;
};

export const isTextAnnotation = (ann: CDFAnnotationV1): boolean => {
  return (ann as LinkedAnnotation).annotationType === 'vision/ocr';
};

export const isKeyPointAnnotation = (ann: CDFAnnotationV1): boolean => {
  return (ann as LinkedAnnotation).region?.shape === 'points';
};

export const isObjectAnnotation = (ann: CDFAnnotationV1): boolean => {
  return (
    (ann as LinkedAnnotation).annotationType === 'vision/objectdetection' ||
    (ann as LinkedAnnotation).annotationType === 'vision/custommodel' ||
    (ann as LinkedAnnotation).annotationType === 'user_defined'
  );
};

export const isPolygon = (ann: CDFAnnotationV1): boolean => {
  return (ann as LinkedAnnotation)?.region?.shape === 'polygon';
};
