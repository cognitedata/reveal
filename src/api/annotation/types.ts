import { IdEither } from '@cognite/sdk';
import { AnnotationRegion } from 'src/api/vision/detectionModels/types';
import { Keypoint } from 'src/modules/Review/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

// Annotation API types
export type AnnotationType =
  | 'vision/ocr'
  | 'vision/tagdetection'
  | 'vision/objectdetection'
  | 'vision/custommodel'
  | 'user_defined'
  | 'CDF_ANNOTATION_TEMPLATE';

export type AnnotationSource = 'context_api' | 'user';

export type AnnotationMetadata = {
  keypoint?: boolean;
  keypoints?: Keypoint[];
  color?: string;
  confidence?: number;
};

interface BaseAnnotation {
  text: string;
  data?: AnnotationMetadata;
  region?: AnnotationRegion;
  annotatedResourceId: number;
  annotatedResourceExternalId?: string;
  annotatedResourceType: 'file';
  annotationType: AnnotationType;
  source: AnnotationSource;
  status: AnnotationStatus;
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface LinkedAnnotation extends BaseAnnotation {
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset' | 'file';
}

export type Annotation = LinkedAnnotation;

export interface AnnotationListRequest {
  limit?: number;
  cursor?: string;
  filter?: Partial<
    Pick<
      LinkedAnnotation,
      | 'linkedResourceType'
      | 'annotatedResourceType'
      | 'annotationType'
      | 'source'
      | 'text'
    >
  > & { annotatedResourceIds?: IdEither[]; linkedResourceIds: IdEither[] };
}

export type UnsavedAnnotation = Omit<
  Annotation,
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
      data?: annotationUpdateField<AnnotationMetadata>;
    };
  }[];
}
