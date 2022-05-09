import {
  AnnotatedResourceId,
  CDFAnnotationV2,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';

/**
 * Annotation types used within vision sub app
 */

export enum ImageAnnotationType {
  ImagesClassification = 'images.Classification',
  ImagesObjectDetectionBoundingBox = 'images.ObjectDetectionBoundingBox',
  ImagesObjectDetectionPolygon = 'images.ObjectDetectionPolygon',
  ImagesExtractedText = 'images.ExtractedText',
  ImagesAssetLink = 'images.AssetLink',
  ImagesKeypointCollection = 'images.KeypointCollection',
}

export type VisionAnnotationDataType =
  | ImageClassification
  | ImageObjectDetectionBoundingBox
  | ImageObjectDetectionPolygon
  | ImageExtractedText
  | ImageAssetLink
  | ImageKeypointCollection;

// Vision Annotation Type

export type CDFInheritedFields = AnnotatedResourceId & // also available in CDFAnnotationV2, cannot be used in Pick operation due to One of relationship
  Pick<
    CDFAnnotationV2<ImageClassification>,
    'id' | 'createdTime' | 'lastUpdatedTime' | 'status'
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
export type VisionImageKeypointCollectionAnnotation =
  VisionAnnotation<ImageKeypointCollection>;
