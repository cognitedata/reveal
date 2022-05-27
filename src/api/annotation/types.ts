import {
  CogniteInternalId,
  ExternalId,
  IdEither,
  InternalId,
} from '@cognite/sdk';
import { AnnotationRegion } from 'src/api/vision/detectionModels/types';
import { LegacyKeypoint } from 'src/modules/Review/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

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

export type ImageKeypoint = Label &
  Partial<Confidence> & {
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
  Partial<Confidence> & {
    extractedText: string;
  };

export type ImageAssetLink = TextRegion &
  Partial<Confidence> & {
    text: string;
    assetRef: InternalId & Partial<ExternalId>;
  };

export type ImageKeypointCollection = ImageClassification & {
  keypoints: ImageKeypoint[];
};

// Annotation API V2 types todo: remove this and import correct type from @cognite/sdk when v2 becomes available
export type CDFAnnotationStatus =
  | `${Status.Suggested}`
  | `${Status.Approved}`
  | `${Status.Rejected}`;

export enum CDFAnnotationTypeEnum {
  ImagesObjectDetection = 'images.ObjectDetection',
  ImagesClassification = 'images.Classification',
  ImagesTextRegion = 'images.TextRegion',
  ImagesAssetLink = 'images.AssetLink',
  ImagesKeypointCollection = 'images.KeypointCollection',
}

export type CDFAnnotationType<Type> = Type extends ImageObjectDetection
  ? CDFAnnotationTypeEnum.ImagesObjectDetection
  : Type extends ImageExtractedText
  ? CDFAnnotationTypeEnum.ImagesTextRegion
  : Type extends ImageAssetLink
  ? CDFAnnotationTypeEnum.ImagesAssetLink
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
  status: CDFAnnotationStatus;
  annotationType: CDFAnnotationType<Type>;
  data: Type;
  linkedResourceType: 'file' | 'asset';
};
// Annotation API types
export type AnnotationTypeV1 =
  | 'vision/ocr'
  | 'vision/tagdetection'
  | 'vision/objectdetection'
  | 'vision/gaugereader'
  | 'vision/custommodel'
  | 'user_defined'
  | 'CDF_ANNOTATION_TEMPLATE';

export type AnnotationSourceV1 = 'context_api' | 'user';

export type AnnotationMetadataV1 = Partial<AnnotationAttributes> & {
  keypoint?: boolean;
  keypoints?: LegacyKeypoint[];
  color?: string;
  confidence?: number;
};

interface CDFBaseAnnotationV1 {
  text: string;
  data?: AnnotationMetadataV1;
  region?: AnnotationRegion;
  annotatedResourceId: number;
  annotatedResourceExternalId?: string;
  annotatedResourceType: 'file';
  annotationType: AnnotationTypeV1;
  source: AnnotationSourceV1;
  status: AnnotationStatus;
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface CDFLinkedAnnotationV1 extends CDFBaseAnnotationV1 {
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset' | 'file';
}

export type CDFAnnotationV1 = CDFLinkedAnnotationV1;

export interface AnnotationListRequest {
  limit?: number;
  cursor?: string;
  filter?: Partial<
    Pick<
      CDFLinkedAnnotationV1,
      | 'linkedResourceType'
      | 'annotatedResourceType'
      | 'annotationType'
      | 'source'
      | 'text'
    >
  > & { annotatedResourceIds?: IdEither[]; linkedResourceIds: IdEither[] };
}

export type UnsavedAnnotation = Omit<
  CDFAnnotationV1,
  'id' | 'createdTime' | 'lastUpdatedTime' | 'status'
> & {
  data?: { useCache?: boolean; threshold?: number };
  status?: AnnotationStatus;
};

export interface AnnotationCreateRequest {
  items: UnsavedAnnotation[];
}

type annotationUpdateField<T> = { set: any } | { setNull: true } | T;
export interface AnnotationUpdateRequest {
  items: {
    id: number;
    update: {
      text?: annotationUpdateField<string>;
      status?: annotationUpdateField<AnnotationStatus>;
      region?: annotationUpdateField<AnnotationRegion>;
      data?: annotationUpdateField<AnnotationMetadataV1>;
    };
  }[];
}
