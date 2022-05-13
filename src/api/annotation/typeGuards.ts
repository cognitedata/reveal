import {
  CDFAnnotationV1,
  CDFLinkedAnnotationV1,
} from 'src/api/annotation/types';

/* type guards are functions that can differentiate annotations using their exclusive features
useful for selecting a correct validator or for narrowing typescript types */

// CDFAnnotationV1 type guards

export const isAssetLinkedAnnotation = (ann: CDFAnnotationV1): boolean => {
  return !!(ann as CDFLinkedAnnotationV1).linkedResourceType;
};

export const isTextAnnotation = (ann: CDFAnnotationV1): boolean => {
  return (ann as CDFLinkedAnnotationV1).annotationType === 'vision/ocr';
};

export const isKeyPointAnnotation = (ann: CDFAnnotationV1): boolean => {
  return (ann as CDFLinkedAnnotationV1).region?.shape === 'points';
};

export const isObjectAnnotation = (ann: CDFAnnotationV1): boolean => {
  return (
    (ann as CDFLinkedAnnotationV1).annotationType ===
      'vision/objectdetection' ||
    (ann as CDFLinkedAnnotationV1).annotationType === 'vision/custommodel' ||
    (ann as CDFLinkedAnnotationV1).annotationType === 'user_defined'
  );
};

export const isPolygon = (ann: CDFAnnotationV1): boolean => {
  return (ann as CDFLinkedAnnotationV1)?.region?.shape === 'polygon';
};

// todo: add tests and typeguards for valve and gauge reader
