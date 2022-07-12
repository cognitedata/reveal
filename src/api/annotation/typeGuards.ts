import { LegacyAnnotation } from './legacyTypes';

/* type guards are functions that can differentiate annotations using their exclusive features
useful for selecting a correct validator or for narrowing typescript types */

// LegacyAnnotation type guards

export const isAssetLinkedAnnotation = (ann: LegacyAnnotation): boolean => {
  return !!(ann as LegacyAnnotation).linkedResourceType;
};

export const isTextAnnotation = (ann: LegacyAnnotation): boolean => {
  return (ann as LegacyAnnotation).annotationType === 'vision/ocr';
};

export const isKeyPointAnnotation = (ann: LegacyAnnotation): boolean => {
  return (ann as LegacyAnnotation).region?.shape === 'points';
};

export const isObjectAnnotation = (ann: LegacyAnnotation): boolean => {
  return (
    (ann as LegacyAnnotation).annotationType === 'vision/objectdetection' ||
    (ann as LegacyAnnotation).annotationType === 'vision/custommodel' ||
    (ann as LegacyAnnotation).annotationType === 'vision/gaugereader' ||
    (ann as LegacyAnnotation).annotationType === 'user_defined'
  );
};

export const isPolygon = (ann: LegacyAnnotation): boolean => {
  return (ann as LegacyAnnotation)?.region?.shape === 'polygon';
};

export const isPolyline = (ann: LegacyAnnotation): boolean => {
  return (ann as LegacyAnnotation)?.region?.shape === 'polyline';
};

// todo: add tests and typeguards for valve and gauge reader
