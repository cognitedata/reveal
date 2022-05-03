import {
  VisionAnnotationDataType,
  VisionAnnotationType,
} from 'src/modules/Common/types/annotation';
import {
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
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
    !isImageObjectDetectionPolygonData(data) &&
    !isImageObjectDetectionBoundingBoxData(data) &&
    !isImageAssetLinkData(data) &&
    !isImageExtractedTextData(data)
  );
};

export const getTypeGuardForVisionAnnotationDataType = (
  visionAnnotationType: VisionAnnotationType
) => {
  switch (visionAnnotationType) {
    case VisionAnnotationType.imageObjectDetectionPolygon:
      return isImageObjectDetectionPolygonData;
    case VisionAnnotationType.imageExtractedText:
      return isImageExtractedTextData;
    case VisionAnnotationType.imageAssetLink:
      return isImageAssetLinkData;
    case VisionAnnotationType.imageKeypointCollection:
      return isImageKeypointCollectionData;
    case VisionAnnotationType.imageClassification:
      return isImageClassificationData;
    case VisionAnnotationType.imageObjectDetectionBoundingBox:
      return isImageObjectDetectionBoundingBoxData;
    default:
      return (_data: VisionAnnotationDataType) => false;
  }
};
