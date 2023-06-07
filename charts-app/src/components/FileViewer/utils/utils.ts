// these types should be imported from SDK
import {
  AnnotationData,
  AnnotationsBoundingBox,
  AnnotationsCogniteAnnotationTypesDiagramsAssetLink,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  AnnotationsDetection,
  AnnotationsExtractedText,
  AnnotationsFileLink,
  AnnotationsJunction,
  AnnotationsLine,
  AnnotationsObjectDetection,
  AnnotationsTextRegion,
  AnnotationsUnhandledSymbolObject,
  AnnotationsUnhandledTextObject,
} from '../sdk/types.gen';

export const isAnnotationDataWithTextRegion = (
  data: AnnotationData
): data is
  | AnnotationsExtractedText
  | AnnotationsTextRegion
  | AnnotationsCogniteAnnotationTypesImagesAssetLink
  | AnnotationsCogniteAnnotationTypesDiagramsAssetLink
  | AnnotationsFileLink
  | AnnotationsUnhandledTextObject =>
  'textRegion' in data && data.textRegion !== undefined;

export const isAnnotationDataWithSymbolRegion = (
  data: AnnotationData
): data is
  | AnnotationsCogniteAnnotationTypesDiagramsAssetLink
  | AnnotationsUnhandledSymbolObject
  | AnnotationsFileLink =>
  'symbolRegion' in data && data.symbolRegion !== undefined;

export const isAnnotationDataWithBoundingBox = (
  data: AnnotationData
): data is AnnotationsDetection | AnnotationsObjectDetection =>
  'boundingBox' in data && data.boundingBox !== undefined;

export const isAnnotationDataWithPolyline = (
  data: AnnotationData
): data is AnnotationsLine | AnnotationsObjectDetection =>
  'polyline' in data && data.polyline !== undefined;

export const isAnnotationDataWithPolygon = (
  data: AnnotationData
): data is AnnotationsObjectDetection =>
  'polygon' in data && data.polygon !== undefined;

export const isAnnotationDataWithPoint = (
  data: AnnotationData
): data is AnnotationsJunction =>
  'position' in data && data.position !== undefined;

export const getBoundingBoxFromAnnotationData = (
  data: AnnotationData
): AnnotationsBoundingBox => {
  if (isAnnotationDataWithTextRegion(data)) {
    return data.textRegion;
  }
  if (isAnnotationDataWithSymbolRegion(data)) {
    return data.symbolRegion;
  }
  if (isAnnotationDataWithBoundingBox(data)) {
    return data.boundingBox!;
  }
  throw new Error(
    'The provided annotation data does not have any bounding box'
  );
};

const hasAssetRef = (data: AnnotationData) => 'assetRef' in data;
const hasFileRef = (data: AnnotationData) => 'fileRef' in data;

export const getRefResourceType = (data: AnnotationData) => {
  if (hasFileRef(data)) {
    return 'file';
  }
  if (hasAssetRef(data)) {
    return 'asset';
  }
  return 'unknown';
};
