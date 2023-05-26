import { AnnotationModel } from '@cognite/sdk';
import { Annotation, RectangleAnnotation } from '@cognite/unified-file-viewer';

import { ANNOTATION_SOURCE_KEY } from '../constants';

export enum AnnotationSource {
  LOCAL = 'local',
  EVENTS = 'events',
  ANNOTATIONS = 'annotations',
}

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
  | TaggedAnnotationAnnotation
  | TaggedLocalAnnotation;

export type ExtendedAnnotation<T extends TaggedAnnotation = TaggedAnnotation> =
  Extract<Annotation<T>, RectangleAnnotation>;
