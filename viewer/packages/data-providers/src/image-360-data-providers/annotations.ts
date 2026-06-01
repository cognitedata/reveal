import { isCoreDmImage360Annotation } from '@reveal/360-images/src/annotation/typeGuards';
import { DataSourceType } from '../DataSourceType';
import { dmInstanceRefToKey } from '@reveal/utilities';

export function getAnnotationIdKey(annotation: DataSourceType['image360AnnotationType']): string {
  if (isCoreDmImage360Annotation(annotation)) {
    return dmInstanceRefToKey(annotation.annotationIdentifier);
  }

  return `${annotation.id}`;
}
