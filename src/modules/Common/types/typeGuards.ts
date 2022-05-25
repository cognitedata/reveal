import { VisionAnnotationDataType } from 'src/modules/Common/types/annotation';
import {
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
} from 'src/api/annotation/types';

// VisionAnnotationDataType typeGuards

const hasLabel = (data: VisionAnnotationDataType) => {
  return 'label' in data;
};

const hasTextRegion = (data: VisionAnnotationDataType) => {
  return 'textRegion' in data;
};

export const isImageObjectDetectionBoundingBoxData = (
  data: VisionAnnotationDataType
): data is ImageObjectDetectionBoundingBox => {
  return hasLabel(data) && 'boundingBox' in data;
};
export const isImageObjectDetectionPolygonData = (
  data: VisionAnnotationDataType
): data is ImageObjectDetectionPolygon => {
  return hasLabel(data) && 'polygon' in data;
};
export const isImageObjectDetectionPolylineData = (
  data: VisionAnnotationDataType
): data is ImageObjectDetectionPolyline => {
  return hasLabel(data) && 'polyline' in data;
};
export const isImageObjectDetectionData = (
  data: VisionAnnotationDataType
): data is ImageObjectDetection => {
  return (
    isImageObjectDetectionBoundingBoxData(data) ||
    isImageObjectDetectionPolygonData(data) ||
    isImageObjectDetectionPolylineData(data)
  );
};
export const isImageExtractedTextData = (
  data: VisionAnnotationDataType
): data is ImageExtractedText => {
  return hasTextRegion(data) && 'extractedText' in data;
};
export const isImageAssetLinkData = (
  data: VisionAnnotationDataType
): data is ImageAssetLink => {
  return hasTextRegion(data) && 'assetRef' in data && 'text' in data;
};
export const isImageKeypointCollectionData = (
  data: VisionAnnotationDataType
): data is ImageKeypointCollection => {
  return hasLabel(data) && 'keypoints' in data;
};
export const isImageClassificationData = (
  data: VisionAnnotationDataType
): data is ImageClassification => {
  return (
    hasLabel(data) &&
    !isImageKeypointCollectionData(data) &&
    !isImageObjectDetectionData(data) &&
    !isImageAssetLinkData(data) &&
    !isImageExtractedTextData(data)
  );
};

export const getTypeGuardForVisionAnnotationDataType = (
  visionAnnotationType: CDFAnnotationTypeEnum
) => {
  switch (visionAnnotationType) {
    case CDFAnnotationTypeEnum.ImagesObjectDetection:
      return isImageObjectDetectionData;
    case CDFAnnotationTypeEnum.ImagesTextRegion:
      return isImageExtractedTextData;
    case CDFAnnotationTypeEnum.ImagesAssetLink:
      return isImageAssetLinkData;
    case CDFAnnotationTypeEnum.ImagesKeypointCollection:
      return isImageKeypointCollectionData;
    case CDFAnnotationTypeEnum.ImagesClassification:
      return isImageClassificationData;
    default:
      console.error(
        'type guard not found for provided vision annotation data type!',
        visionAnnotationType
      );
      return (_data: VisionAnnotationDataType) => false;
  }
};
