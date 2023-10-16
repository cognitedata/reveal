import { AnnotatedResourceType, AnnotationStatus } from '@cognite/sdk';

export type AnnotationType =
  | 'diagrams.AssetLink'
  | 'diagrams.FileLink'
  | 'diagrams.InstanceLink'
  | 'diagrams.Junction'
  | 'diagrams.Line'
  | 'diagrams.UnhandledSymbolObject'
  | 'diagrams.UnhandledTextObject'
  | 'documents.ExtractedText'
  | 'forms.Detection'
  | 'images.AssetLink'
  | 'images.Classification'
  | 'images.InstanceLink'
  | 'images.KeypointCollection'
  | 'images.ObjectDetection'
  | 'images.TextRegion'
  | 'pointcloud.BoundingVolume';

export interface AnnotationReverseLookupFilterProps {
  annotatedResourceType: AnnotatedResourceType;
  annotationType?: AnnotationType;
  creatingApp?: string;
  creatingAppVersion?: string;
  creatingUser?: string;
  data?: Record<string, any>;
  status?: AnnotationStatus;
}
