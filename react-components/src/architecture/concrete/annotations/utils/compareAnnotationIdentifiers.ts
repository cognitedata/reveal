/*!
 * Copyright 2024 Cognite AS
 */

import { type AnnotationIdentifier } from './types';

export function compareAnnotationIdentifiers(
  a: AnnotationIdentifier,
  b: AnnotationIdentifier
): boolean {
  if (a.source === 'asset-centric' && b.source === 'asset-centric') {
    return a.id === b.id;
  } else if (a.source === 'fdm' && b.source === 'fdm') {
    return a.space === b.space && a.externalId === b.externalId;
  }
  return false;
}
