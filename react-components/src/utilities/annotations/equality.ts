/*!
 * Copyright 2025 Cognite AS
 */
import { type Image360AnnotationId } from './types';
import { isClassicImage360AnnotationId, isDMImage360AnnotationId } from './typeGuards';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { isSameDmsId } from '../instanceIds';

export function isSameImage360AnnotationId(
  id0: Image360AnnotationId,
  id1: Image360AnnotationId
): boolean {
  return (
    (isDMImage360AnnotationId(id0) &&
      isDMImage360AnnotationId(id1) &&
      isSameDMAnnotationId(id0, id1)) ||
    (isClassicImage360AnnotationId(id0) && isClassicImage360AnnotationId(id1) && id0 === id1)
  );
}

export function isSameDMAnnotationId(id0: DmsUniqueIdentifier, id1: DmsUniqueIdentifier): boolean {
  return isSameDmsId(id0, id1);
}
