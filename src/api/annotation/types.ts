import { IdEither } from '@cognite/cdf-sdk-singleton';
import { Annotation, AnnotationRegion, LinkedAnnotation } from 'src/api/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

export interface AnnotationListRequest {
  limit?: number;
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
  'id' | 'createdTime' | 'lastUpdatedTime'
> & { data?: { useCache?: boolean; threshold?: number } };

export interface AnnotationCreateRequest {
  items: UnsavedAnnotation[];
}

type annotationUpdateField<T> = { set: any } | { setNull: true } | T;
export interface AnnotationUpdateRequest {
  items: {
    id: number;
    update: {
      text: annotationUpdateField<string>;
      status: annotationUpdateField<AnnotationStatus>;
      region: annotationUpdateField<AnnotationRegion>;
      data: annotationUpdateField<object>;
    };
  }[];
}
