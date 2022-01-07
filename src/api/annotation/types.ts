import { IdEither } from '@cognite/sdk';
import {
  Annotation,
  AnnotationMetadata,
  AnnotationRegion,
  LinkedAnnotation,
} from 'src/api/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

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
