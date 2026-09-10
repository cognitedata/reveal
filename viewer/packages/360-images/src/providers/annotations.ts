/*!
 * Copyright 2026 Cognite AS
 */
import { isCoreDmImage360Annotation } from '../annotation/typeGuards';
import type { DataSourceType } from '@reveal/data-providers';
import { dmInstanceRefToKey } from '@reveal/utilities';

export function getAnnotationIdKey(annotation: DataSourceType['image360AnnotationType']): string {
  if (isCoreDmImage360Annotation(annotation)) {
    return dmInstanceRefToKey(annotation.annotationIdentifier);
  }

  return `${annotation.id}`;
}
