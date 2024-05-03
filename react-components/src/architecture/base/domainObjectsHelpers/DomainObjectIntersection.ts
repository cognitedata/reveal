/*!
 * Copyright 2024 Cognite AS
 */

import { type CustomObjectIntersection, type AnyIntersection } from '@cognite/reveal';
import { type DomainObject } from '../domainObjects/DomainObject';

// DomainObjectIntersection extends the CustomObjectIntersection with a domainObject property.
// This had been a lot simpler with object orienteted intersection objects, but Reveal has of some
// unknown reason used types here - to make it hard for us to extend them.
// It is working but I don't like it at all.

export type DomainObjectIntersection = CustomObjectIntersection & { domainObject: DomainObject };

export function isDomainObjectIntersection(
  intersection: AnyIntersection | undefined
): intersection is DomainObjectIntersection {
  const domainObjectIntersection = intersection as DomainObjectIntersection;
  return domainObjectIntersection.domainObject !== undefined;
}

export function isCustomObjectIntersection(
  intersection: AnyIntersection | undefined
): intersection is CustomObjectIntersection {
  if (intersection?.type !== 'customObject') {
    return false;
  }
  return true;
}
