import {
  AnnotatedResourceIdEither,
  CDFAnnotationDataType,
  CDFAnnotationV2,
  CDFImageClassificationTypeName,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';

/**
 * Annotation types used within vision sub app
 */

export type VisionAnnotationDataType =
  | ImageClassification
  | ImageObjectDetectionBoundingBox
  | ImageObjectDetectionPolygon
  | ImageExtractedText
  | ImageAssetLink;

// Vision Annotation Type

export type CDFInheritedFields = AnnotatedResourceIdEither & // also available in CDFAnnotationV2, cannot be used in Pick operation due to One of relationship
  Pick<
    CDFAnnotationV2<ImageClassification>,
    'createdTime' | 'lastUpdatedTime' | 'status'
  >;

export type VisionAnnotation<Type> = CDFInheritedFields & Type;

export type UnsavedVisionAnnotation = VisionAnnotationDataType & {
  status: Status;
};

export type VisionImageClassificationAnnotation =
  VisionAnnotation<ImageClassification>;
export type VisionImageObjectDetectionBoundingBoxAnnotation =
  VisionAnnotation<ImageObjectDetectionBoundingBox>;
export type VisionImageObjectDetectionPolygonAnnotation =
  VisionAnnotation<ImageObjectDetectionPolygon>;
export type VisionImageExtractedTextAnnotation =
  VisionAnnotation<ImageExtractedText>;
export type VisionImageAssetLinkAnnotation = VisionAnnotation<ImageAssetLink>;
