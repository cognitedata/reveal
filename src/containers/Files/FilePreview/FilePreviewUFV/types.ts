import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
} from '@cognite/annotations';
import { AnnotationModel } from '@cognite/sdk';

import { RectangleAnnotation } from '@cognite/unified-file-viewer';

export interface ProposedCogniteAnnotation extends PendingCogniteAnnotation {
  id: string;
}
export enum AnnotationSource {
  LOCAL = 'local',
  EVENTS = 'events',
  ANNOTATIONS = 'annotations',
}

export const ANNOTATION_SOURCE_KEY = '__source';

export type TaggedEventAnnotation = {
  [ANNOTATION_SOURCE_KEY]: AnnotationSource.EVENTS;
} & CogniteAnnotation;

export type TaggedAnnotationAnnotation = {
  [ANNOTATION_SOURCE_KEY]: AnnotationSource.ANNOTATIONS;
} & AnnotationModel;

export type TaggedLocalAnnotation = {
  [ANNOTATION_SOURCE_KEY]: AnnotationSource.LOCAL;
} & Pick<
  AnnotationModel,
  'annotationType' | 'annotatedResourceId' | 'annotatedResourceType' | 'data'
>;

export type TaggedAnnotation =
  | TaggedEventAnnotation
  | TaggedAnnotationAnnotation
  | TaggedLocalAnnotation;

// TODO: ExtendedAnnotation is a WIP type that will be exposed via unified-file-viewer
// once it's confirmed that they are fulfilling the desired need
export type ExtendedAnnotation<T extends TaggedAnnotation = TaggedAnnotation> =
  RectangleAnnotation & {
    metadata: T;
  };
