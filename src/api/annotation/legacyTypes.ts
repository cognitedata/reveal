import { IdEither } from '@cognite/sdk';
import {
  AnnotationRegion,
  RegionType,
  Vertex,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import { PredefinedKeypoint } from 'src/modules/Review/types';
import { AnnotationAttributes } from './types';

/**
 * Legacy Annotation Types
 */
export type LegacyAnnotationType =
  | 'vision/ocr'
  | 'vision/tagdetection'
  | 'vision/objectdetection'
  | 'vision/gaugereader'
  | 'vision/custommodel'
  | 'user_defined'
  | 'CDF_ANNOTATION_TEMPLATE';
export type LegacyAnnotationSource = 'context_api' | 'user';
export type LegacyAnnotationMetadata = Partial<AnnotationAttributes> & {
  keypoint?: boolean;
  keypoints?: PredefinedKeypoint[];
  color?: string;
  confidence?: number;
};

interface LegacyAnnotationBase {
  text: string;
  data?: LegacyAnnotationMetadata;
  region?: AnnotationRegion;
  annotatedResourceId: number;
  annotatedResourceExternalId?: string;
  annotatedResourceType: 'file';
  annotationType: LegacyAnnotationType;
  source: LegacyAnnotationSource;
  status: LegacyAnnotationStatus;
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export enum LegacyAnnotationStatus {
  Verified = 'verified',
  Rejected = 'rejected',
  Deleted = 'deleted', // todo: remove this once this is not needed
  Unhandled = 'unhandled',
}

export interface LegacyAnnotation extends LegacyAnnotationBase {
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset' | 'file';
}

export interface LegacyAnnotationListRequest {
  limit?: number;
  cursor?: string;
  filter?: Partial<
    Pick<
      LegacyAnnotation,
      | 'linkedResourceType'
      | 'annotatedResourceType'
      | 'annotationType'
      | 'source'
      | 'text'
    >
  > & { annotatedResourceIds?: IdEither[]; linkedResourceIds: IdEither[] };
}

export type LegacyUnsavedAnnotation = Omit<
  LegacyAnnotation,
  'id' | 'createdTime' | 'lastUpdatedTime' | 'status'
> & {
  data?: { useCache?: boolean; threshold?: number };
  status?: LegacyAnnotationStatus;
};

export interface LegacyAnnotationCreateRequest {
  items: LegacyUnsavedAnnotation[];
}

type annotationUpdateField<T> = { set: any } | { setNull: true } | T;

export interface LegacyAnnotationUpdateRequest {
  items: {
    id: number;
    update: {
      text?: annotationUpdateField<string>;
      status?: annotationUpdateField<LegacyAnnotationStatus>;
      region?: annotationUpdateField<AnnotationRegion>;
      data?: annotationUpdateField<LegacyAnnotationMetadata>;
    };
  }[];
}

export type LegacyKeypointData = Required<PredefinedKeypoint> & {
  id: string;
  selected: boolean;
};
export type LegacyKeypointVertex = Vertex & LegacyKeypointData;
export type LegacyAnnotationRegion = Pick<AnnotationRegion, 'shape'> & {
  vertices: Array<Vertex | LegacyKeypointVertex>;
};
export type LegacyVisionAnnotation = Omit<
  LegacyAnnotation,
  | 'linkedResourceId'
  | 'linkedResourceExternalId'
  | 'linkedResourceType'
  | 'region'
> & {
  region?: LegacyAnnotationRegion;
  label: string;
  type: RegionType;
  color: string;
  modelType: VisionDetectionModelType;
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset';
};
