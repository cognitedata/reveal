import {
  AnnotatedResourceId,
  CDFAnnotationV2,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetection,
  Status,
} from 'src/api/annotation/types';

/**
 * Annotation types used within vision sub app
 */
export type VisionAnnotationDataType =
  | ImageClassification
  | ImageObjectDetection
  | ImageExtractedText
  | ImageAssetLink
  | ImageKeypointCollection;

// Vision Annotation Type

export type CDFInheritedFields<Type> = AnnotatedResourceId & // also available in CDFAnnotationV2, cannot be used in Pick operation due to One of relationship
  Pick<
    CDFAnnotationV2<Type>,
    'id' | 'createdTime' | 'lastUpdatedTime' | 'status' | 'annotationType'
  >;

export type VisionAnnotation<Type> = CDFInheritedFields<Type> & Type;

export type UnsavedVisionAnnotation = VisionAnnotationDataType & {
  status: Status;
};

export type VisionImageClassificationAnnotation =
  VisionAnnotation<ImageClassification>;
export type VisionImageObjectDetectionAnnotation =
  VisionAnnotation<ImageObjectDetection>;
export type VisionImageExtractedTextAnnotation =
  VisionAnnotation<ImageExtractedText>;
export type VisionImageAssetLinkAnnotation = VisionAnnotation<ImageAssetLink>;
export type VisionImageKeypointCollectionAnnotation =
  VisionAnnotation<ImageKeypointCollection>;
