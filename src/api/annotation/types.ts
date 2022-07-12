import { CogniteInternalId, ExternalId, InternalId } from '@cognite/sdk';
import { AnnotationStatus } from '@cognite/sdk-playground';

// Constants
export enum RegionShape {
  Points = 'points',
  Rectangle = 'rectangle',
  Polygon = 'polygon',
  Polyline = 'polyline',
}

export enum Status {
  Suggested = 'suggested',
  Approved = 'approved',
  Rejected = 'rejected',
}

// Primitives
export type Label = {
  label: string;
};

export type Confidence = {
  confidence: number;
};

export type Point = {
  x: number;
  y: number;
};

export type BoundingBox = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

export type Polygon = {
  vertices: Point[];
};

export type Polyline = {
  vertices: Point[];
};

export type TextRegion = {
  textRegion: BoundingBox;
};

export type Keypoint = Partial<Confidence> & {
  point: Point;
};

export type Timestamp = number;

export type NumericalAttribute = {
  type: 'numerical';
  value: number;
  description?: string;
};

export type BooleanAttribute = {
  type: 'boolean';
  value: boolean;
  description?: string;
};

export type UnitAttribute = {
  type: 'unit';
  value: string;
  description?: string;
};

export type AnnotationAttributes = {
  attributes: {
    [key: string]: NumericalAttribute | BooleanAttribute | UnitAttribute;
  };
};

export interface AnnotatedResourceId {
  annotatedResourceId: CogniteInternalId;
}

// Data field Types

// Image types
export type ImageClassification = Label &
  Partial<Confidence & AnnotationAttributes>;

export type ImageObjectDetectionBoundingBox = ImageClassification & {
  boundingBox: BoundingBox;
};

export type ImageObjectDetectionPolygon = ImageClassification & {
  polygon: Polygon;
};

export type ImageObjectDetectionPolyline = ImageClassification & {
  polyline: Polyline;
};

export type ImageObjectDetection =
  | ImageObjectDetectionBoundingBox
  | ImageObjectDetectionPolygon
  | ImageObjectDetectionPolyline;

export type ImageExtractedText = TextRegion &
  Partial<Confidence & AnnotationAttributes> & {
    text: string;
  };

export type ImageAssetLink = TextRegion &
  Partial<Confidence & AnnotationAttributes> & {
    text: string;
    assetRef: InternalId & Partial<ExternalId>;
  };

export type ImageKeypointCollection = ImageClassification & {
  keypoints: Record<string, Keypoint>;
};

export enum CDFAnnotationTypeEnum {
  ImagesObjectDetection = 'images.ObjectDetection',
  ImagesClassification = 'images.Classification',
  ImagesTextRegion = 'images.TextRegion',
  ImagesAssetLink = 'images.AssetLink',
  ImagesKeypointCollection = 'images.KeypointCollection',
}

export type CDFAnnotationType<Type> = Type extends ImageObjectDetection
  ? CDFAnnotationTypeEnum.ImagesObjectDetection
  : Type extends ImageAssetLink
  ? CDFAnnotationTypeEnum.ImagesAssetLink
  : Type extends ImageExtractedText
  ? CDFAnnotationTypeEnum.ImagesTextRegion
  : Type extends ImageKeypointCollection
  ? CDFAnnotationTypeEnum.ImagesKeypointCollection
  : Type extends ImageClassification
  ? CDFAnnotationTypeEnum.ImagesClassification
  : never;

export type CDFAnnotationV2<Type> = AnnotatedResourceId & {
  id: number;
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
  annotatedResourceType: 'file';
  status: AnnotationStatus;
  annotationType: CDFAnnotationType<Type>;
  data: Type;
  linkedResourceType: 'file' | 'asset';
};
