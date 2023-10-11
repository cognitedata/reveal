import {
  CDFAnnotation,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetection,
  Status,
} from '../../../api/annotation/types';

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

export type CDFInheritedFields<Type> = {
  status: Status;
} & Pick<
  CDFAnnotation<Type>,
  | 'id'
  | 'annotatedResourceId'
  | 'createdTime'
  | 'lastUpdatedTime'
  | 'annotationType'
>;

export type VisionAnnotation<Type> = CDFInheritedFields<Type> & Type;

export type UnsavedVisionAnnotation<Type> = { data: Type } & Pick<
  VisionAnnotation<Type>,
  'annotatedResourceId' | 'annotationType' | 'status'
>;

export type VisionImageClassificationAnnotation =
  VisionAnnotation<ImageClassification>;
export type VisionImageObjectDetectionAnnotation =
  VisionAnnotation<ImageObjectDetection>;
export type VisionImageExtractedTextAnnotation =
  VisionAnnotation<ImageExtractedText>;
export type VisionImageAssetLinkAnnotation = VisionAnnotation<ImageAssetLink>;
export type VisionImageKeypointCollectionAnnotation =
  VisionAnnotation<ImageKeypointCollection>;
