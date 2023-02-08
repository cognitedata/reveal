import {
  AnnotationData,
  AnnotationsBoundingBox,
  AnnotationsCogniteAnnotationTypesDiagramsAssetLink,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  AnnotationsDetection,
  AnnotationsExtractedText,
  AnnotationsFileLink,
  AnnotationsObjectDetection,
  AnnotationsTextRegion,
  AnnotationsUnhandledSymbolObject,
  AnnotationsUnhandledTextObject,
} from '@cognite/sdk';
import { AnnotationModel } from '@cognite/sdk/dist/src';

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

export const getBoundingBoxFromAnnotationIfDefined = (
  annotation: AnnotationModel
): AnnotationsBoundingBox | undefined => {
  if (isAnnotationDataWithTextRegion(annotation.data)) {
    return annotation.data.textRegion;
  }
  if (isAnnotationDataWithSymbolRegion(annotation.data)) {
    return annotation.data.symbolRegion;
  }
  if (isAnnotationDataWithBoundingBox(annotation.data)) {
    return annotation.data.boundingBox!;
  }

  return undefined;
};

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
