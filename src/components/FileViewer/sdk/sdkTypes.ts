// copied form https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/src/types.ts

import { CogniteInternalId } from '@cognite/sdk-core';
import { AnnotationData } from './types.gen';

export type AnnotatedResourceType = 'file' | 'threedmodel';
export type AnnotationStatus = 'suggested' | 'approved' | 'rejected';

export type AnnotationType = string;

export interface AnnotationModel extends AnnotationCreate {
  id: CogniteInternalId;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface AnnotationCreate extends AnnotationSuggest {
  status: AnnotationStatus;
}

export interface AnnotationSuggest {
  annotatedResourceType: AnnotatedResourceType;
  annotatedResourceId: CogniteInternalId;
  annotationType: AnnotationType;
  creatingApp: string;
  creatingAppVersion: string;
  creatingUser: string | null;
  data: AnnotationData;
}
